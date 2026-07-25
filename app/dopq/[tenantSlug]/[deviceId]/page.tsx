import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordQrVisit } from "@/lib/utils/visitorTracking";
import Link from "next/link";

export default async function PhoneDetailPage({
  params,
}: {
  params: { tenantSlug: string; deviceId: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, theme_config")
    .eq("slug", params.tenantSlug)
    .eq("type", "dopq")
    .maybeSingle();

  if (!tenant) notFound();

  const { data: phone } = await supabase
    .from("phones")
    .select("id, brand, model, ram_gb, storage_gb, price, condition, description, image_url")
    .eq("id", params.deviceId)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!phone) notFound();

  const requestIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  await recordQrVisit({ tenantId: tenant.id, targetType: "phone", targetId: phone.id, requestIp });

  const deviceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/dopq/${params.tenantSlug}/${phone.id}`;

  return (
    <ThemeProvider tenantTheme={tenant.theme_config}>
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">{phone.brand} {phone.model}</h1>

        <div className="rounded-2xl bg-surface-bg p-5 shadow">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-surface-text/60">RAM</dt>
            <dd className="text-right">{phone.ram_gb} GB</dd>
            <dt className="text-surface-text/60">Depolama</dt>
            <dd className="text-right">{phone.storage_gb} GB</dd>
            <dt className="text-surface-text/60">Durum</dt>
            <dd className="text-right">{phone.condition === "new" ? "Sıfır" : "İkinci El"}</dd>
            <dt className="text-surface-text/60">Fiyat</dt>
            <dd className="text-right font-semibold text-secondary">
              {phone.price.toLocaleString("tr-TR")} ₺
            </dd>
          </dl>
          {phone.description && (
            <p className="mt-4 text-sm text-surface-text/70">{phone.description}</p>
          )}
        </div>

        <Link
          href={`/dopq/${params.tenantSlug}/compare?left=${phone.id}`}
          className="rounded-xl bg-primary px-4 py-3 text-center font-medium text-white shadow"
        >
          Başka bir cihazla karşılaştır
        </Link>

        <QRCodeDisplay url={deviceUrl} label="Bu cihazın QR kodu" />
      </main>
    </ThemeProvider>
  );
}
