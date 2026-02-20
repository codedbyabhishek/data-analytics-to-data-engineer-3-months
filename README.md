# Data Analytics to Data Engineer in 3 Months

A practical, project-based roadmap for going from zero to professional-level foundations in **Data Analytics + Data Engineering** in 12 weeks of disciplined work.

This is beginner-safe: if you are totally new to tech, start with **Week 0** first.

## Who this is for
- Absolute beginners who can commit to hard work for 3 months.
- Career switchers who want portfolio-ready projects.
- Analysts who want to level up into data engineering.

## If You Are a Complete Beginner
- Start with `week-by-week/week-0-foundation.md` before Week 1.
- Week 0 covers computer basics, terminal basics, Git/GitHub basics, and study habits.
- If Week 0 feels hard, repeat it once. That is normal.

## Commitment
- **Daily:** 3-4 focused hours
- **Weekly:** 20-30 hours
- **Duration:** 12 weeks
- **Optional for absolute beginners:** 1 prep week (Week 0)

## Outcomes by Week 12
- Strong SQL + Python for analytics and data pipelines
- Ability to design ETL/ELT pipelines
- Experience with data warehouses and orchestration tools
- 3 portfolio projects with documentation and business context
- Interview-ready stories and GitHub project proofs

## Repo Structure
- `week-by-week/` -> detailed roadmap
- `projects/` -> end-to-end project briefs
- `resources/` -> free and practical learning links/topics
- `templates/` -> trackers and planning templates
- `tools/` -> environment setup and workflow
- `docs/` -> GitHub Pages website (account + progress tracker)

## 12-Week Plan (Quick View)
- **Week 0 (Prep):** Computer + terminal + Git/GitHub + learning setup
- **Weeks 1-2:** Foundations (Python, SQL, data basics)
- **Weeks 3-4:** Analytics workflow (EDA, BI dashboards, metrics)
- **Weeks 5-6:** Data modeling and warehousing fundamentals
- **Weeks 7-8:** Batch pipelines + orchestration
- **Weeks 9-10:** Streaming fundamentals + cloud concepts
- **Weeks 11-12:** Portfolio polish + interview prep + capstone

Read full plan here: [`week-by-week/12-week-roadmap.md`](week-by-week/12-week-roadmap.md)
Beginner prep here: [`week-by-week/week-0-foundation.md`](week-by-week/week-0-foundation.md)
Week 0 links here: [`resources/week-0-beginner-resources.md`](resources/week-0-beginner-resources.md)
Week 0 checklist here: [`templates/week-0-daily-checklist.md`](templates/week-0-daily-checklist.md)

## GitHub Pages Learning Tracker
- Website source: [`docs/index.html`](docs/index.html)
- Features:
  - Real account auth (AWS Cognito email/password)
  - Multi-course learning paths (course switcher)
  - Track Week 0 to Week 12 completion
  - Add daily learning logs with hours
  - View completion %, total hours, and streak
  - Set weekly hour goal
  - Export/import your progress data from cloud account
  - JSON-based course configuration admin editor
  - Subscription-ready billing foundation (plans + checkout flow API)

Important:
- Configure AWS first using [`docs/aws-setup.md`](docs/aws-setup.md).
- Add AWS values in [`docs/aws-config.js`](docs/aws-config.js) using [`docs/aws-config.example.js`](docs/aws-config.example.js).
- Backend infrastructure and API code are in [`aws/template.yaml`](aws/template.yaml) and [`aws/lambda/index.mjs`](aws/lambda/index.mjs).
- Default course catalog file: [`docs/courses/catalog.json`](docs/courses/catalog.json).

### Billing Setup (Optional, Stripe)
- SAM template supports:
  - `StripeSecretKey`
  - `StripePricePro`
  - `StripePriceTeam`
  - `StripeWebhookSecret`
  - `AppBaseUrl`
- If Stripe values are empty, billing checkout endpoints return a clear configuration error.
- Webhook endpoint (for Stripe events):
  - `POST /billing/stripe-webhook` (signature-verified, unauthenticated route)

## Projects You Will Build
1. Analytics Dashboard with KPI storytelling
2. Batch Data Pipeline (ingest -> transform -> warehouse)
3. Near-Real-Time Pipeline + monitoring + data quality checks

See project briefs in [`projects/`](projects/).

## Suggested Daily Routine
1. Learn concept (45-60 min)
2. Practice exercises (60-90 min)
3. Build project feature (60-90 min)
4. Write notes + commit to GitHub (15-30 min)

If new to tech, use this simpler routine in Week 0:
1. Follow one small tutorial step-by-step (30-45 min)
2. Repeat it from memory (30 min)
3. Do one tiny task alone (30-45 min)
4. Write what was confusing and what worked (15 min)

## Rules for Success
- Build every week, do not only watch tutorials.
- Push code daily with clear commit messages.
- Write what business problem each project solves.
- Track progress in `templates/study-tracker.csv`.

## How to Start
1. Follow setup: [`tools/setup.md`](tools/setup.md)
2. If fully new, finish: [`week-by-week/week-0-foundation.md`](week-by-week/week-0-foundation.md)
3. Open roadmap: [`week-by-week/12-week-roadmap.md`](week-by-week/12-week-roadmap.md)
4. Start Week 1 and log daily progress.

## Optional Extensions (After Week 12)
- dbt advanced modeling
- Spark at scale
- Airflow production patterns
- Cloud-specific certifications (AWS/GCP/Azure)

## License
MIT
