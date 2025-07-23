Hi,

I've completed an initial build of the data model, pipeline, and business analysis queries (links included in the repo). Below is a summary of key findings, open questions, and suggested next steps.

**Data quality issues**
I have added detailed notes about data quality issues in the notebook. The most significant issues are:
- Low referential integrity, e.g., around 25% of brandCode values in the receipt items table do not join to the brands table.
- The users table contains many duplicate rows.
- brandName appears to contain junk values. More investigation is required.
- There is a high percentage of missing values in some fields, which may or may not be valid depending on business definitions.

**Questions about the data**
- What are the valid values and formats for each column across the datasets?
- How are purchased items on receipts linked to brands in the brands dataset? Is barcode or brandCode the correct key?
- Can you confirm uniqueness constraints (e.g. userId, receiptId) to ensure data quality rules are correctly applied?
- If a receipt has a missing totalSpent, should I infer total spend by summing item prices, or treat it as incomplete data?
- Are there other columns in the fact_receipt_items table that I should expect or model?
- What are the expected data volumes, additional tables, and use cases that we should plan for?

**Data pipeline**
In pipeline_improvements.txt, I have included some comments about how the pipeline could be improved in future.

Please note that performance may degrade at scale due to JSON processing and complex joins. Some suggestions include:
- Incremental change data capture for scalable ingestion.
- Scheduled batch loads aligned to data availability and business needs.
- Breaking receipt items out into atomic tables at the source, instead of squashing them into a JSON column.
- Adding an aggregated layer for frequent business queries.

**Initial business findings** (subject to the above caveats)
- The top brand by receipts scanned in Feb 2021 was Viva, while in Jan 2021 the top brands were Pepsi, Kleenex and Knorr.
- Receipts with a reward status of "Finished" had a higher average item count and average spend amount than those with reward status of "Rejected".
- Pepsi has the most spend and the most transactions among users acquired in the past 6 months.

Please let me know if you'd like to discuss in a meeting – I understand that you aren't familiar with my day-to-day work, and I appreciate your help with this data.

Kind regards,
Luke