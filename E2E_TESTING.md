# Assignment 4 End-to-End Testing

The browser tests live in `client/cypress/e2e/portfolio.cy.js`. They run against the built React app and the Express API connected to a disposable MongoDB service. The suite submits a contact form and confirms persistence, exercises administrator create/edit/delete for a project, and checks that a regular account can read projects but has no edit controls.

## Run locally

1. Start MongoDB and create a local `.env` with `MONGODB_URI`, `JWT_SECRET`, `SEED_ADMIN_ON_STARTUP=true`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Install root and client dependencies, then build the frontend.
3. Start the app with `npm start`.
4. In another terminal, run from the project root: `npm run test:e2e`.

The first Cypress run downloads its official browser runner from npm. The video is saved under `client/cypress/videos`; failure screenshots are saved under `client/cypress/screenshots`. Never commit a real `.env`, MongoDB URI, administrator password, JWT, or production token. The CI workflow supplies disposable test-only credentials and uploads recordings as a GitHub Actions artifact.

## Evidence for the assignment report

Capture (1) the Cypress results showing all end-to-end tests passing and (2) a short recording of the admin project create/edit/delete flow or the CI artifact video. Capture (3) a separate user-role screen showing the read-only project list without Add/Edit/Delete controls. Keep the demo database free of personal data.

