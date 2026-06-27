-- Migration 003: triage, leases, and structured call disposition.
-- Run in the Supabase SQL Editor after 002.

-- ── Issues: triage fields ───────────────────────────────────────────────
alter table issues add column if not exists priority text not null default 'routine'
  check (priority in ('emergency', 'urgent', 'routine'));
alter table issues add column if not exists category text not null default 'other'
  check (category in ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other'));

-- Agents log NEW issues from a call (the report-a-problem flow).
create policy anon_insert_issues on issues for insert to anon with check (true);

-- ── Tenancies: lease + rent context ─────────────────────────────────────
alter table tenancies add column if not exists lease_start date;
alter table tenancies add column if not exists lease_end date;
alter table tenancies add column if not exists rent_cents integer;
alter table tenancies add column if not exists rent_status text default 'paid'
  check (rent_status in ('paid', 'late', 'overdue'));

-- ── Call logs: structured disposition ───────────────────────────────────
alter table call_logs add column if not exists reason text;
alter table call_logs add column if not exists follow_up boolean not null default false;
-- Agents clear a follow-up flag once handled.
create policy anon_update_call_logs on call_logs for update to anon using (true) with check (true);

-- ── Enrich existing demo data so the UI has something to show ────────────
update issues set priority = 'emergency', category = 'plumbing'
  where description ilike '%leaking pipe%';
update issues set priority = 'urgent', category = 'hvac'
  where description ilike '%heating%' or description ilike '%AC%';
update issues set priority = 'urgent', category = 'structural'
  where description ilike '%mold%';
update issues set priority = 'routine', category = 'structural'
  where description ilike '%window%';
update issues set priority = 'routine', category = 'appliance'
  where description ilike '%dishwasher%';
update issues set priority = 'urgent', category = 'electrical'
  where description ilike '%gate%' or description ilike '%elevator%';

-- Leases: most current, one overdue and one late for realism.
update tenancies set
  lease_start = date '2025-09-01',
  lease_end   = date '2026-08-31',
  rent_cents  = 185000,
  rent_status = 'paid';

update tenancies set rent_status = 'overdue', rent_cents = 210000
  where person_id = '00000000-0000-0000-0000-000000000005'; -- James Martinez
update tenancies set rent_status = 'late', rent_cents = 169500
  where person_id = '00000000-0000-0000-0000-000000000008'; -- Jessica Lee
