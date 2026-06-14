# The Prophet

A friendly predictions app for the **2026 FIFA World Cup** — built for family and friends to compete, laugh, and celebrate together.

> No money. No stakes. Just bragging rights.

---

## What is this?

**The Prophet** is a social prediction game where you and your group predict the outcomes of World Cup 2026 matches. Everyone picks their scores, earns points for accuracy, and climbs the leaderboard.

This app is not a betting platform and has no commercial purpose. It exists purely for fun and friendly competition among people we care about.

---

## Features

- **Group play** — join a private group with an invite code and compete only with people you know
- **Match predictions** — pick your score for every World Cup match before kickoff
- **Live leaderboard** — see who's leading in real time
- **Simple login** — sign in with Google or jump in as a guest

---

## Scoring

| Result                  | Points |
| ----------------------- | ------ |
| Exact score             | 3 pts  |
| Correct outcome (W/D/L) | 1 pt   |
| Wrong                   | 0 pts  |

---

## Tech stack

| Layer    | Stack                                                       |
| -------- | ----------------------------------------------------------- |
| Frontend | React 19, Vite, React Router v7, TanStack Query, Zustand    |
| Backend  | Express 4, TypeScript, Mongoose (MongoDB)                   |
| Auth     | Better Auth (Google OAuth + anonymous guest)                |
| Styling  | Tailwind CSS v4, Material Design 3 tokens, Material Symbols |
| Monorepo | pnpm workspaces                                             |
| Shared   | Zod schemas and TypeScript types (`@the-prophet/shared`)    |

---

## Status

Active development. Core auth and group scaffolding in place; predictions and leaderboard coming next.

---

## License

Personal, non-commercial use only.
