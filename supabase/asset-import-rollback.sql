-- Supplemental database helpers for the Excel import workflow.
-- This file is intentionally separate so it can be committed independently from the main schema.

create or replace function public.reset_asset_database()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate table public.disposals,
                 public.asset_requests,
                 public.notifications,
                 public.audit_logs,
                 public.verification_items,
                 public.verification_sessions,
                 public.maintenance,
                 public.transfers,
                 public.assignments,
                 public.assets,
                 public.suppliers,
                 public.manufacturers,
                 public.asset_types,
                 public.asset_categories,
                 public.rooms,
                 public.floors,
                 public.buildings,
                 public.sub_departments,
                 public.departments
  restart identity cascade;
end;
$$;

comment on function public.reset_asset_database() is
  'Clears all asset-management data back to a blank database state without dropping the schema.';
