# FamiljWordle

React + TypeScript Wordle-style game with a shared PostgreSQL-backed scoreboard.

## Core Features

- Daily five-letter puzzle with keyboard and board feedback
- Correct duplicate-letter scoring (Wordle-compatible two-pass logic)
- Shared scoreboard persisted in PostgreSQL and visible to all users
- Route-level pages for Home, Play, Scoreboard, and About
- Daily play limit support via feature toggle in `StatsContext`

## Architecture Overview

The app follows a domain-first/hybrid structure:

- `src/pages`: route-level modlets (`Home`, `Play`, `Scoreboard`, `About`)
- `src/contexts`: app state boundaries (`GameContext`, `StatsContext`)
- `src/api`: async API modules (`wordApi`, `scoreApi`)
- `src/services`: hook layer for data-fetching (`useWordService`)
- `src/components`: shared UI helpers and boundaries
- `src/logic.ts`: business rules isolated from rendering

This keeps rendering logic, business logic, and state management separated while still making route-level behavior easy to navigate.

## Project Structure

```text
src/
  pages/              Route-level modlets and tests
  contexts/           Shared state providers and tests
  api/                Async fetch functions and response normalization
  services/           Hook strategy around TanStack Query
  components/         Reusable UI/error boundary pieces
  logic.ts            Core game rules and score computation
```

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL (for local backend mode)

## Local Setup

```bash
npm install
```

### Frontend only

```bash
npm run dev
```

### Full stack (frontend + API)

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`

### API only

```bash
npm run start:api
```

## Environment Variables

Copy `.env.example` and configure values for your environment.

- `DATABASE_URL` (required for backend API)
- `PGSSLMODE=require` (optional, for hosted DBs that require SSL)
- `VITE_SCORE_API_BASE_URL` (optional override; defaults to same-origin `/api`)

## Database Notes

- Scores are stored in PostgreSQL.
- The backend initializes the `scores` table and index on startup.

## Coding Standards

- TypeScript strict typing and explicit core data structures
- ESLint configured via `eslint.config.js`
- Prettier configured via `.prettierrc.json`
- CI enforces lint, tests, and build before merge/deploy

## Quality and DX Commands

```bash
npm run lint-typecheck
npm run lint-eslint
npm run lint-prettier
npm run lint-depcheck
npm test
npm run build
```

## State Management Strategy

- `GameContext`: per-game state and win/loss flow
- `StatsContext`: user stats, daily limit checks, shared score history hydration

State leakage safeguards:

- Context APIs expose only required values/actions
- Data-fetching and API concerns are kept out of visual components
- Score history is normalized at API boundaries before entering app state

## Data Fetching Strategy

- Raw HTTP logic lives in `src/api/*`
- UI consumption uses service hooks in `src/services/useWordService.ts`
- TanStack Query handles async orchestration, suspense, and cache lifecycle

## CI/CD

- CI workflow: `.github/workflows/ci.yml`
  - Runs lint, tests, and build on PRs and pushes to `main`
- CD workflow: `.github/workflows/deploy-vercel.yml`
  - Deploys to Vercel on push to `main` and supports manual dispatch

Required GitHub secrets for CD:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## New Team Member Onboarding

1. Install dependencies with `npm install`.
2. Copy `.env.example` and set local values.
3. Run `npm run dev:full`.
4. Run `npm run lint` and `npm test` before opening PRs.
5. Follow existing page-modlet and context boundaries when adding features.
