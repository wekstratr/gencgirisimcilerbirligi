import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordQrVisit } from "@/lib/utils/visitorTracking";
import Link from "next/link";

export default async function DopqStorefrontPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, theme_config")
    .eq("slug", params.tenantSlug)
    .eq("type", "dopq")
    .eq("is_active", true)
    .maybeSingle();

  if (!tenant) notFound();

  const requestIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  await recordQrVisit({ tenantId: tenant.id, targetType: "menu", targetId: tenant.id, requestIp });

  const { data: phones } = await supabase
    .from("phones")
    .select("id, brand, model, ram_gb, storage_gb, price, condition, image_url")
    .eq("tenant_id", tenant.id);

  return (
    <ThemeProvider tenantTheme={tenant.theme_config}>
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>

        <div className="flex flex-col gap-3">
          {(phones ?? []).map((phone) => (
            <Link
              key={phone.id}
              href={`/dopq/${params.tenantSlug}/${phone.id}`}
              className="flex items-center justify-between rounded-xl bg-surface-bg p-4 shadow"
            >
              <div>
                <p className="font-medium">{phone.brand} {phone.model}</p>
                <p className="text-xs text-surface-text/60">
                  {phone.ram_gb}GB RAM · {phone.storage_gb}GB ·{" "}
                  {phone.condition === "new" ? "Sıfır" : "İkinci El"}
                </p>
              </div>
              <p className="font-semibold text-secondary">
                {phone.price.toLocaleString("tr-TR")} ₺
              </p>
            </Link>
          ))}
          {(!phones || phones.length === 0) && (
            <p className="text-sm text-surface-text/50">Henüz cihaz eklenmedi.</p>
          )}
        </div>
      </main>
    </ThemeProvider>
  );
}
