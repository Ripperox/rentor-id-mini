# Rentor Internal — Caller ID Dashboard

A proof-of-concept internal tool simulating Rentor's VoIP caller-ID system. When staff receive an inbound call, they click "Simulate Incoming Call" to instantly surface the caller's profile, associated property, and open maintenance issues — exactly as the real system does when a tenant or owner phones in.

Built as a portfolio project for a Junior Full Stack Developer application.

## Tech Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Database:** Supabase (Postgres)
- **Deploy:** Vercel

## Local Setup

1. Clone the repo
2. Install dependencies: `bun install`
3. Copy env file: `cp .env.example .env.local`
4. Fill in your Supabase credentials in `.env.local`
5. In Supabase SQL Editor, run `src/db/schema.sql` then `src/db/seed.sql`
6. Start dev server: `bun run dev`

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

## Features

- Real-time caller identification (tenant or owner)
- Property details and unit number
- Open maintenance issue history with age
- One-click call logging to database
- Copy-to-clipboard phone number
