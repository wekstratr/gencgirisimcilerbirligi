import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DopqIndexPage() {
  const supabase = createClient();
  const { data: dealers } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("type", "dopq")
    .eq("is_active", true);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-bold">Telefoncular (DOPQ)</h1>
      <div className="flex flex-col gap-3">
        {(dealers ?? []).map((d) => (
          <Link
            key={d.id}
            href={`/dopq/${d.slug}`}
            className="rounded-xl bg-surface-bg px-4 py-3 shadow"
          >
            {d.name}
          </Link>
        ))}
        {(!dealers || dealers.length === 0) && (
          <p className="text-sm text-surface-text/50">Henüz kayıtlı telefoncu yok.</p>
        )}
      </div>
    </main>
  );
}
