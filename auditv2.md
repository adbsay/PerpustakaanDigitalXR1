🔎 Audit Lanjutan #2 — Verifikasi Perbaikan "Libra"

Saya baca ulang setiap file yang relevan dari laporan pertama, satu-satu, bandingkan versi lama vs baru. Kesimpulan singkat: sebagian besar perbaikan beneran solid, tapi ada satu item P0 yang secara visual terlihat "sudah diperbaiki" tapi celahnya masih terbuka lebar, plus satu bug keamanan baru muncul dari kode perbaikannya sendiri. Ini yang paling penting untuk dibaca duluan.

🔴 TEMUAN PALING KRITIS — "Perbaikan" P0-5 tidak benar-benar menutup celahnya

Kamu menambahkan src/app/api/files/[...path]/route.ts yang mengecek status buku sebelum serve PDF — bagus, secara desain itu benar. Tapi cek src/lib/utils.ts:

ts
export async function saveFile(buffer, filename, subdirectory) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory); // ← MASIH public/uploads
  ...
  return `/api/files/${subdirectory}/${filename}`; // path yang DIKEMBALIKAN sudah baru...
}

File-nya masih ditulis secara fisik ke public/uploads/.... Cuma path yang dikembalikan ke database yang diganti jadi /api/files/... — tapi Next.js otomatis men-serve apa pun yang ada di folder public/ sebagai static asset, di URL yang sesuai lokasi filenya. Artinya:

URL baru yang aman: /api/files/pdfs/1735-xyz.pdf ✅ (dicek status buku)
URL lama yang masih hidup berdampingan, tidak pernah diblokir: /uploads/pdfs/1735-xyz.pdf ❌ (nol pengecekan, langsung diserve Next.js)

Siapa pun yang tahu pola nama file (dan sekarang jadi lebih mudah ditebak karena /api/files/pdfs/{filename} yang terlihat di seluruh app secara implisit membocorkan struktur folder aslinya) tinggal ganti /api/files/ jadi /uploads/ di URL manapun dan langsung dapat akses tanpa cek status sama sekali — persis kerentanan awal, cuma sekarang lebih tersembunyi karena kelihatannya sudah "dibenerin".

Fix yang benar — pindahkan folder upload keluar dari public/ sepenuhnya:

ts
// src/lib/utils.ts
export async function saveFile(buffer: Buffer, filename: string, subdirectory: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'private-uploads', subdirectory); // BUKAN public/uploads
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/api/files/${subdirectory}/${filename}`;
}

Lalu di src/app/api/files/[...path]/route.ts, resolve dari private-uploads/ (bukan fallback ke public/uploads/ dulu seperti sekarang):

ts
const filePath = path.join(process.cwd(), 'private-uploads', relUploadPath);

Dan migrasikan file lama: pindahkan isi public/uploads/* ke private-uploads/* (data buku yang sudah terupload lewat form lama masih ada di lokasi lama). Tambahkan /private-uploads/ ke .gitignore juga.

🔴 Bug baru: potensi Path Traversal di route file-serving yang baru dibuat

Di file yang sama (src/app/api/files/[...path]/route.ts), segmen URL langsung digabung jadi path filesystem tanpa normalisasi:

ts
const relUploadPath = segments.join('/');
let filePath = path.join(process.cwd(), 'public', 'uploads', relUploadPath);

path.join tidak mencegah .. keluar dari direktori dasarnya. Route catch-all [...path] di Next.js akan meneruskan segmen apa adanya — kalau ada cara membuat browser/klien mengirim segmen berisi .. (langsung atau ter-encode), request bisa membaca file di luar folder uploads, berpotensi sampai ke .env atau source code lain. Ini bukan cuma teori — tidak ada satu baris pun di handler ini yang memvalidasi hasil akhir path.

Fix — validasi hasil resolve tetap di dalam base dir sebelum baca file:

ts
const baseDir = path.join(process.cwd(), 'private-uploads');
const resolvedPath = path.normalize(path.join(baseDir, relUploadPath));

if (!resolvedPath.startsWith(baseDir + path.sep)) {
  return new NextResponse('Invalid path', { status: 400 });
}
// baru readFile(resolvedPath) setelah lolos cek ini

Terapkan pengecekan yang sama di deleteFile() (src/lib/utils.ts) — fungsi itu juga menggabung path tanpa normalisasi, walau risikonya lebih rendah karena inputnya dari database, bukan langsung dari URL publik.

Status semua item dari laporan pertama
#	Item	Status	Catatan
P0-1	Token JWT di localStorage	✅ Beres	Dicek di semua titik: kedua halaman login, admin/layout.tsx, publisher/layout.tsx, PublisherPublicLayout.tsx, analytics/route.ts — semua sudah murni andalkan cookie httpOnly. Bonus: interval polling publisher juga dinaikkan 12s→60s.
P0-2	Upload file tanpa validasi	✅ Beres	uploadValidation.ts solid: whitelist ekstensi+MIME, batas ukuran, cek magic-byte %PDF, dan blokir <svg>/<script>/<html> di file gambar. Terpasang di publisher/books & publisher/profile. Satu catatan kecil: cek magic-byte gambar belum verifikasi byte asli JPEG/PNG/WebP, cuma menolak pola SVG/HTML — cukup untuk menutup vektor XSS utama, tapi belum 100% menjamin file benar-benar gambar valid.
P0-3	Kredensial admin default	✅ Beres	scripts/seedAdmin.ts sekarang env-driven + random password.
P0-4	JWT secret placeholder	✅ Beres	Secret baru jauh lebih kuat, fallback dihapus, AuthService throw kalau kosong/pendek.
P0-5	File publik menembus status moderasi	❌ BELUM beres (lihat di atas)	Route baru dibuat, tapi saveFile() masih nulis ke public/uploads → URL lama tanpa proteksi masih hidup berdampingan.
P1-1	CSV Formula Injection	✅ Beres	csvSafe() diterapkan konsisten di kedua jenis export.
P1-2	Rating tanpa dedup	✅ Beres	Pendekatan beda dari sarantah (cookie per-buku, bukan kolom visitorId) — lebih ringan, cukup untuk mencegah spam kasual (bukan proteksi kelas kriptografis, tapi itu memang bukan levelnya di sini). Ditambah rate limit 15/menit per IP.
P1-3	Nihil rate limiting	✅ Beres	Terpasang di admin login (5/menit), publisher login (10/menit), register (5/menit), rating (15/menit). Catatan: implementasinya in-memory (rateLimit.ts) — bekerja baik untuk 1 instance server, tidak akan konsisten kalau nanti deploy ke multi-instance/serverless.
P1-4	SVG kategori tanpa sanitasi	⚠️ Setengah beres	POST /api/admin/categories sekarang blokir <script>, <foreignObject>, javascript:, on*= — bagus, bahkan lebih lengkap dari yang saya sarankan. Tapi PATCH (edit kategori) di file yang sama masih pakai kode lama persis — nol sanitasi, nol batas ukuran, dan masih return path /uploads/categories/... yang lama. Tinggal copy blok validasi dari POST ke PATCH.
§3-3	Kode duplikat di analytics/route.ts	✅ Beres	Blok manual re-check Bearer token sudah dihapus.
§3-1	UserModel nama menyesatkan	⚠️ Setengah beres	PublisherModel.ts baru dibuat dengan benar, tapi UserModel.ts lama tidak dihapus — sekarang isinya cuma export * from './PublisherModel' plus alias export const UserModel = PublisherModel. Ini jalan (tidak ada yang rusak), tapi AuthService.ts dkk masih import { UserModel } dari file lama, bukan langsung PublisherModel. Selesaikan: ganti semua import ke PublisherModel, baru hapus UserModel.ts.
§4-1	Bug responsif login publisher	✅ Beres	style yang tadinya menimpa hidden lg:flex sudah dibersihkan.
§4-2	Kontras --text-muted	✅ Beres	Diganti persis ke 
#707070 seperti disarankan (4.74–4.95:1).
§4-2	Kontras .btn-primary (putih di atas emas)	❌ BELUM beres	src/app/globals.css — .btn-primary { background: var(--accent-primary); color: #fff; } masih persis sama, masih 2.24:1. Ini kode fix yang saya kasih di laporan pertama, tidak diterapkan. Cek juga: banyak tombol di publisher/layout.tsx dan admin/* yang override background inline jadi warnanya kebetulan beda (biru/hitam) — tapi di halaman manapun yang masih pakai .btn-primary polos (kemungkinan besar di admin/dashboard, admin/books, dll yang belum saya cek ulang satu-satu), teks putih-di-atas-emas ini masih gagal kontras.
§4-3	outline:none global, fokus keyboard hilang	✅ Beres, rapi	outline:none dihapus dari rule dasar, diganti :focus-visible global. Lebih bersih dari saran saya.
§4-4	Clear-search pakai <div>	✅ Beres	Sudah jadi <button type="button" aria-label="Hapus pencarian">.
§4-6	Sidebar admin tidak responsif	❌ BELUM beres	globals.css dapat tambahan class .sidebar/.main-content dengan media query collapse — tapi admin/layout.tsx tidak pernah pakai class itu. Sidebar admin di kode aktual masih <aside style={{width: sidebarWidth+'px', position:'fixed', ...}}> inline, nol @media, cuma tombol collapse manual. CSS-nya sudah siap, komponennya belum disambungkan.
§4-7	prefers-reduced-motion	✅ Beres (bonus)	Tidak diminta eksplisit tapi ditambahkan.
§5	Font Google dobel	⏳ Belum disentuh	Masih ada <link> di layout.tsx dan @import di globals.css.
§5	Homepage 100% client component	⏳ Belum disentuh	page.tsx masih 'use client' di baris pertama.
§5	getTopPublishers tidak sort by performa	⏳ Belum disentuh (belum saya cek ulang kodenya, tidak ada tanda di file yang saya baca kalau ini disentuh)	
§6-1	Pembaca PDF in-browser	⚠️ Dibangun, tapi setengah jalan	PdfReaderModal.tsx baru: modal bagus, toolbar lengkap dengan aria-label di semua tombol ikon (persis yang saya minta), mode terang/sepia/gelap (bonus — sekaligus menutup poin "dark mode" di daftar fitur hilang). Tapi: rendering PDF-nya cuma <iframe src={pdfUrl}> — bergantung penuh pada plugin PDF bawaan browser, bukan react-pdf/pdfjs-dist yang sudah terpasang (masih dependency mati/tidak dipakai). Konsekuensinya: (a) rendering di Safari iOS/beberapa WebView Android tidak konsisten — bisa saja malah trigger download, bukan tampil; (b) tombol zoom cuma mengubah CSS width container iframe, bukan zoom asli konten PDF; (c) ChevronLeft/ChevronRight di-import untuk navigasi halaman tapi tidak pernah dipakai di JSX — sisa pekerjaan yang ditinggal setengah jalan.
§6-2	Lupa password	⚠️ Setengah beres	Ada untuk publisher (forgot-password, reset-password, halaman UI-nya). Admin sama sekali belum punya — kalau admin lupa password, masih buntu total.
§6-7	"Top Publishers" salah sort	⏳ Belum disentuh	
§6-15	Structured data (JSON-LD)	✅ Beres (bonus)	Ditambahkan di halaman detail buku, tidak diminta eksplisit.
—	Announcement target alignment	✅ Beres, dengan catatan kecil	Sekarang admin divalidasi whitelist, publisher membaca [..., publisher.status]. Nuansa: karena verifyPublisherAuth sudah menyaring publisher BANNED sebelum mencapai endpoint ini, pengumuman bertarget "BANNED" secara struktural tidak akan pernah terkirim ke siapa pun — kalau memang ada rencana pakai target itu untuk mis. instruksi banding/appeal ke publisher yang di-ban, itu perlu jalur terpisah karena publisher yang di-ban tidak bisa login untuk membacanya.
Yang perlu dikerjakan lagi (urutan prioritas)
Pindahkan folder upload keluar dari public/ (private-uploads/) — ini satu-satunya cara P0-5 benar-benar tertutup. Tanpa ini, seluruh kerja route /api/files/ tidak berarti secara keamanan.
Tambah guard anti path-traversal di api/files/[...path]/route.ts dan deleteFile().
Copy blok sanitasi SVG dari POST ke PATCH di api/admin/categories/route.ts.
Ganti .btn-primary { color: #fff } jadi color: var(--text-primary) di globals.css — satu baris, sudah saya kasih sejak laporan pertama.
Sambungkan admin/layout.tsx ke sistem responsif — pakai class .sidebar/.main-content yang sudah ada di CSS, atau tambahkan media query khusus untuk <aside> inline-nya.
Selesaikan migrasi UserModel.ts → hapus filenya, ganti semua import ke PublisherModel.
Tambahkan alur lupa-password untuk admin juga (sekarang cuma publisher).
(Prioritas lebih rendah, belum disentuh sama sekali) Font dobel, homepage client-only, getTopPublishers sort, dua design system yang bentrok.
Skor terbaru
Dimensi	Sebelum	Sekarang	Kenapa
🔐 Keamanan	32	58	Naik banyak dari rate-limit, validasi upload, secret, kredensial default — tapi P0-5 ternyata masih terbuka + ada bug traversal baru, jadi belum bisa naik ke angka "aman".
🏗️ Arsitektur	68	74	Middleware baru, kode duplikat hilang; rename model belum tuntas.
🎨 UI/UX & A11y	44	62	Fokus keyboard & reduced-motion beres rapi; kontras tombol utama & sidebar admin masih bolong.
⚡ Performa	48	52	Cuma interval polling yang dibenahi; font dobel & homepage client-only belum disentuh.
📦 Fitur	50	68	Reader, forgot-password (publisher), structured data — progres nyata, walau reader-nya belum solid di mobile.
TOTAL	44	⚠️ 63/100	Progres nyata, tapi jangan deploy dulu — P0-5 adalah satu-satunya alasan skor keamanan tidak saya naikkan lebih tinggi: secara teknis lubang aslinya masih terbuka penuh, cuma dibungkus jalur baru yang terlihat aman di permukaan.