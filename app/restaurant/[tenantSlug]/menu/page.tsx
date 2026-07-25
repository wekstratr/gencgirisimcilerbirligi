import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordQrVisit } from "@/lib/utils/visitorTracking";

export default async function PublicMenuPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, theme_config")
    .eq("slug", params.tenantSlug)
    .eq("type", "restaurant")
    .eq("is_active", true)
    .maybeSingle();

  if (!tenant) notFound();

  const requestIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  await recordQrVisit({ tenantId: tenant.id, targetType: "menu", targetId: tenant.id, requestIp });

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name, sort_order")
    .eq("tenant_id", tenant.id)
    .order("sort_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, category_id, name, description, price, image_url")
    .eq("tenant_id", tenant.id)
    .eq("is_available", true);

  return (
    <ThemeProvider tenantTheme={tenant.theme_config}>
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>

        {(categories ?? []).map((cat) => (
          <section key={cat.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              {cat.name}
            </h2>
            <div className="flex flex-col gap-3">
              {(items ?? [])
                .filter((i) => i.category_id === cat.id)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-bg p-4 shadow">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-surface-text/60">{item.description}</p>
                      )}
                    </div>
                    <p className="font-semibold text-secondary">
                      {item.price.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </ThemeProvider>
  );
}
