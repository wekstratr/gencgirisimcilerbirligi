import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">GBM Platform</h1>
        <ThemeToggle />
      </div>

      <p className="text-sm text-surface-text/70">
        Genç Girişimciler Birliği çatısı altında restoranlar ve telefoncular
        (DOPQ) için çoklu kullanıcılı dijital vitrin platformu.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/restaurant"
          className="rounded-xl bg-primary px-4 py-3 text-center font-medium text-white shadow"
        >
          Restoran Paneli
        </Link>
        <Link
          href="/dopq"
          className="rounded-xl bg-secondary px-4 py-3 text-center font-medium text-white shadow"
        >
          DOPQ (Telefoncu) Paneli
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-primary/30 px-4 py-3 text-center font-medium text-primary"
        >
          Admin Girişi
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-2 text-xs text-surface-text/50">
        <Link href="/login" className="underline">Giriş Yap</Link>
        <Link href="/register" className="underline">Referans Kodu ile Kayıt Ol</Link>
      </div>
    </main>
  );
}
