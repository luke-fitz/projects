import os
import pandas as pd
import uuid

# Change as needed
BASE_DIR = r'C:\Users\lukef\Documents\projects\fetch_rewards'

def get_nested_value(json_column, *keys):
    """
    Retrieves nested values from a JSON-like pandas Series by applying successive key lookups.
    Prepends '$' to each key before retrieval.
    """
    flattened_column = json_column

    for key in keys:
        flattened_column = flattened_column.apply(lambda x: x.get('$' + key) if isinstance(x, dict) else None)

    return flattened_column


def get_datetime_from_unix_json(json_column, date_key="date"):
    """
    Converts Unix timestamps (in milliseconds) found under a specified key in a JSON-like Series to pandas datetime objects.
    """
    unix_date = get_nested_value(json_column, date_key)
    pandas_date = pd.to_datetime(unix_date, unit='ms')
    return pandas_date


def create_items_table_from_json(df, json_column, id_column):
    """
    Explodes a JSON array column in a dataframe into separate rows and flattens each item into columns,
    retaining the original identifier column.
    """
    items_df = df.explode(json_column)
    items_df = items_df.dropna(subset=[json_column])
    items_df = pd.concat([
        items_df[[id_column]],
        items_df[json_column].apply(pd.Series)
    ], axis=1)
    return items_df

def cleanse_brands(raw_data_dir, cleansed_data_dir):
    """
    Reads raw brands data, extracts and flattens nested JSON fields, selects relevant columns,
    and exports the cleansed dataframe to a parquet file.
    """

    # Read raw data
    df = pd.read_json(raw_data_dir + '/brands.json', lines=True)

    # Flatten JSON fields
    df['brandId'] = get_nested_value(df['_id'], 'oid')
    df['cpgId'] = get_nested_value(df['cpg'], 'id', 'oid')
    df['cpgRef'] = get_nested_value(df['cpg'], 'ref')

    # Keep only the cleansed columns
    df = df.loc[:, ['brandId', 'barcode', 'categoryCode', 'category', 'cpgId', 'cpgRef', 'name', 'topBrand', 'brandCode']]

    # Export cleansed data
    df.to_parquet(cleansed_data_dir + '/dim_brands.parquet')

def cleanse_users(raw_data_dir, cleansed_data_dir):
    """
    Reads raw users data, extracts and flattens nested JSON fields, selects relevant columns,
    and exports the cleansed dataframe to a parquet file.
    """

    # Read raw data
    df = pd.read_json(raw_data_dir + '/users.json', lines=True)

    # Flatten JSON fields
    df['userId'] = get_nested_value(df['_id'], 'oid')

    # Transform UNIX fields to datetime
    df['createdDateTime'] = get_datetime_from_unix_json(df['createdDate'])
    df['lastLoginDateTime'] = get_datetime_from_unix_json(df['lastLogin'])

    # Keep only the cleansed columns
    df = df.loc[:, ['userId', 'active', 'createdDateTime', 'lastLoginDateTime', 'role', 'signUpSource', 'state']]

    # Export cleansed data
    df.to_parquet(cleansed_data_dir + '/dim_users.parquet')

def cleanse_receipts(raw_data_dir, cleansed_data_dir):
    """
    Reads raw receipts data, extracts and flattens nested JSON fields, selects relevant columns,
    creates a receipt items data frame, and exports the cleansed dataframes to parquet files.
    """

    # Read raw data
    df = pd.read_json(raw_data_dir + '/receipts.json', lines=True)

    # Flatten JSON fields
    df['receiptId'] = get_nested_value(df['_id'], 'oid')
    assert(df['receiptId'].nunique()) == len(df['receiptId']) # Unique ID for receipt item table

    # Transform UNIX fields to datetime
    df['createDateTime'] = get_datetime_from_unix_json(df['createDate'])
    df['scannedDateTime'] = get_datetime_from_unix_json(df['dateScanned'])
    df['finishedDateTime'] = get_datetime_from_unix_json(df['finishedDate'])
    df['modifyDateTime'] = get_datetime_from_unix_json(df['modifyDate'])
    df['pointsAwardedDateTime'] = get_datetime_from_unix_json(df['pointsAwardedDate'])
    df['purchaseDateTime'] = get_datetime_from_unix_json(df['purchaseDate'])

    # Line items table
    items_df = create_items_table_from_json(df, 'rewardsReceiptItemList', 'receiptId')

    # Create unique ID
    items_df['receiptItemId'] = [str(uuid.uuid4()) for _ in range(len(items_df))]
    cols = ['receiptItemId'] + [col for col in items_df.columns if col != 'receiptItemId']
    items_df = items_df[cols]

    # Format numeric columns
    float_columns = ['finalPrice', 'itemPrice', 'preventTargetGapPoints', 'userFlaggedPrice', 'discountedItemPrice', 'targetPrice','originalFinalPrice', 'originalMetaBriteItemPrice', 'priceAfterCoupon']
    for column in float_columns:
        items_df[column] = items_df[column].astype(float)
        
    # Keep only the cleansed columns of receipts table
    df = df.loc[:, ['receiptId', 'bonusPointsEarned', 'bonusPointsEarnedReason', 'createDateTime', 'scannedDateTime', 'finishedDateTime', 'modifyDateTime', 'pointsAwardedDateTime', 'pointsEarned', 'purchaseDateTime', 'purchasedItemCount', 'rewardsReceiptStatus', 'totalSpent', 'userId']]
    
    # Export cleansed data
    df.to_parquet(cleansed_data_dir + '/fact_receipts.parquet')
    items_df.to_parquet(cleansed_data_dir + '/fact_receipt_items.parquet')


def main():
    # Define data paths
    data_dir = BASE_DIR + '/data'
    raw_data_dir = os.path.join(data_dir, 'raw')
    cleansed_data_dir = os.path.join(data_dir, 'cleansed')

    # Ensure output directory exists
    os.makedirs(cleansed_data_dir, exist_ok=True)

    # Pipeline steps
    cleanse_brands(raw_data_dir, cleansed_data_dir)
    cleanse_users(raw_data_dir, cleansed_data_dir)
    cleanse_receipts(raw_data_dir, cleansed_data_dir)


if __name__ == "__main__":
    main()