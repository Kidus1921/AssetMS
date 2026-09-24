alter table public.departments enable row level security;
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.asset_categories enable row level security;
alter table public.asset_types enable row level security;
alter table public.assets enable row level security;

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

select id, name, code from public.departments order by name;