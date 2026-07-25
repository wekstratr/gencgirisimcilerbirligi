import { createClient } from "@/lib/supabase/server";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { requireTenantAccess } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function DopqOwnerDashboard({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", params.tenantSlug)
    .eq("type", "dopq")
    .maybeSingle();

  if (!tenant) notFound();

  await requireTenantAccess(tenant.id);

  const { data: phones } = await supabase
    .from("phones")
    .select("id, brand, model, price")
    .eq("tenant_id", tenant.id);

  const { data: stats } = await supabase
    .from("tenant_visit_stats")
    .select("total_visits, unique_visitors")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const storeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/dopq/${tenant.slug}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-6 py-10">
      <h1 className="text-xl font-bold">{tenant.name} - Yönetim Paneli</h1>

      <section className="rounded-2xl bg-surface-bg p-5 shadow text-sm">
        <p>Toplam ziyaret: <strong>{stats?.total_visits ?? 0}</strong></p>
        <p>Tekil ziyaretçi: <strong>{stats?.unique_visitors ?? 0}</strong></p>
      </section>

      <QRCodeDisplay url={storeUrl} label="Vitrin QR Kodu" />

      <section className="rounded-2xl bg-surface-bg p-5 shadow">
        <h2 className="mb-3 font-semibold">Cihazlar</h2>
        <div className="flex flex-col divide-y divide-primary/10 text-sm">
          {(phones ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <span>{p.brand} {p.model}</span>
              <span className="text-surface-text/60">{p.price.toLocaleString("tr-TR")} ₺</span>
            </div>
          ))}
          {(!phones || phones.length === 0) && (
            <p className="py-2 text-surface-text/50">Henüz cihaz eklenmedi.</p>
          )}
        </div>
        {/* TODO: add-device form (brand, model, RAM, storage, price, condition, Cloudinary image) */}
      </section>
    </main>
  );
}
