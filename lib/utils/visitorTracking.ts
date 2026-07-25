import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Hashes the visitor IP before storing it, so we count unique visitors
 * without keeping raw IPs around (privacy + smaller RLS surface).
 */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Records a QR scan / page view. Relies on a unique constraint on
 * (tenant_id, target_type, target_id, visitor_ip_hash, day) in Postgres
 * (see supabase/schema.sql) so repeat visits from the same IP on the same
 * day don't inflate the count.
 */
export async function recordQrVisit(params: {
  tenantId: string;
  targetType: "phone" | "menu";
  targetId: string;
  requestIp: string;
}) {
  const supabase = createClient();
  const visitorIpHash = hashIp(params.requestIp);

  const { error } = await supabase.from("qr_visits").insert({
    tenant_id: params.tenantId,
    target_type: params.targetType,
    target_id: params.targetId,
    visitor_ip_hash: visitorIpHash,
  });

  // Unique-constraint violations are expected (same visitor, same day) - ignore them.
  if (error && error.code !== "23505") {
    console.error("Failed to record QR visit:", error.message);
  }
}
