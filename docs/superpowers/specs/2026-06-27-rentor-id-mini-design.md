# Rentor-ID Mini — Design Spec

**Date:** 2026-06-27  
**Goal:** Weekend proof-of-work project for a Junior Full Stack Developer application at Rentor. Demonstrates internal-tooling mindset, their exact tech stack, and AI-first workflow. Produces a live public URL to include in the application email.

---

## Overview

A single-page React app that simulates Rentor's internal VoIP caller-ID pop-up system. When a staff member clicks "Simulate Incoming Call," the app queries Supabase to fetch a random caller's profile, property, and open issues — displaying it in an animated modal identical in spirit to what Rentor's real system does when a tenant or owner calls.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Hosting | Vercel (frontend) + Supabase cloud (DB) |

---

## Database Schema

### `people`
```sql
id          uuid primary key default gen_random_uuid()
name        text not null
phone       text not null
role        text not null check (role in ('tenant', 'owner'))
```

### `properties`
```sql
id          uuid primary key default gen_random_uuid()
address     text not null
unit        text not null
owner_id    uuid references people(id)
```

### `tenancies`
```sql
id          uuid primary key default gen_random_uuid()
person_id   uuid references people(id)
property_id uuid references properties(id)
```

### `issues`
```sql
id          uuid primary key default gen_random_uuid()
property_id uuid references properties(id)
description text not null
status      text not null default 'open' check (status in ('open', 'resolved'))
created_at  timestamptz default now()
```

### `call_logs`
```sql
id          uuid primary key default gen_random_uuid()
person_id   uuid references people(id)
property_id uuid references properties(id)
logged_at   timestamptz default now()
note        text
```

---

## Seed Data

- 3 owners (each owns one property)
- 6 tenants (spread across 4 properties, some properties have 2 tenants)
- 4 properties
- 8 issues: mix of open and resolved across different properties

---

## App Layout

### Top Nav
- Left: "Rentor Internal" wordmark + small house icon
- Right: green pulsing dot + "Live" label

### Main Area — Call Log Table
Columns: Caller, Role, Property, Time  
Rows populate in real-time as the user clicks "Simulate Call" during the demo session. Empty state shows "No calls yet — click Simulate to begin."

### Floating Button (bottom-right)
"Simulate Incoming Call" — primary color, phone icon, subtle ring animation.

---

## Caller ID Modal

Triggered by the simulate button. Slides in from the right (or center overlay on mobile).

**Contents:**
- Animated phone ring icon at top
- Caller name (large) + role badge: blue pill = "Owner", green pill = "Tenant"
- Phone number with copy-to-clipboard icon
- Property address + unit number
- Open issues list: each issue as a red-bordered row with description and age ("3 days ago"). If none: "No open issues" in grey.
- Two action buttons:
  - "Log Note" — writes a row to `call_logs`, shows a brief success toast, dismisses modal
  - "Dismiss" — closes modal without logging

---

## Data Flow

1. User clicks "Simulate Incoming Call"
2. App calls Supabase to fetch a random person from `people`
3. App fetches their associated property via `tenancies` (tenant) or `properties.owner_id` (owner)
4. App fetches open issues for that property from `issues`
5. Modal renders with all data
6. If user clicks "Log Note," inserts a row into `call_logs` and appends to the on-screen call log table

All queries use the Supabase JS client directly from the frontend (no separate backend needed — Supabase RLS handles security for the demo).

---

## Error Handling

- If Supabase query fails: modal shows "Could not load caller info" with a retry button
- If no people in DB: button shows a tooltip "Database is empty"
- Network errors surface as a non-blocking toast in the corner

---

## Deployment

- Frontend: push to GitHub → connect to Vercel → auto-deploys on push
- Supabase: create project, run schema SQL, run seed SQL, copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` into Vercel environment variables

---

## Out of Scope

- Authentication / login
- Real phone/VoIP integration
- Editing tenant or property records
- Mobile-first layout (responsive is fine, but not the priority)
