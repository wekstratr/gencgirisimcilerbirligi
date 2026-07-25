# GBM Platform (Restoranlar + DOPQ)

Genç Girişimciler Birliği çatısı altında çoklu kullanıcılı (multi-tenant) bir
web platformunun başlangıç iskeleti. Bu sürüm, projenin `prompt.txt`,
`table.csv` ve tema örneği dosyalarında tarif edilen mimariyi kod haline
getirir: Next.js (App Router) + Supabase (Postgres/Auth) + Cloudinary +
Vercel, mobile-first, dark/light mode, tenant başına dinamik tema.

## Neler hazır?

- **Next.js App Router iskeleti** — TypeScript + Tailwind, CSS-değişkeni
  tabanlı dinamik tema sistemi (`lib/theme.ts`, `components/ThemeProvider.tsx`).
- **Supabase şeması** (`supabase/schema.sql`) — `tenants`, `app_users`,
  `menu_categories`, `menu_items`, `phones`, `qr_visits`, `earnings` tabloları
  ve **her tabloda tenant_id bazlı RLS politikaları** (CSV önerisine göre).
- **Referans kodu ile kayıt akışı** (`app/(auth)/register`) — kod, kayıttan
  önce doğrulanır; kullanıcı sadece geçerli bir tenant'a bağlanabilir.
- **QR kod + tekil ziyaretçi sayacı** — `lib/utils/visitorTracking.ts`, IP'yi
  hash'leyerek saklar; Postgres'te `(tenant_id, target_type, target_id,
  visitor_ip_hash, visit_day)` unique index'i ile günlük bazda şişmeyi önler.
- **DOPQ telefon karşılaştırma ekranı** (`app/dopq/[tenantSlug]/compare`,
  `components/PhoneCompareCard.tsx`) — mobilde yan yana tablo, her satırda
  kazanan tarafa ok işareti.
- **Admin paneli** (`app/admin`) — referans kodu üretme, tenant + ziyaret
  istatistiklerini listeleme.
- **Restoran / DOPQ panelleri** — menü/cihaz listeleme iskeleti, QR kod
  gösterimi, tema bölümü (dolduruluş formu TODO olarak işaretli).
- **Dark/Light mode** — `next-themes` ile, `ThemeToggle` bileşeni.

## Henüz yapılmayanlar (bilinçli olarak bırakıldı)

Bu bir *başlangıç iskeleti*, bitmiş ürün değil. Kasıtlı olarak eksik
bırakılanlar (her biri kodda `// TODO` ile işaretli):

- Menü/cihaz **ekleme-düzenleme formları** ve Cloudinary görsel yükleme
  entegrasyonu.
- Admin'in kazanç verisi girme ekranı (tablo `earnings` hazır, form yok).
- Şifre sıfırlama sayfası (`/reset-password`) — Supabase Auth'un `resetPasswordForEmail`
  akışı + referans kodu doğrulama adımı eklenmeli.
- Çoklu dil desteği (TR/EN) — şu an sadece Türkçe metinler var; `next-intl`
  gibi bir kütüphane eklenerek genişletilebilir.
- Gerçek tip güvenliği: `lib/types.ts` elle yazıldı; gerçek bir Supabase
  projesine bağlandıktan sonra `supabase gen types typescript` ile
  yeniden üretilmeli.

## Kurulum

```bash
npm install
cp .env.example .env.local   # Supabase + Cloudinary anahtarlarını doldurun
```

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje açın.
2. SQL Editor'de sırasıyla çalıştırın: `supabase/schema.sql`, ardından
   isterseniz `supabase/seed.sql` (örnek veriler için).
3. Proje ayarlarından `NEXT_PUBLIC_SUPABASE_URL` ve
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini `.env.local`'e girin.
   `SUPABASE_SERVICE_ROLE_KEY` sadece sunucu tarafı admin işlemleri için
   gereklidir (asla client'a expose etmeyin).
4. [cloudinary.com](https://cloudinary.com) üzerinde ücretsiz bir hesap açıp
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` ve API anahtarlarını girin.
5. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

6. Vercel'e deploy etmek için repoyu GitHub'a push edip Vercel'de import
   edin; aynı ortam değişkenlerini Vercel proje ayarlarına da ekleyin.

## Klasör yapısı

```
app/
  (auth)/login, register        -> genel kimlik doğrulama sayfaları
  admin/                        -> GBM admin paneli
  restaurant/                   -> restoran vitrini + panel
  dopq/                         -> DOPQ vitrini, cihaz detay, karşılaştırma, panel
components/                     -> ThemeProvider, ThemeToggle, QRCodeDisplay, PhoneCompareCard
lib/
  supabase/                     -> client/server/middleware Supabase yardımcıları
  theme.ts                      -> tenant theme_config -> CSS değişkeni dönüşümü
  types.ts                      -> DB şemasını yansıtan TS tipleri
  utils/                        -> referenceCode, visitorTracking
supabase/
  schema.sql                    -> tüm tablolar + RLS politikaları
  seed.sql                      -> örnek veri (opsiyonel)
```
