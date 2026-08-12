# StudyPath

An AI-assisted student early-warning platform for academic advisors — built as the second full-stack application for AIML-515, applying architecture and testing lessons learned from ContractIQ (App #1).

## What it does

- Advisors log in and see their caseload sorted by risk (High/Medium/Low)
- A rule-based risk engine scores each student on attendance, GPA, missed assignments, and LMS engagement — mirroring research-backed dropout early-warning indicators
- Each flagged student shows a plain-English explanation of *why* they're at risk
- Advisors can log outreach attempts (email, call, text, in-person) with notes, building a history per student

## Tech stack

- **Frontend:** React 19 + Vite, plain CSS
- **Backend:** Node.js + Express
- **Database:** A lightweight JSON file store (no native compilation required) for local development — schema shape is documented in `db/schema.sql` and is portable to PostgreSQL for production
- **Auth:** JWT-based advisor authentication with bcrypt password hashing

## Project structure

```
studypath/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   └── index.js         # DB connection + seed data
│   ├── lib/
│   │   └── riskEngine.js    # rule-based risk scoring
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   └── outreach.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── lib/api.js
    │   ├── App.jsx
    │   └── App.css
    └── index.html
```

## Running locally

**Backend** (in one terminal):
```bash
cd backend
npm install
cp .env.example .env
node server.js
```
Runs on `http://localhost:4000`. On first run it creates and seeds the SQLite database automatically with a demo advisor account and 8 sample students.

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

**Demo login:** `advisor@studypath.demo` / `demo1234`

## Production / single service (e.g. AWS App Runner)

Build the frontend first, then start the backend. Express serves the Vite build from `frontend/dist` on the same port as the API:

```bash
cd frontend
npm install
npm run build

cd ../backend
npm install
cp .env.example .env   # set JWT_SECRET (and PORT if needed)
node server.js
```

Open `http://localhost:4000` (or the port set in `PORT`). The UI and `/api` routes share one process — suitable for deploying as a single App Runner service.

## Known limitations

- Risk scoring is rule-based (attendance/GPA/engagement thresholds), not a trained ML model — an intentional, disclosed MVP choice, same philosophy as ContractIQ's risk engine
- Data persists as a local JSON file for development simplicity; production would move to PostgreSQL. This choice was made specifically to avoid requiring native module compilation (better-sqlite3 needs Visual Studio Build Tools on Windows), which is an unreasonable setup burden for a student project
- Single advisor role only — no admin/multi-advisor permission tiers yet
- No email/SMS delivery integration yet for the outreach log — logging is manual
