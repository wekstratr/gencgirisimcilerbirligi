// Hand-written types mirroring supabase/schema.sql.
// Once the project is linked to a real Supabase project, regenerate this file with:
//   npx supabase gen types typescript --project-id <id> > lib/types.ts

export type TenantType = "restaurant" | "dopq";
export type UserRole = "admin" | "owner" | "staff";
export type PhoneCondition = "new" | "used";

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  logo: string | null;
}

export interface Tenant {
  id: string;
  type: TenantType;
  name: string;
  slug: string;
  reference_code: string;
  theme_config: ThemeConfig;
  is_active: boolean;
  created_at: string;
}

export interface AppUser {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  tenant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Phone {
  id: string;
  tenant_id: string;
  brand: string;
  model: string;
  ram_gb: number;
  storage_gb: number;
  price: number;
  condition: PhoneCondition;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface QrVisit {
  id: string;
  tenant_id: string;
  target_type: "phone" | "menu";
  target_id: string;
  visitor_ip_hash: string;
  created_at: string;
}

export interface Earning {
  id: string;
  tenant_id: string;
  amount: number;
  note: string | null;
  recorded_by: string;
  created_at: string;
}

// Minimal placeholder so `createBrowserClient<Database>` / `createServerClient<Database>`
// type-check. Replace with generated types for full type safety.
export type Database = any;
