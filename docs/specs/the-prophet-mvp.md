# Spec — The Prophet / Mundialito 2026 (MVP)

> **Estado global:** MVP en desarrollo · **Última actualización:** 2026-06-14
> **Repo:** `billy-arredondo/the-prophet` · **Rama:** `dev`
> Documento vivo: refleja el plan por fases y el avance real según el código del repo.
> Fuente canónica de arquitectura/convenciones: [`CLAUDE.md`](../../CLAUDE.md). Diseño visual:
> [`docs/prototypes/`](../prototypes/).

---

## 1. Objetivo y alcance

**The Prophet** (marca visible: *Mundialito 2026*) es un juego **privado de predicciones** del
Mundial 2026 para familia y amigos. Se crean/unen grupos privados, se predice el marcador de cada
partido y se compite en un ranking por grupo. **No es apuestas:** sin dinero, sin premios, sin pagos.
La moneda es puntaje, no convertible.

**Dentro del MVP:**
- Auth: **Google** (adultos/admins) + **Invitado/anónimo** (menores gestionados, sin correo).
- **Grupos privados** por invitación (link/código/QR), con admins y miembros.
- **Predicción global por usuario** (una predicción por partido cuenta en todos sus grupos).
- **Bloqueo por kickoff** (no se edita la predicción una vez iniciado el partido).
- **Resultados** confirmados por un **super-admin** → cálculo de puntos → ranking por grupo.
- **Puntaje:** marcador exacto = **3**, resultado correcto (W/D/L) = **1**, fallo = **0**.

**Fuera del MVP:** dinero real/pagos, grupos públicos, login email/contraseña, Web Push, feed
narrativo de partido, tiempo extra/penales (eliminatorias se evalúan al marcador de los 90').

---

## 2. Stack y arquitectura (resumen)

Monorepo **pnpm** (Node ≥ 20.19), 3 paquetes. Detalle completo en `CLAUDE.md`.

- **`apps/web`** — React 19 + Vite + TS · React Router v7 (rutas lazy) · TanStack Query · Zustand ·
  Tailwind v4 (`@theme`) · Radix/shadcn · Material Symbols + Inter · cliente Better Auth.
- **`apps/api`** — Express 4 + TS (ESM) · Mongoose (MongoDB Atlas) · Better Auth (Google + anonymous,
  adapter Mongo) · Swagger en `/docs` · helmet/cors/rate-limit · node-cron · Vitest.
- **`packages/shared`** — tipos de dominio + esquemas Zod (contrato de API), consumido como **código
  fuente** (`src/index.ts`) por web y api; sin build intermedio.

Convenciones clave: TS estricto; patrón por módulo en API (`model/service/controller/routes`);
autorización por middlewares Express; estado de servidor en TanStack Query, UI en Zustand; tokens de
color Tailwind v4 (prohibido `bg-[--color-x]` y tokens `--spacing-*`).

---

## 3. Modelo de datos (MongoDB)

- **users** — `_id` (string Better Auth o ObjectId para menores), `displayName`, `email|null`,
  `photoURL|null`, `provider: 'google'|'guest'`, `managedBy: userId|null`, `isSuperAdmin`.
- **tournaments** — `name`, `year`, `status`. Habilita reutilizar la plataforma por torneo.
- **groups** — `name`, `description`, `tournamentId`, `createdBy`, `adminIds[]`, `memberIds[]`,
  `inviteCode` (único), `visibility:'private'`.
- **matches** — `tournamentId`, `externalId`, `stage`, `homeTeam`/`awayTeam`, `kickoff`,
  `homeScore|null`/`awayScore|null`, `status:'upcoming'|'live'|'finished'`, `resultSource`,
  `confirmedBy`, `scoredAt`.
- **predictions** — `userId`, `matchId` (único juntos, **global, sin groupId**), `predictedHome`,
  `predictedAway`, `points|null`.
- **rankings** — denormalizado por grupo: `groupId`, `userId`, `totalPoints`, `predictionsCount`.

Transform global Mongoose: `_id → id`, `__v` removido en respuestas.

---

## 4. Superficie de API (real, montada hoy)

Todas bajo `/api`. Errores con formato `{ error: { code, message } }`.

**Auth (Better Auth, `/api/auth/*`):** `get-session`, `sign-in/social` (Google), `sign-in/anonymous`
(invitado), `sign-out`, `callback/google`.

**Users:** `GET /me` · `PATCH /me` · `POST /me/managed-members` · `POST /managed-members/:id/access-link`

**Groups:** `POST /groups` · `GET /groups` · `POST /groups/join` · `GET /groups/:id` ·
`PATCH /groups/:id` · `DELETE /groups/:id` · `POST /groups/:id/invite` ·
`DELETE /groups/:id/members/:uid` · `POST /groups/:id/admins/:uid` · `POST /groups/:id/leave`

**Tournaments:** `GET /tournaments` · `GET /tournaments/:id`

**Matches:** `GET /tournaments/:id/matches` · `GET /matches?status=&tournamentId=` *(nuevo)* ·
`GET /matches/:id`

**Predictions:** `PUT /matches/:id/prediction` (upsert, bloqueado por kickoff) · `GET /me/predictions`

**Results (super-admin):** `GET /matches/pending-review` · `POST /matches/:id/confirm-result` ·
`PATCH /matches/:id/result`

**Rankings:** `GET /groups/:id/ranking`

Swagger: `GET /docs`. Health: `GET /health`.

---

## 5. Plan por fases — estado de avance

Leyenda: ✅ HECHO · 🟡 PARCIAL · ⬜ PENDIENTE

| Fase | Estado | Detalle |
|---|---|---|
| **0 — Fundación** | ✅ | Monorepo pnpm; `packages/shared` (tipos+Zod); API por módulos (auth/scoring/swagger/middlewares/job); web con router lazy, stores, hooks Query y 5 pantallas; `ci.yml` creado. |
| **Integración contrato front↔back + auth** | 🟡 | Cliente Better Auth, endpoints alineados y endpoint de matches por estado **hechos**; falta **verificación e2e** con Mongo conectado. |
| **1 — Auth & usuarios** | 🟡 | Google + invitado vía Better Auth operativos; `requireAuth` espeja el `users` de dominio al primer login. **Pendiente:** JWT de token de dispositivo para menores, account linking, "editar perfil". |
| **2 — Grupos** | 🟡 | Endpoints completos (invite code, cap de 10, último-admin). **Pendiente:** probar e2e (invitación link+QR) y quitar mocks de UI. |
| **3 — Torneo & matches** | 🟡 | `GET /matches?status=` añadido. **Pendiente:** elegir e integrar API de fútbol, seed WC2026, job de sync real. |
| **4 — Predicciones** | 🟡 | Upsert + kickoff lock en backend; UI con endpoints alineados. **Pendiente:** e2e y quitar mocks. |
| **5 — Resultados & scoring** | 🟡 | Scoring puro + confirmación/override + ranking en transacción existen. **Pendiente:** UI de super-admin y re-scoring por delta. |
| **6 — Pulido & deploy** | ⬜ | Fidelidad a prototipos, estados vacíos/skeletons, índices, deploy (web + api + CI). |
| **7 — Opcional** | ⬜ | Web Push, grupos públicos, feed narrativo, puntos configurables, dark mode. |

---

## 6. Avance reciente (changelog)

**2026-06-14 — Integración de autenticación y alineación de contrato front↔back**
- **Cliente oficial Better Auth** en el front: `apps/web/src/lib/authClient.ts`
  (`createAuthClient` + `anonymousClient`).
- **Login Google** vía `authClient.signIn.social` con `callbackURL` **absoluto** al origin de la web
  (antes un path relativo resolvía contra la API → 404).
- **Login invitado** vía `signIn.anonymous` + hidratación con `GET /api/me`.
- **Restauración de sesión** al cargar (`App.tsx`) por `GET /api/me`; **logout** por `signOut`.
- **Endpoints del cliente alineados** con el backend real: `GET /api/me/predictions`,
  `PUT /api/matches/:id/prediction`, `GET /api/groups/:id/ranking`, `POST /api/me/managed-members`.
- **Backend:** `requireAuth` clasifica el `provider` por `isAnonymous` (no por email) para no marcar
  invitados como Google; nuevo `GET /api/matches?status=&tournamentId=` (+ `matchListQuerySchema` en
  `shared`) para los tabs Próximos/En Vivo/Finalizados.

> Nota operativa: Better Auth se inicializa **una sola vez al arrancar** (`server.ts`:
> `connectDb → initAuth`). Si Mongo no está conectado al arranque, el auth queda sin adapter hasta
> reiniciar el proceso. Conectar Mongo y luego **reiniciar `pnpm dev`**.

---

## 7. Bloqueos y TODOs conocidos

- **API de fútbol:** `apps/api/src/lib/footballApi.ts` es un stub; falta elegir proveedor
  (API-Football / football-data.org / TheSportsDB) + key, y la lógica real de `jobs/syncMatches.ts`
  (incl. `externalId` en `tournaments`). *Bloquea Fase 3.*
- **Re-scoring por delta** en override de resultado: `apps/api/src/modules/results/scoring.service.ts`
  (riesgo de doble conteo).
- **JWT de token de dispositivo** para reingreso de menores: `apps/api/src/modules/users/users.service.ts`
  (hoy devuelve token aleatorio; falta firmar con `DEVICE_TOKEN_SECRET` + endpoint de intercambio).
- **Cascada al borrar grupo** (eliminar sus `rankings`): `groups.service.ts`.
- **Web:** ruta `/join?code=` referida por `InviteModal` no existe en el router; **mocks por quitar**
  en `GroupsPage`/`MatchesPage`/`RankingPage` al conectar datos reales; handlers vacíos (editar
  perfil, ajustes, notificaciones).
- **CI `ci.yml`** no está en el remoto (el token de `giordanap` no tiene scope `workflow`).
- **Peer dep:** `better-call` pide `zod@^4` y el repo usa `zod@3.25.76` (warning, no rompe build);
  vigilar errores de validación de Better Auth en runtime.
- **Hardening:** reintentar conexión a Mongo y reconstruir Better Auth al reconectar, para no depender
  de un reinicio si Mongo cae al arranque.
- **Decisiones abiertas:** proveedor de API de fútbol; legal con menores (COPPA/GDPR-K, mitigado por
  grupos privados + datos mínimos).

---

## 8. Verificación (end-to-end)

> El toolchain corre en **Windows** (Node ≥ 20). Comandos desde la raíz del repo.

- **Arranque:** `pnpm install` → `pnpm dev` (web `:5173`, api `:4000`). La consola NO debe mostrar
  `MongooseServerSelectionError` ni `[auth] MongoDB not connected`.
- **Sanidad API:** `GET /health` → 200; `GET /api/me` sin sesión → **401** (no 503: 503 = DB caída en
  el proceso); Swagger en `/docs`.
- **Flujo crítico:** login (Invitado y Google) → entrar a `/groups` con sesión → crear grupo (admin
  Google) → predecir antes de kickoff → verificar lock tras kickoff → super-admin confirma resultado →
  puntos y ranking se actualizan.
- **Calidad:** `pnpm typecheck`, `pnpm test` (api, Vitest) y `pnpm build` en verde.
- **UI:** fidelidad a `docs/prototypes/`; validar con capturas reales.
