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
