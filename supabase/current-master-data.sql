-- Current master data based on the latest department/building/floor list
-- Safe to run as a standalone seed. This avoids the earlier duplicate department codes.

-- Departments
insert into public.departments (name, code, description, status, is_active)
values
  ('Pharmacy', 'PHR', 'Pharmacy department', 'Active', true),
  ('Outpatient Department (OPD)', 'OPD', 'Outpatient department', 'Active', true),
  ('Laboratory', 'LAB', 'Laboratory services', 'Active', true),
  ('Emergency Room (ER)', 'ER', 'Emergency room', 'Active', true),
  ('IT Department', 'ITD', 'Information technology department', 'Active', true),
  ('Maternity Ward', 'MAT', 'Maternity ward', 'Active', true),
  ('Inpatient Ward', 'INP', 'Inpatient ward', 'Active', true),
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
  ('Reception', 'RECP', 'Reception and front desk', 'Active', true)
on conflict (name) do nothing;

-- Buildings
insert into public.buildings (name, code, description, status, is_active)
values
  ('Main Gate Compound', 'MGC', 'Main gate compound building', 'Active', true),
  ('Block 2 (New)', 'BLK2', 'New block building', 'Active', true),
  ('Block 1 (Old)', 'BLK1', 'Old block building', 'Active', true),
  ('Block 3', 'BLK3', 'Block 3 building', 'Active', true),
  ('Store Compound', 'SC', 'Store and supplies compound', 'Active', true),
  ('Parking Area', 'PARK', 'Parking area', 'Active', true)
on conflict (name) do nothing;

-- Floors
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
