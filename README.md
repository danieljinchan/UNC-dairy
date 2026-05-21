# Predictive Maintenance Platform

A B2B web app that helps food & beverage manufacturers (dairy vertical for the
MVP) predict equipment failures, quantify the cost of unplanned downtime, and
view maintenance schedules.

It gives plant maintenance managers a unified hierarchy view —
**facility → processes → equipment → parts** — with failure probabilities,
cost-of-inaction figures, a budget reconciliation view, and a maintenance
calendar.

## Stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS
- SQLite + Prisma

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Apply the database migration (creates prisma/dev.db)
npx prisma migrate deploy

# 3. Generate the Prisma client
npx prisma generate

# 4. Seed the sample dairy plant
npm run seed

# 5. Run the dev server
npm run dev
```

Open http://localhost:3000.

`npm run db:reset` re-applies migrations and re-seeds from scratch.

The `DATABASE_URL` is configured in `.env` and points at a local SQLite file
(`prisma/dev.db`), which is git-ignored.

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
  and cost-of-inaction; plus the equipment's maintenance schedule.
- **Part (`/part/[id]`)** — part detail with supplier, cost, lead time,
  replacement dates, failure probability, risk badge, and cost-of-inaction.
- **Budget (`/budget`)** — predicted-failure cost exposure for 90 / 180 / 365
  day horizons vs. the annual budget, with surplus/shortfall and a detail
  table.
- **Calendar (`/calendar`)** — month grid with the current day highlighted,
  maintenance tasks color-coded by type, prev/next month navigation, and links
  to the related equipment or part.

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
lib/
  cost.ts             Cost & risk engine
  prisma.ts           Prisma client singleton
  queries.ts          Data-access + roll-up helpers
prisma/
  schema.prisma       Data model
  migrations/         SQL migration(s)
  seed.ts             Sample dairy plant seed
```

## Notes

Phase 2 features (chat assistant, document onboarding, SAP integration) are
intentionally out of scope. There is no authentication in this phase.
