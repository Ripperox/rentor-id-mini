# Rentor Desk — Caller ID Console

[![CI/CD](https://github.com/Ripperox/rentor-id-mini/actions/workflows/ci.yml/badge.svg)](https://github.com/Ripperox/rentor-id-mini/actions/workflows/ci.yml)
&nbsp;**Live:** [rentor-id-mini.vercel.app](https://rentor-id-mini.vercel.app)

A real-time **caller-identification console** for property operations. When an inbound VoIP
call arrives, the desk agent answers and instantly sees *who* is calling, *which property*
they're tied to, who else lives there, and every open maintenance issue — then resolves
issues and logs the call without leaving the screen.

Built as a focused proof-of-work for a Junior Full Stack Developer application: it mirrors
the kind of internal tooling a property-management company runs every day, wired end-to-end
to a real Postgres database with row-level security, tests, and continuous deployment.

> **Why this project?** Property teams field constant calls from tenants and owners. The
> single highest-leverage internal tool is one that turns a ringing phone into full context
> in under a second. This is that tool, in miniature.

---

## Highlights

- **Incoming-call experience** — a ringing overlay withholds caller identity until the agent
  *answers*, then reveals the full caller card (just like real caller-ID resolving on pickup).
- **Live operations dashboard** — KPI tiles (properties, tenants, open issues, calls today)
  computed from the database with `count` queries, with an **emergency** signal on the issues tile.
- **Triage-aware caller card** — open issues carry a **priority** (emergency/urgent/routine),
  a **category** (plumbing, electrical, HVAC…), and an **SLA "overdue"** flag; resolve them inline.
- **Report a problem mid-call** — the agent logs a *new* maintenance issue (category + priority)
  straight from the card — the most common reason tenants actually call.
- **Lease & rent context** — tenant cards show rent standing (paid/late/overdue), monthly rent,
  lease end, and the owner's contact for **escalation**; owner cards show portfolio size.
- **Structured call disposition** — every call is tagged with a reason (maintenance/payment/
  lease/complaint) and an optional **follow-up flag** that feeds a callback queue.
- **⌘K command palette** — search any tenant, owner, or phone number and pull up their card
  without waiting for a call. Keyboard-navigable.
- **Follow-ups queue** — flagged calls surface as pending callbacks until an agent clears them.
- **Persistent, searchable history** — every logged call is read back from the DB (joined with
  person + property) and survives a refresh; client-side search across name/property/note.
- **Production hygiene** — typed end-to-end, unit-tested data layer, linted, and auto-deployed
  on every push to `main` via GitHub Actions → Vercel.

---

## Architecture

```
┌──────────────────────────────┐         ┌───────────────────────────┐
│  React + TypeScript (Vite)   │         │   Supabase (Postgres)     │
│                              │  HTTPS  │                           │
│  hooks ── useSimulateCall    │ ──────► │  people · properties      │
│        ── useDeskStats       │  supa-  │  tenancies · issues       │
│        ── useCallHistory     │  base-js│  call_logs                │
│                              │ ◄────── │                           │
│  components ── IncomingCall  │  JSON   │  Row-Level Security:      │
│             ── CallerCard    │         │   anon read reference     │
│             ── StatsRow      │         │   anon insert call_logs   │
│             ── CallHistory   │         │   anon update issues      │
└──────────────────────────────┘         └───────────────────────────┘
        Vercel (static)                       Supabase (managed)
```

The frontend talks **directly** to Postgres through `@supabase/supabase-js` — no bespoke API
server. Security is enforced at the database with Row-Level Security policies, so the browser
only ever holds the public anon key and can do exactly what the policies allow.

### Data model

| Table        | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `people`     | Tenants and owners (`role` discriminator)            |
| `properties` | Units, each owned by a `people` row                  |
| `tenancies`  | Many-to-many: which people live in which property    |
| `issues`     | Maintenance issues per property (`open` / `resolved`)|
| `call_logs`  | Every logged call: who, which property, note, agent  |

The interesting query is the caller lookup: an **owner** resolves to the property they own,
while a **tenant** resolves through `tenancies` to their unit — then the same property fans
out to co-residents and open issues. See `src/hooks/useSimulateCall.ts`.

---

## Tech Stack

- **Frontend:** Vite 8 · React 19 · TypeScript · Tailwind CSS 3
- **Data:** Supabase (Postgres + Row-Level Security) via `@supabase/supabase-js`
- **Icons / type:** lucide-react · Bricolage Grotesque + Hanken Grotesk + JetBrains Mono
- **Testing:** Vitest + Testing Library (jsdom)
- **CI/CD:** GitHub Actions (lint · test · build) → Vercel deploy on `main`

---

## Local Setup

```bash
bun install
cp .env.example .env.local        # then fill in your Supabase URL + anon key
```

In the Supabase SQL Editor, run the migrations in order:

1. `src/db/schema.sql` — tables + RLS policies
2. `src/db/seed.sql` — demo owners, tenants, properties, issues
3. `src/db/migrations/002_history_and_actions.sql` — history read-back + agent actions
4. `src/db/migrations/003_triage_lease_disposition.sql` — issue triage, leases, call disposition

Then:

```bash
bun run dev        # http://localhost:5173
bun run test       # vitest
bun run build      # typecheck + production build
```

### Environment variables

| Variable                 | Description                     |
| ------------------------ | ------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL            |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key        |

---

## Continuous Deployment

Every push to `main` runs the GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Lint · Test · Build** — `oxlint`, `vitest`, and a full production build run on every
   push and pull request.
2. **Deploy** — on `main`, the built artifact is shipped to Vercel production automatically.

Pull requests get the quality gate without deploying, so `main` stays releasable.
