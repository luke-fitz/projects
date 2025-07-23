# Fetch Rewards Coding Exercise - Analytics Engineer - Submission

## Data files (note: files have not been committed to repo)
- `data/raw`: Directory to save `brands.json`, `receipts.json`, and `users.json` provided in the exercise.
- `data/cleansed`: Directory where cleansed files are written in the pipeline.

## Data pipeline
- `pipeline/ingest_rewards_data.py`: Python script to execute the ingestion and cleansing pipeline. Please note that you need to change `BASE_DIR` as needed.
- `pipeline/pipeline_improvements.txt`: Suggested improvements to data pipeline before it is production-ready.
- `pipeline/relational_data_diagram.png`: Simplified, structured, relational diagram to represent how you would model the data in a data warehouse. The URL to the dbdiagram page is also provided.

## Analysis
- `analysis/data_quality_checks.ipynb`: Python notebook conducting data quality checks. This includes detailed comments about the findings of the checks.  Please note that you need to change `BASE_DIR` as needed.
- `analysis/sql_queries.ipynb`: Python notebook containing SQL queries to answer the business questions provided, using DuckDB's SQL dialect. Please note that you need to change `BASE_DIR` as needed.
- `analysis/stakeholder_email.md`: Email to a product or business leader outlining the questions, issues, and future work related to the data.

## Requirements
- Python libraries: `duckdb`, `os`, `pandas`, `uuid`