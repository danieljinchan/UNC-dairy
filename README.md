# UNC Dairy — Predictive Maintenance Platform

A B2B web app that helps food & beverage manufacturers (dairy vertical for the
MVP) predict equipment failures, quantify the cost of unplanned downtime, and
view maintenance schedules. The UI uses the UNC Dairy brand — deep navy, sky
blue, white, rounded friendly shapes.

It gives plant maintenance managers a unified hierarchy view —
**facility → processes → equipment → parts** — with failure probabilities,
cost-of-inaction figures, a budget reconciliation view, and a maintenance
calendar.

## Stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS
- PostgreSQL + Prisma

## Deploy to Vercel

This app is built for a true one-click Vercel deploy. The serverless filesystem
is ephemeral, so the app uses a hosted Postgres (Neon) instead of SQLite.

1. **Push this repo to GitHub.**
2. **Import the project in Vercel** — go to <https://vercel.com/new>, select the
   GitHub repository, and import it. Vercel auto-detects Next.js; no extra
   configuration is needed.
3. **Add a Postgres database** — in the Vercel project, open the **Storage** tab,
   click **Create Database**, choose **Neon** (Postgres) from the Marketplace,
   and create it. Vercel's Neon integration automatically injects the
   `DATABASE_URL` environment variable into the project (no manual setup).
4. **Deploy.** On every deploy the `build` script runs
   `prisma db push` to sync the schema and then re-seeds the database, so the
   live demo always has fresh, current-looking data.

That's it — no `vercel.json` and no manual environment variables required.

## Run locally

You need a PostgreSQL database (a local Postgres instance or a free Neon
development branch).

```bash
# 0. Move into the project directory first
cd UNC-dairy

# 1. Install dependencies (also runs `prisma generate` via postinstall)
npm install

# 2. Create a .env file with your Postgres connection string
cp .env.example .env
# then edit .env and set DATABASE_URL

# 3. Push the schema to the database and seed the sample dairy plant
npm run db:push
npm run seed

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

`npm run db:reset` resets the database schema and re-seeds from scratch.

The `DATABASE_URL` is configured in `.env` (git-ignored). See `.env.example`.

## Build

```bash
npm run build
npm run start
```

## Features (Phase 1)

- **Dashboard (`/`)** — facility overview: process cards with risk roll-up
  badges and a budget-status banner (annual budget vs. predicted-failure
  exposure).
- **Process (`/process/[id]`)** — equipment list for a process, each
  risk-flagged.
- **Equipment (`/equipment/[id]`)** — manufacturer, blueprint/cut-sheet refs,
  throughput and margin; a parts table with failure probability, risk badge,
  and cost-of-inaction; plus the equipment's maintenance schedule. Flagship
  equipment (the homogenizer) additionally shows an **interactive machine map**
  — see below.
- **Part (`/part/[id]`)** — part detail with supplier, cost, lead time,
  replacement dates, failure probability, risk badge, and cost-of-inaction.
- **Budget (`/budget`)** — predicted-failure cost exposure for 90 / 180 / 365
  day horizons vs. the annual budget, with surplus/shortfall and a detail
  table.
- **Calendar (`/calendar`)** — month grid with the current day highlighted,
  maintenance tasks color-coded by type, prev/next month navigation, and links
  to the related equipment or part.

## Interactive homogenizer experience

The **Homogenizer HD-3 / GEA Ariete-class** in the Pasteurization process is a
flagship machine with a richer detail view. On its equipment page
(`/equipment/[id]`) it renders an **interactive machine map**:

- A large exterior photo with **four clickable hotspot zones** overlaid as
  semi-transparent, risk-colored rectangles (red/amber/green by worst part risk)
  with hover labels.
- Zones: *Homogenizing valve head*, *Liquid end / pump block*,
  *Crankcase / power end*, and *Drive*.
- Clicking a zone opens a **slide-in side panel** from the right listing every
  part in that zone. Each part is an expandable card showing failure
  probability, a "why it's at risk" explanation, the PM schedule
  (last replaced / next due / interval), cost-of-inaction + part cost, supplier
  + lead time, and an **Order part** button.
- The panel closes on backdrop click or `Esc`.

Zones are defined in `lib/homogenizer.ts` as percentage-based rectangles, so
they are easy to retune once a real exterior photo is in place. The component
is `components/HomogenizerExplorer.tsx`. Other equipment keeps the simpler
table layout — the interactive view only appears when `Equipment.photoRef` is
set.

### Homogenizer photos

Photos live in **`public/homogenizer/`** and are referenced by base filename.
**No photos are committed** — the app renders a clean styled placeholder
(navy outline, sky-blue tint, camera icon, part name) whenever a file is
missing, so the app looks finished and is fully functional with zero images.

Drop real `.jpg` files in with these exact names and they appear automatically,
no code changes required:

| Filename                 | Used for                                           |
| ------------------------ | -------------------------------------------------- |
| `exterior.jpg`           | Full homogenizer photo with hotspot zones          |
| `homogenizing-valve.jpg` | Homogenizing valve seat                            |
| `plunger.jpg`            | Plungers                                           |
| `plunger-seal.jpg`       | Plunger packings / wiper box                       |
| `valve-assembly.jpg`     | Valve ball, valve spring, suction/discharge valves |
| `crankcase-oil.jpg`      | Crankcase oil                                      |
| `oil-filter.jpg`         | Oil filter cartridge                               |
| `drive-belt.jpg`         | Drive V-belt                                       |

The `PartImage` component (`components/PartImage.tsx`) handles the
render-or-placeholder logic. See also `public/homogenizer/README.md`.

## Cost engine (`lib/cost.ts`)

- `costOfInaction(expectedDowntimeMin, unitsPerHour, marginPerUnit)` =
  `expectedDowntimeMin * (unitsPerHour / 60) * marginPerUnit` — lost margin if
  a part fails unplanned.
- `riskLevel(failureProbability)` — `RED` (>= 0.60), `YELLOW` (>= 0.30),
  otherwise `GREEN`.
- Equipment risk = the worst risk among its parts; process risk = the worst
  risk among its equipment.

## Data model

`Facility → Process → Equipment → Part`, plus `MaintenanceTask`
(`PM` | `PREDICTED_FAILURE` | `WORK_ORDER`) linked to equipment and optionally a
part. See `prisma/schema.prisma`.

## Project structure

```
app/                  App Router pages
  page.tsx            Dashboard
  process/[id]        Process detail
  equipment/[id]      Equipment detail
  part/[id]           Part detail
  budget/             Budget reconciliation
  calendar/           Maintenance calendar
components/           Sidebar, risk/task badges, calendar grid
  HomogenizerExplorer Interactive hotspot machine map + side panel
  PartImage           Photo-or-placeholder image component
lib/
  cost.ts             Cost & risk engine
  homogenizer.ts      Hotspot zone definitions
  prisma.ts           Prisma client singleton
  queries.ts          Data-access + roll-up helpers
public/
  homogenizer/        Drop machine photos here (see table above)
prisma/
  schema.prisma       Data model (PostgreSQL)
  seed.ts             Idempotent sample dairy plant seed
```

## Notes

Phase 2 features (chat assistant, document onboarding, SAP integration) are
intentionally out of scope. There is no authentication in this phase.
