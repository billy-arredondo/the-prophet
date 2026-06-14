# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Prophet** is a family-and-friends World Cup 2026 predictions game — users join groups, predict match scores, and compete on a leaderboard. It is a private, non-commercial app.

## Monorepo Structure

pnpm workspace with three packages:

```
apps/web/    → React 19 SPA (Vite, React Router v7, TanStack Query, Zustand)
apps/api/    → Express 4 API (TypeScript, Mongoose, Better Auth)
packages/shared/ → Shared Zod schemas, TypeScript types, and constants
```

## Commands

### Root (runs across all packages)

```bash
pnpm dev          # Start all packages in parallel (web :5173, api :4000)
pnpm build        # Build all packages
pnpm typecheck    # Type-check all packages
pnpm lint         # Lint all packages
pnpm test         # Run all tests
pnpm format       # Prettier format
```

### Web app only (`apps/web`)

```bash
pnpm --filter web dev
pnpm --filter web typecheck
pnpm --filter web lint
```

### API only (`apps/api`)

```bash
pnpm --filter api dev        # tsx watch (hot-reload)
pnpm --filter api test       # vitest run
pnpm --filter api typecheck
```

### Single test file

```bash
pnpm --filter api exec vitest run src/path/to/file.test.ts
```

## Architecture

### Frontend (`apps/web/src/`)

- **Routing** — `router/index.tsx`: React Router v7 with `React.lazy()` code-splitting on all routes. `<RequireAuth>` wraps authenticated routes; `<SessionRestorer>` in `App.tsx` calls `/api/auth/me` once on mount to hydrate session.
- **Data fetching** — TanStack Query (React Query). Hooks live in `hooks/` with co-located query keys. Query client: 5min stale time, no retry on 4xx, refetch-on-focus only in production.
- **State** — Zustand stores in `stores/` for auth and UI state only. Server state belongs in React Query.
- **Components** — `components/ui/` holds Radix UI primitives styled with Tailwind. `features/` holds feature-scoped folders (auth, groups, matches, rankings, profile).
- **API client** — `lib/api.ts`; all requests include `credentials: 'include'` for cookie-based auth.

### Backend (`apps/api/src/`)

- **Module pattern** — each domain resource (groups, matches, predictions, rankings, results, tournaments, users) has: `model.ts`, `service.ts`, `controller.ts`, `routes.ts`.
- **Auth** — Better Auth with Google OAuth + anonymous guest plugin. Auth routes at `/api/auth/*`. Sessions in HTTP-only cookies.
- **DB** — Mongoose with a global `toJSON` transform: `_id → id`, `__v` removed for all API responses.
- **Error format** — all errors return `{ error: { code: string, message: string } }`.
- **Env validation** — `config/env.ts` uses Zod; missing optional vars log warnings but don't crash. Server boots without MongoDB; `/health` and `/docs` always respond.
- **Swagger** — auto-generated from Zod schemas via `zod-to-openapi`; served at `/docs`.
- **Cron** — `jobs/` uses `node-cron` for match sync (requires `FOOTBALL_API_KEY`).

### Shared (`packages/shared/src/`)

- `types.ts` — domain model TypeScript types (User, Group, Match, Prediction, RankingEntry, …)
- `schemas.ts` — Zod schemas for request/response validation, inferred to match `types.ts`
- `constants.ts` — scoring points (`POINTS.EXACT = 3`, `POINTS.OUTCOME = 1`), invite code format, goal limits

The shared package is imported in both web and api via the `@the-prophet/shared` path alias.

## Scoring Logic

Exact score: **3 pts** | Correct outcome (W/D/L): **1 pt** | Wrong: **0 pts**. Implemented in `apps/api/src/lib/scoring.ts` with Vitest tests.

## Design System

Tailwind v4 with Material Design 3 tokens defined in `apps/web/src/index.css`:

- **Primary** — Stadium Green (`#003300` dark / `#4c9141` light)
- **Secondary** — Trophy Gold (`#705d00` / container `#fcd400`)
- **Tertiary** — Score Red (`#7c000b` / `#e53935`)
- Icons via Material Symbols (Google Fonts variable font).

## Key Environment Variables (API)

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `4000` | |
| `MONGODB_URI` | _(none)_ | DB features disabled if absent |
| `BETTER_AUTH_SECRET` | `dev-secret-change-me` | Change in production |
| `BETTER_AUTH_URL` | `http://localhost:4000` | |
| `WEB_ORIGIN` | `http://localhost:5173` | CORS allowed origin |
| `GOOGLE_CLIENT_ID/SECRET` | _(none)_ | Google login disabled if absent |
| `FOOTBALL_API_KEY` | _(none)_ | Match sync disabled if absent |
| `SUPER_ADMIN_EMAILS` | _(none)_ | Comma-separated; can confirm results |

## Code Style

- **Prettier**: 100-char line width, semicolons, single quotes, trailing commas, 2-space indent.
- **TypeScript**: strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride`, `isolatedModules`.
- Functional React components only; no class components.
- Zod schemas in `packages/shared` are the single source of truth for types — define there, infer everywhere.
