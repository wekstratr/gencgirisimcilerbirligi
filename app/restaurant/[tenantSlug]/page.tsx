import { createClient } from "@/lib/supabase/server";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { requireTenantAccess } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function RestaurantOwnerDashboard({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, theme_config")
    .eq("slug", params.tenantSlug)
    .eq("type", "restaurant")
    .maybeSingle();

  if (!tenant) notFound();

  await requireTenantAccess(tenant.id);

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, name, price, is_available, category_id")
    .eq("tenant_id", tenant.id);

  const menuUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/restaurant/${tenant.slug}/menu`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-6 py-10">
      <h1 className="text-xl font-bold">{tenant.name} - Yönetim Paneli</h1>

      <QRCodeDisplay url={menuUrl} label="Menü QR Kodu" />

      <section className="rounded-2xl bg-surface-bg p-5 shadow">
        <h2 className="mb-3 font-semibold">Menü Ürünleri</h2>
        <div className="flex flex-col divide-y divide-primary/10 text-sm">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <span>{item.name}</span>
              <span className="text-surface-text/60">
                {item.price.toLocaleString("tr-TR")} ₺
              </span>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <p className="py-2 text-surface-text/50">Henüz ürün eklenmedi.</p>
          )}
        </div>
        {/* TODO: add-item form (name, category, price, Cloudinary image upload) */}
      </section>

      <section className="rounded-2xl bg-surface-bg p-5 shadow">
        <h2 className="mb-3 font-semibold">Tema</h2>
        <p className="text-sm text-surface-text/60">
          Renkler, hazır paletler ve logo yükleme burada yönetilecek (lib/theme.ts +
          PRESET_PALETTES kullanılarak).
        </p>
      </section>
    </main>
  );
}
