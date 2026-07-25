import { createClient } from "@/lib/supabase/server";
import { generateReferenceCode } from "@/lib/utils/referenceCode";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function issueReferenceCode(formData: FormData) {
  "use server";
  await requireAdmin(); // server actions can be called directly, so re-check here too
  const supabase = createClient();

  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "restaurant") as "restaurant" | "dopq";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await supabase.from("tenants").insert({
    name,
    type,
    slug,
    reference_code: generateReferenceCode(),
  });

  revalidatePath("/admin");
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, type, slug, reference_code, is_active")
    .order("created_at", { ascending: false });

  const { data: visitStats } = await supabase
    .from("tenant_visit_stats")
    .select("tenant_id, total_visits, unique_visitors");

  const statsByTenant = new Map(
    (visitStats ?? []).map((s) => [s.tenant_id, s])
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <h1 className="text-xl font-bold">Admin Paneli</h1>

      <section className="rounded-2xl bg-surface-bg p-5 shadow">
        <h2 className="mb-4 font-semibold">Yeni İşletme için Referans Kodu Üret</h2>
        <form action={issueReferenceCode} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            required
            placeholder="İşletme Adı"
            className="flex-1 rounded-lg border border-primary/30 bg-transparent px-4 py-2"
          />
          <select
            name="type"
            className="rounded-lg border border-primary/30 bg-transparent px-4 py-2"
          >
            <option value="restaurant">Restoran</option>
            <option value="dopq">DOPQ (Telefoncu)</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white"
          >
            Kod Üret
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-surface-bg p-5 shadow">
        <h2 className="mb-4 font-semibold">İşletmeler & İstatistikler</h2>
        <div className="flex flex-col divide-y divide-primary/10">
          {(tenants ?? []).map((t) => {
            const stats = statsByTenant.get(t.id);
            return (
              <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-surface-text/50">
                    {t.type === "restaurant" ? "Restoran" : "DOPQ"} · /{t.slug} · Kod: {t.reference_code}
                  </p>
                </div>
                <div className="text-right text-xs text-surface-text/70">
                  <p>{stats?.total_visits ?? 0} ziyaret</p>
                  <p>{stats?.unique_visitors ?? 0} tekil</p>
                </div>
              </div>
            );
          })}
          {(!tenants || tenants.length === 0) && (
            <p className="py-3 text-sm text-surface-text/50">Henüz işletme yok.</p>
          )}
        </div>
      </section>
    </main>
  );
}
