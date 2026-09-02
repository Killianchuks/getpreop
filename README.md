# GetPreOp

Virtual anesthesiology-led preoperative assessment and optimization platform to reduce day-of-surgery cancellations while improving safety and patient experience.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Zod validation

## Core Capabilities in This MVP

- Surgery center referral portal and readiness tracking
- Standardized digital intake and secure patient uploads
- Virtual anesthesia consultation scheduling workflow
- Risk stratification: Ready / Needs Optimization / Needs Specialist Evaluation
- Medication instructions and conditional additional workup recommendations
- One-page pre-op report generation returned within 24-48 hours
- Secure messaging for anesthesia-related patient questions
- Multi-option business model page for per-case, subscription, and enterprise pricing
- Prisma-backed persistence for referrals, intake, scheduling, messaging, and reports
- Role-gated dashboards using cookie-based MVP access control
- End-to-end referral-to-report workflow demo page

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. If you want database persistence locally, apply migrations to your local database:

```bash
npm run prisma:migrate
```

5. Seed sample surgery center, anesthesiologist, and patient journey data:

```bash
npm run prisma:seed
```

6. Run development server:

```bash
npm run dev
```

7. Open `http://localhost:3000`

## Test Mode: getpreop.test

1. Add this one-time macOS hosts entry:

```bash
sudo sh -c 'echo "127.0.0.1 getpreop.test" >> /etc/hosts'
```

2. Build and run the local-domain server:

```bash
npm run build
npm run start:local-domain
```

3. Open `http://getpreop.test:3000`.

`getpreop.test` resolves to your own computer only; it is not publicly accessible.

## Project Structure

- `app/`: routes, pages, and API handlers
- `app/api/`: backend endpoints for onboarding, questionnaire, risk, optimization, readiness
- `lib/`: shared validation and clinical mock-scoring services
- `prisma/schema.prisma`: data models for users, profiles, tasks, teleconsults, readiness

## Key Routes

- `/`: landing
- `/surgery-centers`: surgery center dashboard
- `/anesthesiologists`: anesthesiologist workflow dashboard
- `/patients`: patient portal summary
- `/login`: user login page
- `/signup`: user registration page
- `/intake`: patient pre-op intake workflow
- `/report`: one-page report SLA and content
- `/workflow`: clickable referral-to-report demo flow
- `/pricing`: business model options

API routes:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/session` (placeholder)
- `POST /api/referrals/create`
- `POST /api/patients/onboard`
- `POST /api/patients/schedule`
- `POST /api/patients/upload-request`
- `POST /api/questionnaire/submit`
- `POST /api/risk/score`
- `POST /api/optimization/plan`
- `GET /api/dashboard/readiness`
- `POST /api/teleconsultations/schedule`
- `POST /api/reports/one-page`
- `POST /api/messages/send`

## Architecture Notes

- App Router handles both frontend and API handler composition.
- Prisma schema captures longitudinal perioperative optimization workflows.
- Risk and report services are mock engines intended to be replaced with validated clinical logic.

## HIPAA-Minded Security Checklist

- Enforce SSO + MFA for clinician/admin roles.
- Apply strict RBAC and minimum necessary access controls.
- Encrypt PHI at rest and in transit.
- Use audit trails for all clinically relevant read/write actions.
- Implement business associate agreements for all downstream vendors.
- Add signed consent capture for virtual care workflow.
- Run periodic threat modeling and incident response drills.

## Next Build Steps

- Integrate real authentication provider (OIDC/SAML).
- Add a proper identity-aware audit viewer for compliance teams.
- Implement messaging/reminders for unresolved optimization tasks.
- Add analytics pipeline for cancellation prediction model calibration.

## Production Deployment Checklist

1. Set `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `MAILERSEND_API_KEY`, and `STRIPE_SECRET_KEY` in the deployment provider. Do not commit live secrets.
2. Use a production database and apply migrations with `npm run prisma:migrate:deploy`.
3. Build with `npm run build`, then start with `npm run start -- --hostname 0.0.0.0 --port $PORT`.
4. Replace MVP cookie authentication and the browser-only video room with production-grade, identity-aware and HIPAA-appropriate services before processing real patient information.
5. Configure a production Stripe webhook before activating live payments.
