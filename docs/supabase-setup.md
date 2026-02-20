# Supabase Setup for Cloud Accounts

This enables real user accounts and cross-device tracking for the GitHub Pages app.

## 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Copy:
  - Project URL
  - anon public API key

## 2. Create Database Tables + Policies
- Open Supabase SQL Editor
- Run `/supabase/schema.sql`

## 3. Configure Frontend
Edit `/docs/config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};
```

## 4. Auth Settings
In Supabase Dashboard:
- Authentication -> Providers -> Email enabled
- Optional: disable email confirmation for faster onboarding

## 5. Deploy via GitHub Pages
- Push to `main`
- In GitHub repo: Settings -> Pages -> Source -> GitHub Actions
- Workflow: `.github/workflows/deploy-pages.yml`

## 6. Test Flow
1. Open the GitHub Pages URL.
2. Create account with email/password.
3. Log daily hours and mark weeks complete.
4. Log out and log in from another device.
5. Confirm progress is synced.

## Notes
- `SUPABASE_ANON_KEY` is safe for frontend use.
- Security is enforced by row-level security policies.
