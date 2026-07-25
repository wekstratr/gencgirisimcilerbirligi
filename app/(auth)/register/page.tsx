"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    referenceCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Validate the reference code belongs to an active tenant BEFORE creating
    //    an auth user, so we never end up with an orphaned account.
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, type")
      .eq("reference_code", form.referenceCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (tenantError || !tenant) {
      setError("Referans kodu geçersiz veya işletme bulunamadı.");
      setLoading(false);
      return;
    }

    // 2. Create the auth user.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? "Kayıt sırasında bir hata oluştu.");
      setLoading(false);
      return;
    }

    // 3. Link the new user to the tenant as an "owner".
    const { error: profileError } = await supabase.from("app_users").insert({
      id: signUpData.user.id,
      tenant_id: tenant.id,
      role: "owner",
      email: form.email,
      full_name: form.fullName,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.push(tenant.type === "restaurant" ? "/restaurant" : "/dopq");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-xl font-bold">Referans Kodu ile Kayıt Ol</h1>
      <p className="text-sm text-surface-text/70">
        İşletmenize GBM Admin tarafından verilen referans kodunu girerek kayıt
        işlemini tamamlayabilirsiniz.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Referans Kodu (ör. RST8K2Q1)"
          value={form.referenceCode}
          onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
          className="rounded-lg border border-primary/30 bg-transparent px-4 py-3 uppercase tracking-wider"
        />
        <input
          required
          placeholder="Ad Soyad"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="rounded-lg border border-primary/30 bg-transparent px-4 py-3"
        />
        <input
          type="email"
          required
          placeholder="E-posta"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-primary/30 bg-transparent px-4 py-3"
        />
        <input
          type="password"
          required
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-lg border border-primary/30 bg-transparent px-4 py-3"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-3 font-medium text-white shadow disabled:opacity-60"
        >
          {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="text-xs text-surface-text/50">
        Sorun mu yaşıyorsunuz? Destek için: emailofwekstra@gmail.com veya
        @trwekstratr
      </p>
    </main>
  );
}
