# AWS Setup (Free Tier)

This app uses:
- Cognito for authentication
- API Gateway + Lambda for API
- DynamoDB for progress storage

## 1. Prerequisites
- AWS account (Free Tier)
- AWS CLI configured (`aws configure`)
- SAM CLI installed
- Node.js 20+

## 2. Deploy Backend
From `/aws`:

```bash
cd aws/lambda
npm install
cd ..
sam build
sam deploy --guided
```

During `sam deploy --guided`:
- Stack name: `data-journey-tracker`
- Region: your preferred region (example `us-east-1`)
- Parameter `AllowedOrigin`: your GitHub Pages URL
  - Example: `https://codedbyabhishek.github.io`
- Parameter `AppBaseUrl`: your full app URL
  - Example: `https://codedbyabhishek.github.io/data-analytics-to-data-engineer-3-months/`
- Optional Stripe params:
  - `StripeSecretKey`
  - `StripePricePro`
  - `StripePriceTeam`

After deploy, copy outputs:
- `ApiBaseUrl`
- `UserPoolId`
- `UserPoolClientId`

## 3. Configure Frontend
Edit `/docs/aws-config.js`:

```js
window.AWS_CONFIG = {
  REGION: "us-east-1",
  USER_POOL_ID: "us-east-1_xxxxxxxx",
  USER_POOL_CLIENT_ID: "xxxxxxxxxxxxxxxxxxxxxxxxxx",
  API_BASE_URL: "https://your-api-id.execute-api.us-east-1.amazonaws.com"
};
```

## 4. Deploy Frontend
Push to `main`.
GitHub Pages workflow already deploys from `docs/`.

## 5. Test End-to-End
1. Sign up with email/password.
2. Verify email with Cognito code.
3. Log in and add logs.
4. Log out, then log in on another device.
5. Confirm data is synced.

## Notes
- Keep CORS origin strict in production.
- DynamoDB uses on-demand billing in this template.
