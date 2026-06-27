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
