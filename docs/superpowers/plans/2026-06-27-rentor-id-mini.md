# Rentor-ID Mini Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-page React app simulating Rentor's internal VoIP caller-ID system — random caller pop-up with profile, property, and open issues fetched live from Supabase Postgres.

**Architecture:** Vite+React+TypeScript frontend talks directly to Supabase via JS client SDK (no separate backend). A `useSimulateCall` hook owns all DB logic. Components are small and focused. Deployed to Vercel with Supabase env vars injected at build time.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, @supabase/supabase-js 2, lucide-react, Vitest + @testing-library/react, Vercel

## Global Constraints
- Use `bun` for all package management and script execution
- Supabase credentials via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only — never hardcoded
- Tailwind utility classes only — no inline styles; only `src/index.css` for Tailwind directives
- All DB queries go through `src/lib/supabase.ts` (client) and `src/hooks/useSimulateCall.ts` (logic)
- Commit after every task

## File Map

```
rentor-id-mini/
├── src/
│   ├── main.tsx                      # entry point (default Vite)
│   ├── App.tsx                       # root: state, wiring
│   ├── App.css                       # intentionally empty
│   ├── index.css                     # Tailwind directives only
│   ├── test-setup.ts                 # @testing-library/jest-dom import
│   ├── lib/
│   │   └── supabase.ts               # Supabase client singleton
│   ├── types/
│   │   └── index.ts                  # Person, Property, Issue, CallLog, CallerContext, CallEntry
│   ├── hooks/
│   │   ├── useSimulateCall.ts        # all DB fetching + log insert
│   │   └── useSimulateCall.test.ts   # owner-path test
│   ├── components/
│   │   ├── NavBar.tsx                # top nav, logo, live dot
│   │   ├── SimulateButton.tsx        # floating button
│   │   ├── CallerModal.tsx           # incoming call overlay
│   │   ├── CallLogTable.tsx          # recent calls table
│   │   └── Toast.tsx                 # success/error notification
│   └── db/
│       ├── schema.sql                # table definitions + RLS
│       └── seed.sql                  # 9 people, 4 properties, 6 tenancies, 8 issues
├── .env.example
├── .env.local                        # gitignored
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── docs/                             # spec and plan (already exists)
```

---

### Task 1: Scaffold project, configure Tailwind and Vitest, create Supabase client and shared types

**Files:**
- Create via scaffold: `vite.config.ts`, `tsconfig.json`, `package.json`, `src/main.tsx`, `index.html`
- Create: `src/lib/supabase.ts`
- Create: `src/types/index.ts`
- Create: `src/test-setup.ts`
- Create: `.env.example`, `.env.local`
- Modify: `tailwind.config.js`, `src/index.css`, `src/App.css`, `vite.config.ts`, `.gitignore`

**Interfaces:**
- Produces: `supabase` default export from `src/lib/supabase.ts`
- Produces: `Person`, `Property`, `Issue`, `CallLog`, `CallerContext`, `CallEntry` from `src/types/index.ts`

- [ ] **Step 1: Scaffold Vite project into existing directory**

```bash
cd /Users/rd/rentor-id-mini
bun create vite . --template react-ts
```

When prompted about the non-empty directory, choose **"Ignore files and continue"**. The `docs/` folder is unaffected.

```bash
bun install
```

- [ ] **Step 2: Install dependencies**

```bash
bun add @supabase/supabase-js lucide-react
bun add -d tailwindcss@3 postcss autoprefixer vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
bunx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `tailwind.config.js` with:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Replace `src/index.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Replace `src/App.css` with:
```css
/* intentionally empty — all styles via Tailwind */
```

- [ ] **Step 4: Configure Vitest in vite.config.ts**

Replace `vite.config.ts` with:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `src/test-setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Create Supabase client**

Create `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)
```

- [ ] **Step 6: Create shared types**

Create `src/types/index.ts`:
```ts
export type Role = 'tenant' | 'owner'
export type IssueStatus = 'open' | 'resolved'

export interface Person {
  id: string
  name: string
  phone: string
  role: Role
}

export interface Property {
  id: string
  address: string
  unit: string
  owner_id: string
}

export interface Issue {
  id: string
  property_id: string
  description: string
  status: IssueStatus
  created_at: string
}

export interface CallLog {
  id: string
  person_id: string
  property_id: string
  logged_at: string
  note: string | null
}

export interface CallerContext {
  person: Person
  property: Property
  issues: Issue[]
}

export interface CallEntry {
  id: string
  person: Person
  property: Property
  timestamp: Date
}
```

- [ ] **Step 7: Create env files**

Create `.env.example`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Create `.env.local` (fill in after Task 2):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Ensure `.gitignore` contains (add if missing):
```
.env.local
.env.*.local
node_modules/
dist/
```

- [ ] **Step 8: Verify dev server starts**

```bash
bun run dev
```

Expected: Vite dev server on http://localhost:5173 with default React template. No TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React+TS, configure Tailwind, Vitest, and Supabase client"
```

---

### Task 2: Database schema, seed data, and Supabase project setup

**Files:**
- Create: `src/db/schema.sql`
- Create: `src/db/seed.sql`

**Interfaces:**
- Produces: live Supabase Postgres project with 5 tables, 9 people, 4 properties, 6 tenancies, 8 issues, RLS enabled

- [ ] **Step 1: Write schema SQL**

Create `src/db/schema.sql`:
```sql
create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  role text not null check (role in ('tenant', 'owner'))
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  unit text not null,
  owner_id uuid references people(id)
);

create table tenancies (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  property_id uuid references properties(id)
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz default now()
);

create table call_logs (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  property_id uuid references properties(id),
  logged_at timestamptz default now(),
  note text
);

-- RLS: anon can read reference tables; anon can insert call_logs only
alter table people enable row level security;
alter table properties enable row level security;
alter table tenancies enable row level security;
alter table issues enable row level security;
alter table call_logs enable row level security;

create policy "anon read people" on people for select to anon using (true);
create policy "anon read properties" on properties for select to anon using (true);
create policy "anon read tenancies" on tenancies for select to anon using (true);
create policy "anon read issues" on issues for select to anon using (true);
create policy "anon insert call_logs" on call_logs for insert to anon with check (true);
```

- [ ] **Step 2: Write seed SQL**

Create `src/db/seed.sql`:
```sql
-- Owners
insert into people (id, name, phone, role) values
  ('00000000-0000-0000-0000-000000000001', 'Marcus Williams', '+1-707-555-0101', 'owner'),
  ('00000000-0000-0000-0000-000000000002', 'Linda Chen',      '+1-707-555-0102', 'owner'),
  ('00000000-0000-0000-0000-000000000003', 'Robert Kim',      '+1-707-555-0103', 'owner');

-- Tenants
insert into people (id, name, phone, role) values
  ('00000000-0000-0000-0000-000000000004', 'Sarah Johnson',  '+1-707-555-0201', 'tenant'),
  ('00000000-0000-0000-0000-000000000005', 'James Martinez', '+1-707-555-0202', 'tenant'),
  ('00000000-0000-0000-0000-000000000006', 'Emily Thompson', '+1-707-555-0203', 'tenant'),
  ('00000000-0000-0000-0000-000000000007', 'David Park',     '+1-707-555-0204', 'tenant'),
  ('00000000-0000-0000-0000-000000000008', 'Jessica Lee',    '+1-707-555-0205', 'tenant'),
  ('00000000-0000-0000-0000-000000000009', 'Michael Brown',  '+1-707-555-0206', 'tenant');

-- Properties
insert into properties (id, address, unit, owner_id) values
  ('00000000-0000-0000-0001-000000000001', '3109 H St, Eureka, CA',        '1A',      '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0001-000000000002', '3109 H St, Eureka, CA',        '2B',      '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0001-000000000003', '821 Broadway Ave, Eureka, CA', 'Suite 4', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0001-000000000004', '500 Pine St, Eureka, CA',      '7C',      '00000000-0000-0000-0000-000000000003');

-- Tenancies (who lives where)
insert into tenancies (person_id, property_id) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000001'), -- Sarah    → 3109 H 1A
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0001-000000000001'), -- James    → 3109 H 1A
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0001-000000000002'), -- Emily    → 3109 H 2B
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0001-000000000003'), -- David    → 821 Broadway
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0001-000000000003'), -- Jessica  → 821 Broadway
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0001-000000000004'); -- Michael  → 500 Pine

-- Issues
insert into issues (property_id, description, status, created_at) values
  ('00000000-0000-0000-0001-000000000001', 'Leaking pipe under kitchen sink',    'open',     now() - interval '3 days'),
  ('00000000-0000-0000-0001-000000000001', 'Heating unit making loud noise',     'open',     now() - interval '8 days'),
  ('00000000-0000-0000-0001-000000000002', 'Broken window latch in bedroom',     'open',     now() - interval '1 day'),
  ('00000000-0000-0000-0001-000000000002', 'AC filter replacement needed',       'resolved', now() - interval '14 days'),
  ('00000000-0000-0000-0001-000000000003', 'Mold in bathroom ceiling',           'open',     now() - interval '12 days'),
  ('00000000-0000-0000-0001-000000000003', 'Dishwasher not draining',            'resolved', now() - interval '5 days'),
  ('00000000-0000-0000-0001-000000000004', 'Parking gate code not working',      'open',     now() - interval '2 days'),
  ('00000000-0000-0000-0001-000000000004', 'Elevator out of service on floor 7', 'open',     now() - interval '6 days');
```

- [ ] **Step 3: Create Supabase project and run SQL**

1. Go to https://supabase.com → create free account → New Project named `rentor-id-mini`
2. In **SQL Editor**, paste and run the full contents of `src/db/schema.sql`
3. In **SQL Editor**, paste and run the full contents of `src/db/seed.sql`
4. Go to **Project Settings → API** → copy **Project URL** and **anon public** key
5. Paste into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

- [ ] **Step 4: Verify data in Table Editor**

In Supabase Table Editor confirm:
- `people`: 9 rows (3 owners, 6 tenants)
- `properties`: 4 rows
- `tenancies`: 6 rows
- `issues`: 8 rows (6 open, 2 resolved)
- `call_logs`: 0 rows (populated by the app)

- [ ] **Step 5: Commit**

```bash
git add src/db/
git commit -m "feat: add database schema and seed SQL"
```

---

### Task 3: `useSimulateCall` hook with test

**Files:**
- Create: `src/hooks/useSimulateCall.ts`
- Create: `src/hooks/useSimulateCall.test.ts`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.ts`; `CallerContext`, `Person`, `Property` from `src/types/index.ts`
- Produces: `useSimulateCall(): { call: () => Promise<CallerContext | null>, logNote: (ctx: CallerContext) => Promise<void>, loading: boolean, error: string | null }`

- [ ] **Step 1: Write failing test**

Create `src/hooks/useSimulateCall.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSimulateCall } from './useSimulateCall'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../lib/supabase'

const mockOwner = { id: 'owner-1', name: 'Marcus Williams', phone: '+1-707-555-0101', role: 'owner' }
const mockProperty = { id: 'prop-1', address: '3109 H St', unit: '1A', owner_id: 'owner-1' }
const mockIssues = [
  { id: 'issue-1', property_id: 'prop-1', description: 'Leaking pipe', status: 'open', created_at: '2026-06-24T10:00:00Z' },
]

function makePeopleChain(people: unknown[]) {
  return { select: vi.fn().mockResolvedValue({ data: people, error: null }) }
}

function makePropertiesChain(property: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: property, error: null }),
  }
}

function makeIssuesChain(issues: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: issues, error: null }),
  }
}

describe('useSimulateCall', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns CallerContext for an owner caller', async () => {
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom
      .mockReturnValueOnce(makePeopleChain([mockOwner]))
      .mockReturnValueOnce(makePropertiesChain(mockProperty))
      .mockReturnValueOnce(makeIssuesChain(mockIssues))

    const { result } = renderHook(() => useSimulateCall())

    let context: Awaited<ReturnType<typeof result.current.call>>
    await act(async () => {
      context = await result.current.call()
    })

    expect(context).toEqual({ person: mockOwner, property: mockProperty, issues: mockIssues })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run vitest run src/hooks/useSimulateCall.test.ts
```

Expected: FAIL — `Cannot find module './useSimulateCall'`

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useSimulateCall.ts`:
```ts
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CallerContext, Person, Property } from '../types'

export function useSimulateCall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async (): Promise<CallerContext | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data: people, error: e1 } = await supabase.from('people').select('*')
      if (e1) throw e1
      if (!people || people.length === 0) throw new Error('No people in database')

      const person = people[Math.floor(Math.random() * people.length)] as Person

      let property: Property

      if (person.role === 'owner') {
        const { data, error: e2 } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', person.id)
          .limit(1)
          .single()
        if (e2) throw e2
        property = data as Property
      } else {
        const { data, error: e2 } = await supabase
          .from('tenancies')
          .select('property_id, properties(*)')
          .eq('person_id', person.id)
          .limit(1)
          .single()
        if (e2) throw e2
        property = (data as { properties: Property }).properties
      }

      const { data: issues, error: e3 } = await supabase
        .from('issues')
        .select('*')
        .eq('property_id', property.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (e3) throw e3

      return { person, property, issues: issues ?? [] }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caller')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logNote = useCallback(async (ctx: CallerContext): Promise<void> => {
    await supabase.from('call_logs').insert({
      person_id: ctx.person.id,
      property_id: ctx.property.id,
    })
  }, [])

  return { call, logNote, loading, error }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run vitest run src/hooks/useSimulateCall.test.ts
```

Expected: PASS — 1 passed

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useSimulateCall hook with owner-path test"
```

---

### Task 4: NavBar, SimulateButton, and Toast components

**Files:**
- Create: `src/components/NavBar.tsx`
- Create: `src/components/SimulateButton.tsx`
- Create: `src/components/Toast.tsx`

**Interfaces:**
- Produces: `<NavBar />` — no props
- Produces: `<SimulateButton onClick={() => void} loading={boolean} />`
- Produces: `<Toast message={string} type={'success'|'error'} onClose={() => void} />`

- [ ] **Step 1: Create NavBar**

Create `src/components/NavBar.tsx`:
```tsx
import { Building2 } from 'lucide-react'

export function NavBar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Building2 className="text-blue-400 w-5 h-5" />
        <span className="text-white font-semibold text-lg tracking-tight">Rentor Internal</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-green-400 text-sm font-medium">Live</span>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create SimulateButton**

Create `src/components/SimulateButton.tsx`:
```tsx
import { Phone } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
}

export function SimulateButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="fixed bottom-8 right-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-full shadow-lg shadow-blue-900/50 transition-colors"
    >
      <Phone className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
      {loading ? 'Connecting...' : 'Simulate Incoming Call'}
    </button>
  )
}
```

- [ ] **Step 3: Create Toast**

Create `src/components/Toast.tsx`:
```tsx
import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface Props {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const border = type === 'success' ? 'border-green-700 bg-green-900/50' : 'border-red-700 bg-red-900/50'

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 border rounded-lg shadow-xl px-4 py-3 ${border}`}>
      {type === 'success'
        ? <CheckCircle className="text-green-400 w-5 h-5 shrink-0" />
        : <XCircle className="text-red-400 w-5 h-5 shrink-0" />}
      <span className="text-gray-100 text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/NavBar.tsx src/components/SimulateButton.tsx src/components/Toast.tsx
git commit -m "feat: add NavBar, SimulateButton, and Toast components"
```

---

### Task 5: CallerModal component

**Files:**
- Create: `src/components/CallerModal.tsx`

**Interfaces:**
- Consumes: `CallerContext` from `src/types/index.ts`
- Produces: `<CallerModal context={CallerContext} onLogNote={() => void} onDismiss={() => void} />`

- [ ] **Step 1: Create CallerModal**

Create `src/components/CallerModal.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Phone, MapPin, AlertTriangle, X, ClipboardList } from 'lucide-react'
import type { CallerContext } from '../types'

interface Props {
  context: CallerContext
  onLogNote: () => void
  onDismiss: () => void
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function CallerModal({ context, onLogNote, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const { person, property, issues } = context

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-600/20 rounded-full p-3">
            <Phone className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Incoming Call</p>
            <h2 className="text-white font-bold text-xl leading-tight">{person.name}</h2>
          </div>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
              person.role === 'owner' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
            }`}
          >
            {person.role === 'owner' ? 'Owner' : 'Tenant'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="font-mono text-sm">{person.phone}</span>
        </div>

        <div className="flex items-start gap-2 mb-5 text-gray-300">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{property.address}</p>
            <p className="text-xs text-gray-500">Unit {property.unit}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400 text-xs uppercase tracking-widest">Open Issues</span>
          </div>
          {issues.length === 0 ? (
            <p className="text-gray-600 text-sm italic pl-1">No open issues</p>
          ) : (
            <ul className="space-y-2">
              {issues.map(issue => (
                <li
                  key={issue.id}
                  className="flex items-start justify-between bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2"
                >
                  <span className="text-red-300 text-sm">{issue.description}</span>
                  <span className="text-red-600 text-xs ml-3 shrink-0">{timeAgo(issue.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onLogNote}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Log Note
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CallerModal.tsx
git commit -m "feat: add CallerModal with animated overlay"
```

---

### Task 6: CallLogTable and App.tsx wiring

**Files:**
- Create: `src/components/CallLogTable.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CallEntry` from `src/types/index.ts`; `useSimulateCall` from `src/hooks/useSimulateCall.ts`; all components
- Produces: complete working single-page app

- [ ] **Step 1: Create CallLogTable**

Create `src/components/CallLogTable.tsx`:
```tsx
import type { CallEntry } from '../types'

interface Props {
  entries: CallEntry[]
}

export function CallLogTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <p className="text-lg font-medium">No calls yet</p>
        <p className="text-sm mt-1">Click "Simulate Incoming Call" to begin</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800/50 text-gray-400 text-left">
            <th className="px-5 py-3 font-medium">Caller</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Property</th>
            <th className="px-5 py-3 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              className={`border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/60'} hover:bg-gray-800/50 transition-colors`}
            >
              <td className="px-5 py-3 text-white font-medium">{entry.person.name}</td>
              <td className="px-5 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    entry.person.role === 'owner' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                  }`}
                >
                  {entry.person.role}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-400">
                {entry.property.address} · Unit {entry.property.unit}
              </td>
              <td className="px-5 py-3 text-gray-500 tabular-nums">
                {entry.timestamp.toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Replace App.tsx**

Replace `src/App.tsx` with:
```tsx
import { useState, useCallback } from 'react'
import { NavBar } from './components/NavBar'
import { SimulateButton } from './components/SimulateButton'
import { CallerModal } from './components/CallerModal'
import { CallLogTable } from './components/CallLogTable'
import { Toast } from './components/Toast'
import { useSimulateCall } from './hooks/useSimulateCall'
import type { CallerContext, CallEntry } from './types'

export default function App() {
  const [modal, setModal] = useState<CallerContext | null>(null)
  const [callLog, setCallLog] = useState<CallEntry[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const { call, logNote, loading, error } = useSimulateCall()

  const handleSimulate = useCallback(async () => {
    const context = await call()
    if (context) {
      setModal(context)
      setCallLog(prev => [{
        id: crypto.randomUUID(),
        person: context.person,
        property: context.property,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [call])

  const handleLogNote = useCallback(async () => {
    if (!modal) return
    await logNote(modal)
    setToast({ message: 'Call logged successfully', type: 'success' })
    setModal(null)
  }, [modal, logNote])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <NavBar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Call Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time caller identification dashboard</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <CallLogTable entries={callLog} />
      </main>

      <SimulateButton onClick={handleSimulate} loading={loading} />

      {modal && (
        <CallerModal
          context={modal}
          onLogNote={handleLogNote}
          onDismiss={() => setModal(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify full app in browser**

```bash
bun run dev
```

Open http://localhost:5173 and confirm:
- Dark dashboard, "Rentor Internal" nav, green pulsing "Live" dot
- "No calls yet" empty state
- Blue floating button bottom-right

Click "Simulate Incoming Call":
- Button shows "Connecting..." while loading
- Modal slides in with caller name, role badge (blue=Owner, green=Tenant), phone, property address+unit, open issues with age, two action buttons
- "Log Note" → modal closes, green success toast appears, caller row appears in table
- "Dismiss" → modal closes, row still in table

- [ ] **Step 4: Commit**

```bash
git add src/components/CallLogTable.tsx src/App.tsx
git commit -m "feat: wire up full app — call log table, modal flow, and App state"
```

---

### Task 7: Deploy to GitHub and Vercel

**Files:** none new

**Interfaces:**
- Produces: public live URL (e.g., `https://rentor-id-mini.vercel.app`)

- [ ] **Step 1: Create GitHub repository**

Go to https://github.com/new → create a **public** repo named `rentor-id-mini`. Do not initialize with README.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/rentor-id-mini.git
git branch -M main
git push -u origin main
```

Expected: all commits pushed, branch `main` set.

- [ ] **Step 3: Deploy on Vercel**

1. Go to https://vercel.com → sign in with GitHub
2. Click **Add New → Project** → import `rentor-id-mini`
3. Framework preset auto-detects as **Vite** — leave all build settings as default
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**

Expected: build completes in ~60s, green "Congratulations" screen.

- [ ] **Step 4: Verify live app**

Open the Vercel-assigned URL. Click "Simulate Incoming Call" — confirm it fetches real data from Supabase and the modal shows a real caller's details.

- [ ] **Step 5: Copy URL for application email**

Paste the live URL into your application email as:

```
Live Demo: https://rentor-id-mini.vercel.app
GitHub: https://github.com/YOUR_USERNAME/rentor-id-mini
```
