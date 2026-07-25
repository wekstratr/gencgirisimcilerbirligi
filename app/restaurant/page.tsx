import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RestaurantIndexPage() {
  const supabase = createClient();
  const { data: restaurants } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("type", "restaurant")
    .eq("is_active", true);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-bold">Restoranlar</h1>
      <div className="flex flex-col gap-3">
        {(restaurants ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/restaurant/${r.slug}/menu`}
            className="rounded-xl bg-surface-bg px-4 py-3 shadow"
          >
            {r.name}
          </Link>
        ))}
        {(!restaurants || restaurants.length === 0) && (
          <p className="text-sm text-surface-text/50">
            Henüz kayıtlı restoran yok. Bir tenant kaydolduğunda burada listelenecek.
          </p>
        )}
      </div>
    </main>
  );
}
