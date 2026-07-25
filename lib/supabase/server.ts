import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 * Reads/writes the auth cookie so RLS policies see the correct `auth.uid()`.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component - safe to ignore, middleware refreshes the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component - safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service-role key. ONLY use this in trusted server code
 * (e.g. processing manual earnings entries, generating reference codes) - it
 * bypasses Row Level Security entirely.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
