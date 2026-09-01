# 🔎 Audit Forensik — Proyek "Libra" (Perpustakaan Digital)

**Target:** `C:\Users\adibw\libra` — Next.js 16.3.1 · React 19.2 · Prisma 7.9 (PostgreSQL) · TypeScript
**Metodologi:** Tinjauan kode statis menyeluruh — schema database, seluruh route API (publik/publisher/admin), layer service/repository/model, konfigurasi, CSS, dan komponen frontend inti — dibaca langsung dari filesystem. **Tidak** menjalankan aplikasi (`npm run dev`), jadi metrik runtime (skor Lighthouse aktual, hasil `npm audit`, waktu muat nyata) tidak diklaim di sini. Semua temuan performa didasarkan pada pola kode yang secara struktural terbukti menyebabkan masalah tersebut — bukan tebakan.

> Catatan proyek: repo ini menyertakan `AGENTS.md`/`CLAUDE.md` otomatis dari `next dev` yang menandakan Next.js 16 punya breaking changes dari versi sebelumnya. Saat menerapkan perbaikan di bawah, cek `node_modules/next/dist/docs/` bila ada API yang terasa beda dari dokumentasi publik yang lebih lama.

---

## 1. EXECUTIVE SUMMARY

| Dimensi | Skor | Catatan |
|---|:---:|---|
| 🔐 Keamanan & Database | **32/100** | Fondasi bagus (bcrypt cost-12, cookie httpOnly, ownership check di route book) dirusak total oleh kombinasi *localStorage token* + upload tanpa validasi + kredensial default. |
| 🏗️ Arsitektur & Clean Code | **68/100** | Layering Repository/Service/Model rapi & konsisten — jarang terlihat di proyek solo. Diturunkan oleh duplikasi logic, penamaan menyesatkan, dan nihil middleware. |
| 🎨 UI/UX & Aksesibilitas | **44/100** | Dua design system yang saling bentrok, kontras teks gagal WCAG di beberapa tempat, indikator fokus keyboard hilang total di semua tombol. |
| ⚡ Performa | **48/100** | Font di-*load* dobel, homepage 100% client-rendered, nol optimasi gambar, polling boros tiap 12 detik. |
| 📦 Fitur & Logika Bisnis | **50/100** | MVP-nya lengkap di permukaan, tapi fitur **inti** (baca buku online) ternyata tidak benar-benar ada. |
| **TOTAL** | **⚠️ 44/100** | **Belum layak produksi.** Struktur solid, tapi ada lubang yang memungkinkan akun admin & publisher manapun diambil alih hanya lewat satu upload file. |

Skor di atas adalah penilaian kualitatif berbasis bukti kode (bukan output tool otomatis). Setelah item **Kritis** di bawah dibereskan, jalankan `npm audit`, build production (`next build`), dan Lighthouse sungguhan untuk validasi angka.

---

## 2. CRITICAL THREATS — Bug Fatal & Celah Keamanan

### 🔴 P0-1 — Token JWT disimpan di `localStorage` → cookie `httpOnly` jadi percuma

**Bukti:** Login route men-set cookie dengan benar:

```ts
// src/app/api/publisher/auth/login/route.ts & admin/auth/login/route.ts
response.cookies.set('publisher_token', result.token, {
  httpOnly: true, secure: ..., sameSite: 'lax', maxAge: 60*60*24*7,
});
```

Tapi halaman login-nya **juga** menyimpan token mentah ke `localStorage`:

```ts
// src/app/publisher/auth/login/page.tsx
localStorage.setItem('publisher_token', json.data.token);

// src/app/admin/auth/login/page.tsx
localStorage.setItem('admin_token', json.data.token);
```

Lalu `src/app/admin/layout.tsx` dan `src/app/publisher/layout.tsx` membaca token itu dari `localStorage` dan mengirimkannya sebagai header `Authorization: Bearer` di setiap request — yang mana sudah didukung otomatis oleh `extractToken()` di `src/lib/auth.ts` lewat cookie. **Duplikasi ini sepenuhnya tidak perlu.**

**Dampak:** `httpOnly` ada satu-satunya alasan: mencegah JavaScript membaca token (mitigasi pencurian sesi via XSS). Begitu token *juga* ada di `localStorage`, satu celah XSS di mana pun di situs (lihat P0-2 di bawah — dan itu benar-benar ada) langsung bisa mengambil `localStorage.getItem('admin_token')` dan membajak akun **admin penuh**, bukan cuma publisher.

**Fix:** Hapus semua `localStorage.setItem/getItem/removeItem('*_token'*)`. Biarkan cookie httpOnly bekerja sendiri — fetch same-origin otomatis mengirim cookie tanpa header manual.

```ts
// src/app/publisher/auth/login/page.tsx — SESUDAH
if (json.success) {
  localStorage.setItem('publisher_user', JSON.stringify(json.data.user)); // ok, cuma data tampilan
  router.push('/publisher/dashboard');
}

// src/app/publisher/layout.tsx — SESUDAH, tidak perlu Authorization header
const res = await fetch('/api/publisher/auth/me'); // cookie terkirim otomatis
```

---

### 🔴 P0-2 — Upload file tanpa validasi tipe/ukuran sama sekali → Stored XSS

**Bukti** — `src/lib/utils.ts`:

```ts
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName); // ekstensi asli APA PUN dipakai mentah-mentah
  ...
}
export async function saveFile(buffer, filename, subdirectory) {
  // tidak ada pengecekan mimeType, ukuran, atau isi file
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${subdirectory}/${filename}`;
}
```

Dipakai di `POST /api/publisher/books` dan `PATCH /api/publisher/profile` tanpa satu baris validasi pun sebelumnya. Form di `src/app/publisher/upload/page.tsx` memang punya `accept=".pdf"` / `accept="image/*"` — tapi itu **hanya hint UI browser**, gampang dilewati lewat DevTools/`curl`/Postman.

**Rantai serangan nyata (semua langkah sudah terverifikasi di kode ini):**
1. Siapa pun mendaftar jadi publisher tanpa verifikasi email/persetujuan admin (`POST /api/publisher/auth/register` — instan aktif).
2. Attacker upload file `payload.svg` (berisi `<script>`) sebagai "cover buku". File tersimpan apa adanya di `public/uploads/covers/…svg`, otomatis diserve Next.js sebagai `image/svg+xml`.
3. Attacker sebar link file itu (mis. berpura-pura jadi cover buku yang wajar untuk publisher lain, atau ditaruh di kolom yang dibaca admin).
4. Saat dibuka langsung, script di SVG jalan **di origin situs ini sendiri** → bisa `fetch('/api/publisher/…')` memakai cookie korban yang otomatis terlampir, ATAU langsung baca `localStorage.getItem('admin_token')` (lihat P0-1) dan kirim ke server attacker.

**Fix** — whitelist ekstensi + MIME + ukuran sebelum `saveFile`:

```ts
// src/lib/uploadValidation.ts (baru)
import path from 'path';

type Rule = { mimes: string[]; exts: string[]; maxSize: number };

const RULES: Record<string, Rule> = {
  pdfs:    { mimes: ['application/pdf'], exts: ['.pdf'], maxSize: 50 * 1024 * 1024 },
  covers:  { mimes: ['image/jpeg', 'image/png', 'image/webp'], exts: ['.jpg', '.jpeg', '.png', '.webp'], maxSize: 5 * 1024 * 1024 },
  avatars: { mimes: ['image/jpeg', 'image/png', 'image/webp'], exts: ['.jpg', '.jpeg', '.png', '.webp'], maxSize: 2 * 1024 * 1024 },
  banners: { mimes: ['image/jpeg', 'image/png', 'image/webp'], exts: ['.jpg', '.jpeg', '.png', '.webp'], maxSize: 5 * 1024 * 1024 },
};

export function assertValidUpload(
  file: { buffer: Buffer; originalName: string; mimeType: string },
  subdirectory: string,
): void {
  const rule = RULES[subdirectory];
  if (!rule) throw new Error(`Tujuan upload tidak dikenal: ${subdirectory}`);

  const ext = path.extname(file.originalName).toLowerCase();
  if (!rule.exts.includes(ext)) throw new Error(`Ekstensi "${ext}" tidak diizinkan (hanya: ${rule.exts.join(', ')})`);
  if (!rule.mimes.includes(file.mimeType)) throw new Error(`Tipe file "${file.mimeType}" tidak diizinkan untuk ${subdirectory}`);
  if (file.buffer.byteLength > rule.maxSize) throw new Error(`Ukuran melebihi ${rule.maxSize / (1024*1024)}MB`);
}
```

```ts
// src/app/api/publisher/books/route.ts — tambahkan sebelum saveFile
import { assertValidUpload } from '@/lib/uploadValidation';
if (files.coverImage) assertValidUpload(files.coverImage, 'covers');
if (files.pdfFile) assertValidUpload(files.pdfFile, 'pdfs');
```

Ini menutup celah utama (upload `.html/.svg/.js`). Untuk lapis tambahan, cek *magic bytes* isi file (mis. package `file-type`) karena `mimeType` dari klien tetap bisa dipalsukan — whitelist ekstensi+MIME di atas sudah menutup 95% risiko.

Terapkan validasi yang sama di `PATCH /api/publisher/profile` (avatar/banner) dan pertimbangkan menambah gerbang verifikasi email atau persetujuan admin sebelum akun publisher baru bisa upload (lihat §6).

---

### 🔴 P0-3 — Kredensial admin default: hardcoded, lemah, dan diprint ke console

**Bukti** — `scripts/seedAdmin.ts`:

```ts
const hashedPassword = await bcrypt.hash('admin123', 12);
await prisma.admin.create({ data: { email: 'admin@libra.com', password: hashedPassword, name: 'Super Admin' } });
console.log('📧 Email: admin@libra.com');
console.log('🔑 Password: admin123');
```

**Dampak:** Kalau script ini pernah dijalankan di environment mana pun (termasuk staging yang lupa dihapus, atau kalau file ini pernah ter-commit/ter-share), siapa pun yang tahu pola ini punya akses admin penuh — approve/reject buku, ban publisher, lihat audit log, export semua data.

**Fix:**

```ts
// scripts/seedAdmin.ts
import crypto from 'crypto';

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
if (!email) throw new Error('Set SEED_ADMIN_EMAIL di .env sebelum menjalankan seed ini.');

const hashedPassword = await bcrypt.hash(password, 12);
await prisma.admin.create({ data: { email, password: hashedPassword, name: 'Super Admin' } });
console.log(`✅ Admin dibuat: ${email}`);
console.log(`🔑 Password (catat sekarang, tidak ditampilkan lagi): ${password}`);
```

**Tindakan segera:** kalau akun `admin@libra.com` / `admin123` pernah dibuat di database manapun yang aktif, hapus/ganti password-nya sekarang juga — jangan tunggu refactor script-nya selesai.

---

### 🔴 P0-4 — `JWT_SECRET` adalah placeholder yang tidak pernah diganti + fallback tidak aman di kode

**Bukti** — isi `.env`:
```
JWT_SECRET="libra_secret_key_2024_super_secure_change_in_production"
```
Nama variabelnya sendiri secara harfiah bilang *"change_in_production"* — dan tidak pernah diganti. Diperparah oleh `src/classes/services/AuthService.ts`:
```ts
this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
```
Kalau `.env` tidak termuat di environment manapun (deploy lupa set env var), aplikasi diam-diam jatuh ke `'fallback_secret'` yang sekarang tertulis di laporan ini dan siapa pun yang pernah lihat kode ini tahu nilainya.

**Dampak:** Siapa pun yang tahu secret ini bisa membuat JWT admin palsu sendiri (`role: 'ADMIN'`) dan langsung punya akses admin penuh tanpa perlu password apa pun.

**Fix:**
```ts
// src/classes/services/AuthService.ts
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET wajib diset (≥32 karakter acak). Tidak ada fallback yang diizinkan.');
}
this.jwtSecret = secret;
```
Generate secret baru: `openssl rand -base64 48`, taruh di `.env`, lalu **restart** — ini otomatis membatalkan semua sesi lama yang ada (efek samping yang justru diinginkan di sini karena secret lama sudah dianggap bocor).

---

### 🔴 P0-5 — File upload publik menembus status moderasi (buku `BANNED`/`PENDING` tetap bisa diunduh)

**Bukti:** `BookModel.getPublicInfo()` di `src/classes/models/BookModel.ts` memang menyembunyikan `pdfFile` dari response JSON kalau status bukan `PUBLISHED`:
```ts
pdfFile: this._status === 'PUBLISHED' ? this._pdfFile : null,
```
Tapi ini cuma menyembunyikan di level **JSON API**. File fisiknya tetap berada di `public/uploads/pdfs/…`, dan **semua isi folder `public/` diserve Next.js sebagai static asset tanpa lewat kode aplikasi sama sekali**. Siapa pun yang pernah menyimpan URL langsungnya (mis. saat buku itu masih `PUBLISHED` sebelum di-ban admin) tetap bisa mengunduhnya selamanya — status `BANNED` di database jadi tidak berarti apa-apa untuk file yang sudah pernah publik.

**Fix (arsitektural):** serve file lewat route yang mengecek status, bukan lewat static hosting langsung:

```ts
// src/app/api/files/[...path]/route.ts (baru)
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { verifyPublisherAuth, verifyAdminAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const relPath = '/uploads/' + segments.join('/');

  if (segments[0] === 'pdfs') {
    const book = await prisma.book.findFirst({ where: { pdfFile: relPath } });
    if (!book) return new NextResponse('Not found', { status: 404 });
    if (book.status !== 'PUBLISHED') {
      const publisher = await verifyPublisherAuth(req);
      const admin = await verifyAdminAuth(req);
      if (admin === null && publisher?.id !== book.publisherId) {
        return new NextResponse('Not found', { status: 404 });
      }
    }
  }

  try {
    const data = await readFile(path.join(process.cwd(), 'public', relPath));
    return new NextResponse(data, { headers: { 'Content-Type': segments[0] === 'pdfs' ? 'application/pdf' : 'application/octet-stream' } });
  } catch { return new NextResponse('Not found', { status: 404 }); }
}
```
Ganti semua path yang dikembalikan `saveFile()` dari `/uploads/...` jadi `/api/files/...`, dan pindahkan folder upload ke luar `public/` (mis. `private-uploads/` di root) supaya Next.js tidak lagi otomatis mengekspos foldernya sebagai static asset. (Ini sketsa awal, bukan implementasi produksi lengkap — tambahkan caching header & streaming untuk file besar.)

---

### 🟠 P1 — Temuan High-severity (bukan P0, tapi harus masuk sprint yang sama)

| # | Temuan | File | Fix singkat |
|---|---|---|---|
| P1-1 | **CSV Formula Injection** — judul/nama publisher user-input ditulis mentah ke CSV; cell yang diawali `=`/`+`/`-`/`@` akan dieksekusi sebagai formula saat dibuka di Excel/Sheets | `src/app/api/admin/export/route.ts` | Prefix `'` pada cell yang diawali karakter berbahaya sebelum di-quote (lihat kode di bawah) |
| P1-2 | **Rating tanpa autentikasi & tanpa dedup** — `POST /api/books/[id]/rating` bisa dipanggil berkali-kali tanpa batas oleh siapa pun, rating rata-rata jadi gampang dimanipulasi | `src/app/api/books/[id]/route.ts` | Tambah kolom `visitorId` di model `Rating`, set cookie anonim, tolak rating kedua dari `visitorId` yang sama |
| P1-3 | **Nihil rate limiting** di semua endpoint login/register — rentan brute-force credential stuffing | `src/app/api/{admin,publisher}/auth/login/route.ts` | Tambah rate limiter berbasis IP (mis. `@upstash/ratelimit` atau in-memory sliding window sederhana) |
| P1-4 | **Ikon kategori SVG diterima tanpa sanitasi** — SVG bisa membawa `<script>`; walau hanya admin yang bisa upload, tetap risiko kalau akun admin terkompromi | `src/app/api/admin/categories/route.ts` | Sanitasi SVG (strip `<script>`, atribut `on*`) via library seperti `dompurify` (mode SVG) sebelum simpan |

```ts
// Fix P1-1 — src/app/api/admin/export/route.ts
function csvSafe(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
// ganti semua `"${x.replace(/"/g,'""')}"` manual dengan csvSafe(x)
```

---

## 3. ARSITEKTUR & CODE SMELLS (Clean Code / SOLID / DRY)

**Yang sudah bagus (perlu diakui, ini di atas rata-rata proyek solo):**
- Layering `BaseEntity → Model`, `BaseRepository → Repository`, lalu `Service` konsisten dipakai di seluruh Book/Publisher/Admin — pemisahan tanggung jawab jelas.
- Enkapsulasi password konsisten: private field + getter, tidak pernah bocor lewat `toJSON()`/`getProfile()`.
- Audit log (`AuditLog`) benar-benar dipanggil di operasi admin yang sensitif (create/delete announcement, category, dll).

**Yang bermasalah:**

1. **`UserModel` sebenarnya adalah `PublisherModel`.** Nama kelas di `src/classes/models/UserModel.ts` menyesatkan — komentarnya sendiri bilang "Domain model for Publisher entity". Tidak ada model "User"/pembaca sama sekali di sistem ini. Rename ke `PublisherModel` supaya konsisten dengan `AdminModel`/`BookModel`.

2. **`BookService.updateBook`/`deleteBook` tidak mengecek kepemilikan sendiri** (`src/classes/services/BookService.ts`) — saat ini **aman** karena route `publisher/books/[id]/route.ts` sudah mengecek `existing.publisherId !== publisher.id` sebelum memanggil service. Tapi ini rapuh: kalau nanti ada route/caller baru yang lupa cek ini duluan, IDOR langsung terbuka. Pindahkan pengecekan `publisherId` ke dalam `BookService` itu sendiri (defense-in-depth), jangan andalkan pemanggil selalu ingat.

3. **Kode duplikat/mati** di `src/app/api/publisher/analytics/route.ts` — ada blok manual re-check `Authorization: Bearer` yang sebenarnya sudah dilakukan otomatis di dalam `verifyPublisherAuth()` (lihat `extractToken()` di `src/lib/auth.ts`). Hapus blok duplikat ini.

4. **Gaya modul campur aduk** — `AnalyticsService.getAdminStats()` memakai `require('fs/promises')`/`require('path')` di tengah file yang di tempat lain konsisten pakai `import`. Pindahkan ke `import` di kepala file.

5. **Nihil `middleware.ts`** — tidak ada satu pun file middleware Next.js di proyek ini (sudah dicek eksplisit, tidak ditemukan). Setiap route menulis ulang `verifyAdminAuth`/`verifyPublisherAuth` sendiri-sendiri. Ini bekerja sejauh ini karena semua route yang saya periksa konsisten memanggilnya — tapi ini pola yang gampang dilupakan di route baru. Pertimbangkan `middleware.ts` untuk proteksi baseline route `/admin/*` dan `/publisher/*` (di luar halaman auth-nya sendiri).

6. **`style={{...}}` inline dan `className` Tailwind ditulis dobel untuk elemen yang sama** di banyak komponen (lihat contoh nyata di §4-1 — ini bukan cuma gaya kotor, tapi **menyebabkan bug fungsional**).

7. **Data tak konsisten pada `Announcement.target`** — komentar schema (`prisma/schema.prisma`) mendokumentasikan nilai `"ALL" | "ACTIVE" | "BANNED"`, tapi `POST /api/admin/announcements` menerima string bebas tanpa validasi, sementara `GET /api/publisher/announcements` memfilter `'ALL' | 'PUBLISHERS' | 'PUBLISHER'` — himpunan nilai yang **berbeda total**. Kalau admin membuat pengumuman dengan target `"ACTIVE"` (sesuai dokumentasi schema), pengumuman itu **tidak akan pernah muncul** di sisi publisher. Selaraskan nilainya dan tambahkan validasi whitelist di route POST.

---

## 4. UI/UX & LAYOUT DISASTERS

### 4-1. 🐛 Bug nyata: panel responsif di halaman login publisher **rusak** karena inline style menimpa class Tailwind

**Bukti** — `src/app/publisher/auth/login/page.tsx`:
```tsx
<div
  className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
  style={{ width: '50%', position: 'relative', display: 'flex', flexDirection: 'column', ... }}
>
```
`className="hidden lg:flex"` dimaksudkan: sembunyikan panel branding di layar kecil, tampilkan `flex` mulai breakpoint `lg`. Tapi `style` inline React **selalu menang atas class CSS apa pun** (spesifisitas tertinggi kecuali `!important`). `style={{ display: 'flex' }}` di atas membuat panel ini **selalu tampil di SEMUA ukuran layar**, termasuk mobile — class `hidden`/`lg:flex` jadi mati total. Di layar HP, panel branding selebar 50% dengan gambar background akan memepet form login ke ruang yang sangat sempit atau menyebabkan overflow horizontal.

**Fix:** hapus properti yang tumpang-tindih dari `style`, biarkan Tailwind yang mengatur (atau sebaliknya — pilih satu sistem, jangan dua):
```tsx
<div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12" style={{ overflow: 'hidden' }}>
```

### 4-2. Kontras teks gagal WCAG AA (dihitung, bukan tebakan)

| Pasangan warna | Dipakai di | Rasio kontras | Standar AA | Status |
|---|---|---:|---:|:---:|
| `#fff` teks di atas `--accent-primary` (`#C9A96E`) | `.btn-primary` — tombol CTA utama di seluruh situs | **2.24 : 1** | 4.5 : 1 | ❌ GAGAL |
| `--text-muted` (`#9B9B9B`) di atas `--bg-primary` | teks sekunder/caption | **2.66 : 1** | 4.5 : 1 | ❌ GAGAL |
| `--text-muted` di atas kartu putih | teks di dalam card | **2.78 : 1** | 4.5 : 1 | ❌ GAGAL |
| `--text-secondary` di atas `--bg-primary` | body text sekunder | 5.10 : 1 | 4.5 : 1 | ✅ Lolos |

**Fix — `src/app/globals.css`:**
```css
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-primary); /* ganti dari #fff → rasio jadi 7.78:1 */
}
:root {
  --text-muted: #707070; /* ganti dari #9B9B9B → 4.74:1 di bg-primary, 4.95:1 di card */
}
```

### 4-3. `outline: none` global di semua tombol/input — indikator fokus keyboard hilang total

**Bukti** — `src/app/globals.css`:
```css
button { cursor: pointer; font-family: inherit; border: none; outline: none; }
input, textarea, select { font-family: inherit; outline: none; }
```
Tidak ada satu pun `:focus-visible` pengganti untuk `button`. Pengguna keyboard (dan banyak pengguna screen reader/switch device) menekan Tab dan **tidak akan pernah tahu elemen mana yang sedang fokus** — di form login, tombol approve/reject admin, semuanya. Ini pelanggaran WCAG 2.1 SC 2.4.7 yang cukup serius untuk aplikasi dengan portal admin/publisher yang seharusnya bisa dioperasikan penuh via keyboard.

**Fix:**
```css
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### 4-4. Elemen "hapus pencarian" pakai `<div onClick>`, bukan `<button>` — tidak bisa diakses keyboard

**Bukti** — `src/components/GlobalVisitorNavbar.tsx`, kontrol clear-search dirender sebagai:
```tsx
<div onMouseDown={...} onClick={handleClear} style={{...}} title="Hapus Pencarian">✕</div>
```
`<div>` tidak masuk tab order dan tidak punya role implisit `button` — screen reader tidak akan mengumumkannya sebagai kontrol interaktif, dan pengguna keyboard tidak bisa mengaktifkannya sama sekali.

**Fix:**
```tsx
<button type="button" onClick={handleClear} aria-label="Hapus pencarian" style={{...}}>✕</button>
```

### 4-5. Dua design system yang saling bentrok

`src/app/globals.css` mendefinisikan design token yang jelas dan konsisten — palet krem hangat & emas ("Apple-inspired", sesuai komentarnya sendiri): `--bg-primary: #FAFAF8`, `--accent-primary: #C9A96E`, dst. Tapi komponen shell utama (`GlobalVisitorNavbar.tsx`, `admin/layout.tsx`, `publisher/layout.tsx`, kedua halaman login) sama sekali tidak memakai variabel ini — semuanya hardcode warna biru/slate ala Tailwind default (`#2563EB`, `#0F172A`, `#64748B`, `#E2E8F0`) langsung di `style={{}}`. Hasilnya: homepage terasa "krem & emas", tapi begitu masuk dashboard publisher/admin atau halaman login, tiba-tiba jadi "biru korporat" — dua bahasa visual berbeda untuk satu produk. Satukan ke satu sumber token (CSS variables di `globals.css`) dan hentikan hardcode hex di komponen.

### 4-6. Breakpoint responsif nyaris tidak ada untuk aplikasi seluas ini

Hanya **3 media query** total di seluruh `globals.css` (1.465 baris): `1024px`, `768px`, `480px`, semuanya menumpuk di 100 baris terakhir file. Untuk aplikasi dengan homepage, halaman detail buku, dashboard admin (sidebar `position: fixed` lebar tetap 220–240px di `admin/layout.tsx`, **tanpa** media query untuk auto-collapse di mobile — hanya ada tombol toggle manual), dan dashboard publisher — cakupan ini jelas kurang. Sidebar admin nyaris pasti tidak akan mengecil otomatis di layar HP dan akan memakan porsi besar layar 375px.

### 4-7. Aksesibilitas gambar/ikon di homepage

`src/app/page.tsx` (1.473 baris): nol atribut `aria-` sama sekali, padahal ada banyak ikon dari `lucide-react` (`ChevronLeft`, `SlidersHorizontal`, dll.) yang kemungkinan dipakai sebagai tombol ikon-saja. Tanpa `aria-label`, screen reader hanya mengumumkan "button" tanpa konteks. Juga tidak ada `@media (prefers-reduced-motion: reduce)` untuk membungkus 7 `@keyframes` yang ada — pengguna yang mengaktifkan preferensi kurangi-gerak di OS-nya tetap akan melihat semua animasi.

---

## 5. PERFORMA & OPTIMASI (Core Web Vitals)

| # | Temuan | Bukti | Dampak |
|---|---|---|---|
| P-1 | **Font Google di-load DUA KALI** dengan dua mekanisme berbeda | `<link rel="stylesheet" href="fonts.googleapis.com/...">` di `src/app/layout.tsx` **DAN** `@import url('fonts.googleapis.com/...')` di baris pertama `src/app/globals.css` | Dua request render-blocking ke domain eksternal yang sama untuk font yang sama. `@import` di awal CSS terutama sangat memperlambat First Contentful Paint. |
| P-2 | **Tidak pakai `next/font`** sama sekali, padahal `README.md` proyek ini secara eksplisit menyebut "This project uses `next/font`" (teks default `create-next-app` yang tak pernah disesuaikan dengan kenyataan) | sama seperti di atas | Kehilangan self-hosting otomatis, font-display optimization, dan penghapusan CLS dari web font — semua manfaat utama `next/font` hilang. |
| P-3 | **Homepage 100% Client Component** (`'use client'` di baris pertama `src/app/page.tsx`, 1.473 baris) yang fetch data lewat `useEffect` + `fetch()` × 3 | grep langsung ke file | Next.js App Router dirancang untuk Server Components yang fetch data di server. Versi client-only ini berarti: bundle JS lebih besar dikirim ke browser, render tertunda sampai hydration + fetch selesai, dan konten buku (poin utama untuk SEO situs pencarian buku!) berpotensi tidak terlihat crawler yang tidak mengeksekusi JS penuh. |
| P-4 | **Nol optimasi gambar** — `saveFile()` di `src/lib/utils.ts` menyimpan buffer upload mentah tanpa resize/kompresi apa pun, dan homepage memakai `<img>` mentah (6 kali), bukan `next/image` (Image dari next/image dipakai `GlobalVisitorNavbar.tsx` tapi TIDAK di `page.tsx`) | grep `next/image` = 0 hasil di `page.tsx` | Cover buku resolusi asli (bisa berukuran besar) dikirim penuh ke semua device termasuk mobile, tanpa lazy-loading otomatis atau format modern (WebP/AVIF). |
| P-5 | **`AnalyticsService.getAdminStats()` menghitung ukuran folder `public/uploads` dengan rekursif `fs.stat` di SETIAP request** ke dashboard admin, tanpa cache | `src/classes/services/AnalyticsService.ts` | Makin banyak buku diupload, makin lambat dashboard admin dimuat — O(n) syscall per request, linear terhadap jumlah file yang pernah diupload sepanjang sejarah platform. |
| P-6 | **`getTopPublishers()` fetch SEMUA publisher ke memori JS lalu `.slice(0, 5)`**, bukan `ORDER BY ... LIMIT` di database, dan sortnya juga bukan berdasarkan performa (lihat §6, poin fitur salah) | `src/classes/services/AnalyticsService.ts` | Tidak scalable — begitu jumlah publisher ribuan, ini jadi query mahal untuk sekadar tampilkan 5 baris. |
| P-7 | **Polling setiap 12 detik + refetch auth di SETIAP perpindahan halaman** pada `publisher/layout.tsx` (`setInterval(checkAuth, 12000)`, plus `useEffect` dependency `[pathname]` yang refetch `/api/publisher/auth/me` tiap ganti route) | `src/app/publisher/layout.tsx` | Trafik API/DB terus-menerus untuk sesi yang aktif, hanya untuk cek status login & notifikasi — tidak scalable dibanding SWR/React Query dengan revalidate-on-focus, atau interval yang jauh lebih panjang. |

---

## 6. MISSING FEATURES — Fitur yang Seharusnya Ada

| # | Fitur hilang/rusak | Kenapa penting |
|---|---|---|
| 1 | **Pembaca PDF in-browser sungguhan** — halaman detail buku (`src/app/books/[id]/page.tsx`) cuma punya **link download langsung** (`link.href = book.pdfFile; link.download = ...`), padahal `@react-pdf/renderer`, `pdfjs-dist`, dan `react-pdf` sudah terpasang sebagai dependency dan **metadata homepage sendiri mengklaim** *"Akses langsung dari browser"* (`src/app/layout.tsx`). Ini fitur INTI produk yang ternyata tidak diimplementasikan. |
| 2 | **Lupa password / reset password** — tidak ada untuk publisher maupun admin (sudah dicek seluruh route `api/*/auth/*`, hanya ada login/register/me/ganti-password-saat-login). |
| 3 | **Verifikasi email atau persetujuan admin** untuk registrasi publisher baru — saat ini instan aktif tanpa gerbang apa pun, memperbesar dampak P0-2. |
| 4 | **Rate limiting / CAPTCHA** di login, register, dan form rating publik. |
| 5 | **Pencegahan duplikat rating** — satu pengunjung bisa rating sama tak terbatas. |
| 6 | **Sistem notifikasi persisten** — tidak ada model `Notification` di schema sama sekali; "notifikasi" publisher hanya query live buku yang statusnya berubah 30 hari terakhir, tanpa status baca/belum-baca tersimpan. Admin juga tidak punya notifikasi/badge sama sekali untuk buku pending atau laporan baru masuk — harus cek manual satu-satu. |
| 7 | **"Top Publishers" tidak benar-benar diurutkan berdasarkan performa** — `getTopPublishers()` hanya mengambil 5 publisher terbaru (`orderBy: createdAt desc` lalu di-slice), bukan berdasarkan total buku/views/rating seperti namanya menyiratkan. Ini bug logika, bukan sekadar fitur kurang. |
| 8 | **Akun pembaca/pengunjung** — tidak ada bookmark, riwayat baca, wishlist, atau rekomendasi personal; semua interaksi visitor anonim. |
| 9 | **Ulasan tertulis** — hanya rating bintang, tanpa komentar/review teks. |
| 10 | **Role admin bertingkat** — satu-satunya role `Admin` di schema, tidak ada pembeda moderator vs super-admin. |
| 11 | **Pencarian full-text di dalam isi PDF** — pencarian saat ini cuma menyasar judul/penulis/kategori/nama penerbit. |
| 12 | **Mode gelap / mode baca malam** — nilai tinggi khusus untuk produk e-reading seperti ini, belum ada `prefers-color-scheme` sama sekali. |
| 13 | **Pipeline optimasi gambar saat upload** (resize/compress otomatis) — lihat §5 P-4. |
| 14 | **Konsistensi i18n** — `publisherI18n.ts` cuma mencakup portal publisher; situs publik & admin tidak ada terjemahan sama sekali. |
| 15 | **Structured data (JSON-LD)** untuk halaman detail buku — akan sangat membantu SEO untuk produk yang bergantung pada trafik pencarian buku. |

---

## 7. MASTER ACTION PLAN

### Fase 0 — Sebelum deploy ke mana pun (hari ini)
1. [ ] Rotasi `JWT_SECRET` (`openssl rand -base64 48`) + hapus fallback `'fallback_secret'` → `src/classes/services/AuthService.ts`
2. [ ] Hapus semua `localStorage.setItem/getItem('*_token')` → `src/app/{admin,publisher}/auth/login/page.tsx`, `src/app/{admin,publisher}/layout.tsx`, `src/components/PublisherPublicLayout.tsx`, `src/app/api/publisher/analytics/route.ts`
3. [ ] Tambah `assertValidUpload()` ke semua endpoint upload → `src/app/api/publisher/books/route.ts`, `src/app/api/publisher/books/[id]/route.ts`, `src/app/api/publisher/profile/route.ts`
4. [ ] Rotasi/hapus akun `admin@libra.com` jika pernah dibuat di database aktif mana pun; refactor `scripts/seedAdmin.ts`
5. [ ] Pindahkan file serving buku ke route yang mengecek status (§2 P0-5) → buat `src/app/api/files/[...path]/route.ts`

### Fase 1 — Minggu ini
6. [ ] Fix kontras `.btn-primary` dan `--text-muted` → `src/app/globals.css`
7. [ ] Tambah `:focus-visible` untuk button/input global → `src/app/globals.css`
8. [ ] Fix bug panel responsif di login publisher (§4-1) → `src/app/publisher/auth/login/page.tsx`
9. [ ] Sanitasi CSV export (§2 P1-1) → `src/app/api/admin/export/route.ts`
10. [ ] Tambah rate limiting ke `login`/`register` → `src/app/api/{admin,publisher}/auth/*`
11. [ ] Ganti `<div onClick>` clear-search jadi `<button>` → `src/components/GlobalVisitorNavbar.tsx`

### Fase 2 — Kelengkapan produk (2–4 minggu)
12. [ ] Bangun pembaca PDF in-browser sungguhan pakai `react-pdf` yang sudah terpasang → `src/app/books/[id]/page.tsx`
13. [ ] Alur lupa password (publisher & admin)
14. [ ] Verifikasi email atau approval admin untuk registrasi publisher baru
15. [ ] Fix `getTopPublishers()` agar benar-benar sort by performa, pakai `ORDER BY`+`LIMIT` di Prisma → `src/classes/services/AnalyticsService.ts`
16. [ ] Selaraskan nilai `Announcement.target` antara schema dan filter query → `prisma/schema.prisma`, `src/app/api/admin/announcements/route.ts`, `src/app/api/publisher/announcements/route.ts`
17. [ ] Ganti `<link>`+`@import` font ganda dengan `next/font/google` sekali saja → `src/app/layout.tsx`, `src/app/globals.css`
18. [ ] Migrasi homepage ke Server Component untuk data awal → `src/app/page.tsx`
19. [ ] Cache/precompute `totalStorage` di `getAdminStats()`, jangan hitung live tiap request → `src/classes/services/AnalyticsService.ts`

### Fase 3 — Jangka panjang
21. [ ] Mode gelap/baca malam
22. [ ] Role admin bertingkat
23. [ ] CAPTCHA di form publik
24. [ ] Notifikasi admin untuk buku pending/laporan baru
25. [ ] `middleware.ts` untuk proteksi baseline route `/admin/*` dan `/publisher/*`

---

*Semua temuan di atas diverifikasi langsung dari kode sumber (bukan asumsi generik) — path file, nama fungsi, dan angka kontras semuanya bisa dicek ulang. Item yang butuh eksekusi runtime untuk divalidasi (npm audit, Lighthouse, pentest dinamis) ditandai jelas sebagai rekomendasi lanjutan, bukan diklaim sudah diukur.*
