-- Migration 002: enable persisted call history + agent actions
-- Run this in the Supabase SQL Editor after schema.sql + seed.sql.

-- Let the dashboard read back the call log (history that survives refresh).
create policy anon_read_call_logs on call_logs for select to anon using (true);

-- Let an agent resolve / reopen a maintenance issue from the caller card.
create policy anon_update_issues on issues for update to anon using (true) with check (true);

-- Track which agent (simulated) handled the call + a resolved timestamp on issues.
alter table call_logs add column if not exists agent_name text;
alter table issues   add column if not exists resolved_at timestamptz;

-- Helpful indexes for the queries the app runs most.
create index if not exists idx_issues_property      on issues (property_id);
create index if not exists idx_issues_status        on issues (status);
create index if not exists idx_tenancies_property   on tenancies (property_id);
create index if not exists idx_call_logs_logged_at  on call_logs (logged_at desc);
