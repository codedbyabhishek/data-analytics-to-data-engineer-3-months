# Setup Guide

## Install Core Tools
- Python 3.10+
- Git
- VS Code
- Docker Desktop (recommended)
- A database: PostgreSQL local or cloud warehouse sandbox

## Create Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install pandas numpy matplotlib seaborn sqlalchemy psycopg2-binary jupyter
```

## Recommended Additions
- Install Apache Airflow or Prefect
- Install dbt-core if doing ELT workflows
- Install Kafka locally only when starting Week 9+

## Project Hygiene
- Use `.env` for secrets
- Keep raw and processed data separate
- Write a README for each project
- Add simple tests for pipeline steps
