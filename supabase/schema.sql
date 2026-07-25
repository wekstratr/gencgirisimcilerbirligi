-- =============================================================================
-- GBM / DOPQ Multi-tenant Platform - Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- =============================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
create type tenant_type as enum ('restaurant', 'dopq');
create type user_role as enum ('admin', 'owner', 'staff');
create type phone_condition as enum ('new', 'used');
create type qr_target_type as enum ('phone', 'menu');

-- -----------------------------------------------------------------------------
-- TENANTS (a restaurant or a phone dealer)
-- -----------------------------------------------------------------------------
create table tenants (
  id uuid primary key default gen_random_uuid(),
  type tenant_type not null,
  name text not null,
  slug text not null unique,
  -- 8-char alphanumeric, admin-issued. Used both at signup and as a password-reset
  -- verification step (per project spec).
  reference_code text not null unique,
  theme_config jsonb not null default '{
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "background": "#FFFFFF",
    "text": "#1F2937",
    "logo": null
  }'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_tenants_type on tenants(type);

-- -----------------------------------------------------------------------------
-- APP USERS (extends auth.users with role + tenant membership)
-- -----------------------------------------------------------------------------
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  role user_role not null default 'staff',
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create index idx_app_users_tenant on app_users(tenant_id);

-- Helper: is the current user an admin? Used throughout RLS policies below.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from app_users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: tenant_id of the current user (null for admins/unassigned).
create or replace function current_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from app_users where id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- MENU (restaurants)
-- -----------------------------------------------------------------------------
create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_menu_items_tenant on menu_items(tenant_id);

-- -----------------------------------------------------------------------------
-- PHONES (DOPQ)
-- -----------------------------------------------------------------------------
create table phones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand text not null,
  model text not null,
  ram_gb int not null,
  storage_gb int not null,
  price numeric(10, 2) not null,
  condition phone_condition not null default 'used',
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create index idx_phones_tenant on phones(tenant_id);

-- -----------------------------------------------------------------------------
-- QR VISITS (unique-visitor counting, IP-hash based, per-day dedupe)
-- -----------------------------------------------------------------------------
create table qr_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  target_type qr_target_type not null,
  target_id uuid not null,
  visitor_ip_hash text not null,
  visit_day date not null default current_date,
  created_at timestamptz not null default now(),
  unique (tenant_id, target_type, target_id, visitor_ip_hash, visit_day)
);

create index idx_qr_visits_tenant on qr_visits(tenant_id);
create index idx_qr_visits_target on qr_visits(target_type, target_id);

-- -----------------------------------------------------------------------------
-- EARNINGS (admin-entered, manual per spec section 2.A)
-- -----------------------------------------------------------------------------
create table earnings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  amount numeric(12, 2) not null,
  note text,
  recorded_by uuid not null references app_users(id),
  created_at timestamptz not null default now()
);

create index idx_earnings_tenant on earnings(tenant_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Per project recommendation: every table gets a tenant_id-based RLS policy.
-- Admins bypass tenant scoping entirely; everyone else is locked to their own
-- tenant_id (via app_users.tenant_id). Public read access is granted separately
-- for the storefront pages (menu / phone listings / phone comparison), since
-- QR-scanning visitors are not authenticated.
-- =============================================================================

alter table tenants enable row level security;
alter table app_users enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table phones enable row level security;
alter table qr_visits enable row level security;
alter table earnings enable row level security;

-- TENANTS -----------------------------------------------------------------
create policy "Admins manage all tenants"
  on tenants for all
  using (is_admin())
  with check (is_admin());

create policy "Owners/staff can view and update their own tenant"
  on tenants for select
  using (id = current_tenant_id());

create policy "Owners/staff can update their own tenant"
  on tenants for update
  using (id = current_tenant_id())
  with check (id = current_tenant_id());

create policy "Public can view active tenants (storefront)"
  on tenants for select
  using (is_active = true);

-- APP_USERS -----------------------------------------------------------------
create policy "Admins manage all users"
  on app_users for all
  using (is_admin())
  with check (is_admin());

create policy "Users can view themselves"
  on app_users for select
  using (id = auth.uid());

create policy "Users can update themselves"
  on app_users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- MENU_CATEGORIES -------------------------------------------------------------
create policy "Admins manage all menu categories"
  on menu_categories for all
  using (is_admin())
  with check (is_admin());

create policy "Tenant manages own menu categories"
  on menu_categories for all
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

create policy "Public can view menu categories"
  on menu_categories for select
  using (true);

-- MENU_ITEMS ------------------------------------------------------------------
create policy "Admins manage all menu items"
  on menu_items for all
  using (is_admin())
  with check (is_admin());

create policy "Tenant manages own menu items"
  on menu_items for all
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

create policy "Public can view available menu items"
  on menu_items for select
  using (is_available = true);

-- PHONES ------------------------------------------------------------------
create policy "Admins manage all phones"
  on phones for all
  using (is_admin())
  with check (is_admin());

create policy "Tenant manages own phones"
  on phones for all
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

create policy "Public can view phones"
  on phones for select
  using (true);

-- QR_VISITS ------------------------------------------------------------------
-- Inserted by an anonymous visitor scanning a QR code, so INSERT must be
-- open to the public. Only the tenant owner/staff (or an admin) can read them.
create policy "Public can record a visit"
  on qr_visits for insert
  with check (true);

create policy "Admins view all visits"
  on qr_visits for select
  using (is_admin());

create policy "Tenant views own visits"
  on qr_visits for select
  using (tenant_id = current_tenant_id());

-- EARNINGS ------------------------------------------------------------------
-- Per spec: only Admin manually processes/enters earnings data.
create policy "Admins manage all earnings"
  on earnings for all
  using (is_admin())
  with check (is_admin());

create policy "Tenant views own earnings"
  on earnings for select
  using (tenant_id = current_tenant_id());

-- =============================================================================
-- Convenience view: aggregate visit counts per tenant (used by admin dashboard)
-- =============================================================================
create or replace view tenant_visit_stats as
select
  tenant_id,
  count(*) as total_visits,
  count(distinct visitor_ip_hash) as unique_visitors
from qr_visits
group by tenant_id;
