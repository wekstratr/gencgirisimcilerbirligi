import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Call at the top of any admin-only Server Component/page.
 * Redirects to /login if there's no session, or to / if the user is
 * logged in but isn't an admin. Returns the admin's app_users row on success.
 */
export async function requireAdmin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role, tenant_id, email")
    .eq("id", user!.id)
    .maybeSingle();

  if (!appUser || appUser.role !== "admin") {
    redirect("/");
  }

  return appUser;
}

/**
 * Call at the top of a tenant-owner-only Server Component/page (restaurant or
 * DOPQ dashboards). Admins are also allowed through. Redirects otherwise.
 */
export async function requireTenantAccess(tenantId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role, tenant_id")
    .eq("id", user!.id)
    .maybeSingle();

  const isAdmin = appUser?.role === "admin";
  const ownsTenant = appUser?.tenant_id === tenantId;

  if (!appUser || (!isAdmin && !ownsTenant)) {
    redirect("/");
  }

  return appUser;
}
