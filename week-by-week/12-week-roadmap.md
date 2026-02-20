# 12-Week Roadmap (Zero to Professional Foundations)

If you are completely new to tech, complete `week-0-foundation.md` first.

## Week 1: Data + Python Basics
- Install tools and IDE
- Python basics: variables, loops, functions, file I/O
- Intro to CSV/JSON handling
- Mini-task: read CSV, clean columns, basic stats

Deliverable:
- `week1_python_basics.ipynb` + GitHub commit

Beginner daily flow:
- Day 1: Python syntax + 10 tiny exercises
- Day 2: Functions and loops
- Day 3: Files and CSV basics
- Day 4: Small data cleaning task
- Day 5: Review + rewrite from scratch

## Week 2: SQL Fundamentals
- SELECT, WHERE, GROUP BY, JOINs, CTEs, window functions
- Query performance basics and indexing intro
- Solve at least 50 SQL practice questions

Deliverable:
- `week2_sql_challenges.sql` with documented solutions

Beginner daily flow:
- Day 1: SELECT, WHERE, ORDER BY
- Day 2: GROUP BY and aggregates
- Day 3: JOINs (inner, left)
- Day 4: CTEs and window functions intro
- Day 5: Practice set and review

## Week 3: Data Analytics Workflow
- Data cleaning and EDA in pandas
- Business metrics: conversion, retention, ARPU, churn
- Visualization basics

Deliverable:
- EDA notebook with insights and recommendations

## Week 4: Dashboards + Storytelling
- Build BI dashboard (Power BI/Tableau/Looker Studio)
- Define KPI hierarchy and drill-down views
- Present findings in business language

Deliverable:
- Dashboard + one-page business summary

## Week 5: Data Modeling + Warehousing
- Star schema, fact/dimension tables
- OLTP vs OLAP
- Data warehouse concepts

Deliverable:
- Schema design for analytics use case (draw.io/dbdiagram)

## Week 6: ETL/ELT Design
- Pipeline design principles
- Data quality checks, idempotency, late-arriving data
- Build first batch ETL script

Deliverable:
- ETL pipeline with logging + retry logic

## Week 7: Orchestration + Scheduling
- Orchestrate ETL using Airflow or Prefect
- DAG dependencies and error handling
- Notifications and run history

Deliverable:
- Scheduled DAG with 2-3 dependent tasks

## Week 8: Data Warehouse Loading
- Load transformed data to warehouse (BigQuery/Redshift/Snowflake/Postgres)
- Partitioning and incremental loading
- Build analytics-ready marts

Deliverable:
- Warehouse tables + documentation of load strategy

## Week 9: Streaming Fundamentals
- Event-driven architecture basics
- Kafka/PubSub fundamentals
- Stream processing concepts (windowing, state)

Deliverable:
- Simple producer/consumer pipeline

## Week 10: Data Quality + Monitoring
- Great Expectations or custom validation checks
- Pipeline observability (freshness, volume, schema checks)
- Incident handling basics

Deliverable:
- Data quality report + alerting logic

## Week 11: Capstone Build
- Integrate ingestion, transformation, storage, dashboard
- Add README with architecture diagram
- Add tests and sample data

Deliverable:
- Capstone v1 with full repo documentation

## Week 12: Portfolio + Interview Preparation
- Polish all project READMEs and architecture diagrams
- Create 2-minute demo videos
- Prepare interview Q&A (SQL, pipelines, modeling, trade-offs)

Deliverable:
- Job-ready GitHub portfolio + resume project bullets

## Weekly Checklist
- 5+ study sessions completed
- 1 project increment shipped
- 1 retrospective written
- 1 public GitHub update posted

## If You Get Stuck
- Reduce scope: solve one tiny subtask only.
- Use 45-minute focus blocks with 10-minute breaks.
- Ask: "What input, process, output does this step need?"
- Rebuild from scratch the next day without copy-paste.
- Do not skip two days in a row.

## Minimum Skill Checklist by End
- SQL: joins, windows, query tuning basics
- Python: pandas + ETL scripting
- Warehousing: schema design + incremental loads
- Orchestration: schedule and monitor pipelines
- Communication: convert technical work to business impact
