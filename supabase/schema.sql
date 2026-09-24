-- Create extension
create extension if not exists pgcrypto;

-- Enums
create type asset_condition as enum (
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged',
  'Non-functional'
);

create type asset_status as enum (
  'Active',
  'In Use',
  'In Storage',
  'Under Maintenance',
  'Missing',
  'Lost',
  'Retired',
  'Disposed',
  'Pending Disposal'
);

create type maintenance_type as enum (
  'Preventive',
  'Corrective',
  'Emergency',
  'Inspection',
  'Calibration'
);

create type maintenance_priority as enum (
  'Low',
  'Medium',
  'High',
  'Critical'
);

create type maintenance_status as enum (
  'Open',
  'Assigned',
  'In Progress',
  'Waiting Parts',
  'Completed',
  'Cancelled'
);

create type transfer_status as enum (
  'Requested',
  'Approved',
  'Transferred'
);

create type request_status as enum (
  'Pending',
  'Approved',
  'Rejected',
  'Fulfilled'
);

create type verification_status as enum (
  'In Progress',
  'Completed'
);

create type disposal_status as enum (
  'Pending Disposal',
  'Approved',
  'Disposed'
);

-- Master data
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sub_departments (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  name text not null,
  code text,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, name)
);

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete restrict,
  name text not null,
  floor_number text,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (building_id, name)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete restrict,
  floor_id uuid not null references public.floors(id) on delete restrict,
  department_id uuid references public.departments(id) on delete set null,
  sub_department_id uuid references public.sub_departments(id) on delete set null,
  room_number text not null,
  name text,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (building_id, floor_id, room_number)
);

create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.asset_categories(id) on delete restrict,
  name text not null,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

create table if not exists public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  name text not null,
  category_id uuid not null references public.asset_categories(id) on delete restrict,
  type_id uuid references public.asset_types(id) on delete set null,
  manufacturer_id uuid references public.manufacturers(id) on delete set null,
  serial_number text,
  model_number text,
  inventory_number text,
  barcode text,
  department_id uuid references public.departments(id) on delete set null,
  sub_department_id uuid references public.sub_departments(id) on delete set null,
  building_id uuid references public.buildings(id) on delete set null,
  floor_id uuid references public.floors(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  specific_location text,
  condition asset_condition not null default 'Good',
  status asset_status not null default 'Active',
  label_attached boolean not null default false,
  qa_checked boolean not null default false,
  purchase_date date,
  acquisition_date date,
  supplier_id uuid references public.suppliers(id) on delete set null,
  purchase_order text,
  invoice_number text,
  acquisition_cost numeric(12,2),
  funding_source text,
  warranty_start date,
  warranty_end date,
  warranty_provider text,
  useful_life_years integer,
  salvage_value numeric(12,2),
  remarks text,
  assigned_user_id uuid,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_assets_serial_number on public.assets (serial_number) where serial_number is not null;
create unique index if not exists ux_assets_inventory_number on public.assets (inventory_number) where inventory_number is not null;

-- Assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  employee_id uuid not null,
  department_id uuid references public.departments(id) on delete set null,
  location_id uuid references public.rooms(id) on delete set null,
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transfers
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  from_location text not null,
  to_location text not null,
  reason text,
  requested_by uuid,
  notes text,
  status transfer_status not null default 'Requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Maintenance
create table if not exists public.maintenance (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  maintenance_type maintenance_type not null,
  priority maintenance_priority not null,
  problem text not null,
  technician_id uuid,
  status maintenance_status not null default 'Open',
  start_date timestamptz,
  completion_date timestamptz,
  cost numeric(12,2),
  resolution text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Verification
create table if not exists public.verification_sessions (
  id uuid primary key default gen_random_uuid(),
  verification_id text not null unique,
  location_id uuid references public.rooms(id) on delete set null,
  verifier_id uuid not null,
  verification_date timestamptz not null default now(),
  status verification_status not null default 'In Progress',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.verification_sessions(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  expected boolean not null default true,
  verified boolean not null default false,
  missing boolean not null default false,
  damaged boolean not null default false,
  unexpected boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, asset_id)
);

-- Audit log
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_name text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  changes text,
  created_at timestamptz not null default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'system',
  read_flag boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- Requests / disposals
create table if not exists public.asset_requests (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  requested_item text not null,
  category_id uuid references public.asset_categories(id) on delete set null,
  quantity integer not null default 1,
  reason text,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  requested_by uuid,
  status request_status not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disposals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  reason text not null,
  condition asset_condition,
  disposal_method text,
  disposal_date timestamptz,
  disposal_value numeric(12,2),
  approved_by uuid,
  notes text,
  status disposal_status not null default 'Pending Disposal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare r record;
begin
  for r in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'departments', 'sub_departments', 'buildings', 'floors', 'rooms',
        'asset_categories', 'asset_types', 'manufacturers', 'suppliers',
        'assets', 'assignments', 'transfers', 'maintenance',
        'verification_sessions', 'verification_items', 'audit_logs',
        'notifications', 'asset_requests', 'disposals'
      )
  loop
    execute format(
      'create trigger trg_%I_set_updated_at before update on public.%I
       for each row execute procedure public.set_updated_at();',
      r.table_name,
      r.table_name
    );
  end loop;
end $$;

-- RLS
alter table public.departments enable row level security;
alter table public.sub_departments enable row level security;
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.asset_categories enable row level security;
alter table public.asset_types enable row level security;
alter table public.manufacturers enable row level security;
alter table public.suppliers enable row level security;
alter table public.assets enable row level security;
alter table public.assignments enable row level security;
alter table public.transfers enable row level security;
alter table public.maintenance enable row level security;
alter table public.verification_sessions enable row level security;
alter table public.verification_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.asset_requests enable row level security;
alter table public.disposals enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'departments' and policyname = 'Anon users can read departments') then
    create policy "Anon users can read departments" on public.departments for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'buildings' and policyname = 'Anon users can read buildings') then
    create policy "Anon users can read buildings" on public.buildings for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'floors' and policyname = 'Anon users can read floors') then
    create policy "Anon users can read floors" on public.floors for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'rooms' and policyname = 'Anon users can read rooms') then
    create policy "Anon users can read rooms" on public.rooms for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'asset_categories' and policyname = 'Anon users can read asset categories') then
    create policy "Anon users can read asset categories" on public.asset_categories for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'asset_types' and policyname = 'Anon users can read asset types') then
    create policy "Anon users can read asset types" on public.asset_types for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'Anon users can read assets') then
    create policy "Anon users can read assets" on public.assets for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'Anon users can insert assets') then
    create policy "Anon users can insert assets" on public.assets for insert to anon with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'departments'
      and policyname = 'Authenticated users can read departments'
  ) then
    create policy "Authenticated users can read departments"
    on public.departments for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'departments'
      and policyname = 'Authenticated users can write departments'
  ) then
    create policy "Authenticated users can write departments"
    on public.departments for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'departments'
      and policyname = 'Authenticated users can update departments'
  ) then
    create policy "Authenticated users can update departments"
    on public.departments for update to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'sub_departments'
      and policyname = 'Authenticated users can read sub_departments'
  ) then
    create policy "Authenticated users can read sub_departments"
    on public.sub_departments for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'sub_departments'
      and policyname = 'Authenticated users can write sub_departments'
  ) then
    create policy "Authenticated users can write sub_departments"
    on public.sub_departments for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'buildings'
      and policyname = 'Authenticated users can read buildings'
  ) then
    create policy "Authenticated users can read buildings"
    on public.buildings for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'buildings'
      and policyname = 'Authenticated users can write buildings'
  ) then
    create policy "Authenticated users can write buildings"
    on public.buildings for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'floors'
      and policyname = 'Authenticated users can read floors'
  ) then
    create policy "Authenticated users can read floors"
    on public.floors for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'floors'
      and policyname = 'Authenticated users can write floors'
  ) then
    create policy "Authenticated users can write floors"
    on public.floors for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'rooms'
      and policyname = 'Authenticated users can read rooms'
  ) then
    create policy "Authenticated users can read rooms"
    on public.rooms for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'rooms'
      and policyname = 'Authenticated users can write rooms'
  ) then
    create policy "Authenticated users can write rooms"
    on public.rooms for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'assets'
      and policyname = 'Authenticated users can read assets'
  ) then
    create policy "Authenticated users can read assets"
    on public.assets for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'assets'
      and policyname = 'Authenticated users can write assets'
  ) then
    create policy "Authenticated users can write assets"
    on public.assets for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'assets'
      and policyname = 'Authenticated users can update assets'
  ) then
    create policy "Authenticated users can update assets"
    on public.assets for update to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance'
      and policyname = 'Authenticated users can read maintenance'
  ) then
    create policy "Authenticated users can read maintenance"
    on public.maintenance for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance'
      and policyname = 'Authenticated users can write maintenance'
  ) then
    create policy "Authenticated users can write maintenance"
    on public.maintenance for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transfers'
      and policyname = 'Authenticated users can read transfers'
  ) then
    create policy "Authenticated users can read transfers"
    on public.transfers for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transfers'
      and policyname = 'Authenticated users can write transfers'
  ) then
    create policy "Authenticated users can write transfers"
    on public.transfers for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'verification_sessions'
      and policyname = 'Authenticated users can read verification_sessions'
  ) then
    create policy "Authenticated users can read verification_sessions"
    on public.verification_sessions for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'verification_sessions'
      and policyname = 'Authenticated users can write verification_sessions'
  ) then
    create policy "Authenticated users can write verification_sessions"
    on public.verification_sessions for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'verification_items'
      and policyname = 'Authenticated users can read verification_items'
  ) then
    create policy "Authenticated users can read verification_items"
    on public.verification_items for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'verification_items'
      and policyname = 'Authenticated users can write verification_items'
  ) then
    create policy "Authenticated users can write verification_items"
    on public.verification_items for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'Authenticated users can read audit_logs'
  ) then
    create policy "Authenticated users can read audit_logs"
    on public.audit_logs for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'Authenticated users can write audit_logs'
  ) then
    create policy "Authenticated users can write audit_logs"
    on public.audit_logs for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Authenticated users can read notifications'
  ) then
    create policy "Authenticated users can read notifications"
    on public.notifications for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Authenticated users can write notifications'
  ) then
    create policy "Authenticated users can write notifications"
    on public.notifications for insert to authenticated with check (true);
  end if;
end $$;

-- Sample seed data
insert into public.departments (name, code, description, status, is_active)
values
  ('Pharmacy', 'PHR', 'Pharmacy department', 'Active', true),
  ('Outpatient Department (OPD)', 'OPD', 'OPD clinic operations', 'Active', true),
  ('Laboratory', 'LAB', 'Laboratory services', 'Active', true),
  ('Emergency Room (ER)', 'ER', 'Emergency room', 'Active', true),
  ('IT Department', 'ITD', 'Information technology department', 'Active', true),
  ('Maternity Ward', 'MAT', 'Maternity ward', 'Active', true),
  ('Inpatient Ward', 'INP', 'Inpatient care ward', 'Active', true),
  ('Pediatrics', 'PED', 'Pediatric services', 'Active', true),
  ('Cleaning / Sanitation Unit', 'CLEAN', 'Cleaning and sanitation services', 'Active', true),
  ('Surgery', 'SUR', 'Surgical services', 'Active', true),
  ('Kitchen / Nutrition', 'NUT', 'Kitchen and nutrition unit', 'Active', true),
  ('Dialysis Unit', 'DIAL', 'Dialysis services', 'Active', true),
  ('Radiology / Imaging', 'RAD', 'Radiology and imaging services', 'Active', true),
  ('Cardiology', 'CARD', 'Cardiology services', 'Active', true),
  ('Physiotherapy / Rehab', 'PT', 'Physiotherapy and rehabilitation', 'Active', true),
  ('Gastroenterology and Hepatology', 'GAST', 'Gastroenterology and hepatology services', 'Active', true),
  ('Store / Supplies', 'STORE', 'Medical stores and supplies', 'Active', true),
  ('Operating Room (OR) / Theatre', 'OR', 'Operating theatre and OR services', 'Active', true),
  ('Clinic-Yemariamwerk', 'CLINIC', 'Clinic services', 'Active', true),
  ('Administration', 'ADM', 'Administration office', 'Active', true),
  ('Intensive Care Unit (ICU)', 'ICU', 'Intensive care unit', 'Active', true),
  ('Mamography', 'MAM', 'Mammography unit', 'Active', true),
  ('Dental', 'DENT', 'Dental services', 'Active', true),
  ('Reception', 'RECP', 'Reception and front desk', 'Active', true),
  ('Finance', 'FIN', 'Finance and accounting', 'Active', true),
  ('Human Resources', 'HR', 'Human resources', 'Active', true)
on conflict (name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'Ultrasound Examination', 'US', 'Ultrasound imaging', 'Active', true
from public.departments where name = 'Radiology / Imaging'
on conflict (department_id, name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'CT', 'CT', 'CT Scans', 'Active', true
from public.departments where name = 'Radiology / Imaging'
on conflict (department_id, name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'X-Ray', 'XR', 'X-ray imaging', 'Active', true
from public.departments where name = 'Radiology / Imaging'
on conflict (department_id, name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'Hematology', 'HEM', 'Hematology', 'Active', true
from public.departments where name = 'Laboratory'
on conflict (department_id, name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'Chemistry', 'CHEM', 'Chemistry lab', 'Active', true
from public.departments where name = 'Laboratory'
on conflict (department_id, name) do nothing;

insert into public.sub_departments (department_id, name, code, description, status, is_active)
select id, 'Microbiology', 'MIC', 'Microbiology', 'Active', true
from public.departments where name = 'Laboratory'
on conflict (department_id, name) do nothing;

insert into public.buildings (name, code, description, status, is_active)
values
  ('Main Gate Compound', 'MGC', 'Main gate compound building', 'Active', true),
  ('Block 2 (New)', 'BLK2', 'New block building', 'Active', true),
  ('Block 1 (Old)', 'BLK1', 'Old block building', 'Active', true),
  ('Block 3', 'BLK3', 'Block 3 building', 'Active', true),
  ('Store Compound', 'SC', 'Store and supplies compound', 'Active', true),
  ('Parking Area', 'PARK', 'Parking area', 'Active', true)
on conflict (name) do nothing;

insert into public.asset_categories (name, description, status, is_active)
values
  ('Medical Equipment', 'Medical devices and equipment', 'Active', true),
  ('IT Equipment', 'Computer and network gear', 'Active', true),
  ('Furniture', 'Office and facility furniture', 'Active', true),
  ('Office Equipment', 'Office support equipment', 'Active', true),
  ('Facilities', 'Facilities equipment and HVAC', 'Active', true)
on conflict (name) do nothing;

insert into public.floors (building_id, name, floor_number, description, status, is_active)
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Main Gate Compound'
union all
select id, '1st Floor', '1', 'First floor', 'Active', true from public.buildings where name = 'Main Gate Compound'
union all
select id, '2nd Floor', '2', 'Second floor', 'Active', true from public.buildings where name = 'Main Gate Compound'
union all
select id, '3rd Floor', '3', 'Third floor', 'Active', true from public.buildings where name = 'Main Gate Compound'
union all
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Block 2 (New)'
union all
select id, '1st Floor', '1', 'First floor', 'Active', true from public.buildings where name = 'Block 2 (New)'
union all
select id, '2nd Floor', '2', 'Second floor', 'Active', true from public.buildings where name = 'Block 2 (New)'
union all
select id, '3rd Floor', '3', 'Third floor', 'Active', true from public.buildings where name = 'Block 2 (New)'
union all
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Block 1 (Old)'
union all
select id, '1st Floor', '1', 'First floor', 'Active', true from public.buildings where name = 'Block 1 (Old)'
union all
select id, '2nd Floor', '2', 'Second floor', 'Active', true from public.buildings where name = 'Block 1 (Old)'
union all
select id, '3rd Floor', '3', 'Third floor', 'Active', true from public.buildings where name = 'Block 1 (Old)'
union all
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Block 3'
union all
select id, '1st Floor', '1', 'First floor', 'Active', true from public.buildings where name = 'Block 3'
union all
select id, '2nd Floor', '2', 'Second floor', 'Active', true from public.buildings where name = 'Block 3'
union all
select id, '3rd Floor', '3', 'Third floor', 'Active', true from public.buildings where name = 'Block 3'
union all
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Store Compound'
union all
select id, 'Ground', 'Ground', 'Ground floor', 'Active', true from public.buildings where name = 'Parking Area'
on conflict (building_id, name) do nothing;
