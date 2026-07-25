import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PhoneCompareCard } from "@/components/PhoneCompareCard";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * Renders the DOPQ phone comparison screen described in the spec (section 3.3):
 * visitors land here either by picking a second device from the list, or by
 * scanning that device's own QR code while already viewing the first one
 * (in which case the QR's own link would carry `?right=<id>`).
 */
export default async function ComparePage({
  params,
  searchParams,
}: {
  params: { tenantSlug: string };
  searchParams: { left?: string; right?: string };
}) {
  const supabase = createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, theme_config")
    .eq("slug", params.tenantSlug)
    .eq("type", "dopq")
    .maybeSingle();

  if (!tenant || !searchParams.left) notFound();

  const { data: allPhones } = await supabase
    .from("phones")
    .select("id, brand, model, ram_gb, storage_gb, price, condition")
    .eq("tenant_id", tenant.id);

  const leftPhone = (allPhones ?? []).find((p) => p.id === searchParams.left);
  const rightPhone = searchParams.right
    ? (allPhones ?? []).find((p) => p.id === searchParams.right)
    : undefined;

  if (!leftPhone) notFound();

  return (
    <ThemeProvider tenantTheme={tenant.theme_config}>
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
        <h1 className="text-xl font-bold">Cihaz Karşılaştırma</h1>

        {rightPhone ? (
          <PhoneCompareCard left={leftPhone} right={rightPhone} />
        ) : (
          <>
            <p className="text-sm text-surface-text/70">
              {leftPhone.brand} {leftPhone.model} ile karşılaştırmak için bir cihaz
              seçin, ya da o cihazın QR kodunu okutun.
            </p>
            <div className="flex flex-col gap-2">
              {(allPhones ?? [])
                .filter((p) => p.id !== leftPhone.id)
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/dopq/${params.tenantSlug}/compare?left=${leftPhone.id}&right=${p.id}`}
                    className="rounded-xl bg-surface-bg px-4 py-3 shadow"
                  >
                    {p.brand} {p.model}
                  </Link>
                ))}
            </div>
          </>
        )}
      </main>
    </ThemeProvider>
  );
}
