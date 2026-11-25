# Assignment 4 deployment guide

This release serves the React frontend and Express API from one Render web service. MongoDB Atlas stores the portfolio data. The Render Blueprint is in `render.yaml`; it generates a JWT secret and prompts for the database URI and first administrator credentials without placing them in Git.

## Before connecting Render

1. Sign in to MongoDB Atlas and check whether the account already has a project and cluster. If not, create a project and a free shared cluster. For a Render service in Ohio, choose the shared AWS region in Northern Virginia (`us-east-1`).
2. Create a MongoDB database user with `readWrite` access to the `Portfolio` database. Use a unique password. Copy the Atlas **Connect your application** URI and set its database name to `Portfolio`.
3. Do not add `0.0.0.0/0` to Atlas Network Access. After the Render service is created, open its **Connect → Outbound** panel and add the listed IP ranges to the Atlas project's IP access list. If the first Render start cannot connect because the ranges are not yet allowlisted, add them and redeploy the service. For local testing, Atlas can allow only your current IP.
4. The repository is `alkurdi74/Assignment_3_Portfolio_Submission`. In Render, choose **New → Blueprint**, select this repository and the `main` branch, and use the root `render.yaml` file.
5. When Render asks for values, enter `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` directly in Render. Keep the URI and passwords private. Render generates `JWT_SECRET`.

At startup, the service creates the configured admin account only when that email does not already exist. It does not reset an existing admin password on later deploys. Regular signups receive the regular user role.

## Verify the demo

1. Wait for the deploy to finish and for `/api/health` to report `{"status":"ok"}`.
2. Open the service's `onrender.com` URL. Sign in as the configured administrator; add and edit a project and education record. Submit the contact form and review its saved record as the administrator.
3. Create a regular account and confirm it can view project and education records but has no create, edit, or delete controls. The API must reject a regular user's write attempt with HTTP 403.
4. Refresh the page after adding a project; confirm the item remains in Atlas.
5. Capture the first successful deployment before the separate CI/CD content change described below.

## CI/CD evidence

After the first successful deployment, create a branch such as `assignment4-demo-update`, add a short paragraph to a portfolio page, commit and push the branch, then merge it into `main`. Render automatically deploys commits from its connected production branch. Capture the old page before merging, then wait for the new deploy, refresh the public URL, and capture the changed paragraph. Include both screenshots and the GitHub repository URL in the final report.

## Testing and performance checklist

- Run `npm --prefix client run lint` and `npm run build` locally.
- Run `npm test` against a disposable MongoDB database and capture the passing output. API tests use a unique `Portfolio_test_*` database and must never point to production.
- Run `npm run test:e2e` with the app and a disposable database, or use the successful GitHub Actions Cypress run. The CI artifact contains the Cypress recording and failure screenshots.
- Check the deployed site on desktop and mobile. Vite produces minified production assets; Express serves the built React files and API from the same origin.

## Important notes

- Never commit `.env`, Atlas credentials, administrator credentials, or JWT secrets. Enter production values only in Render's environment form.
- Render free web services can sleep after inactivity and take time to wake. Open the public URL shortly before recording.
- Use synthetic demo records rather than real contact information or other sensitive data.
