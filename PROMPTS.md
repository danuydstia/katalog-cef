# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**

Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Halaman katalog beranda `/` berhasil mengambil dan menampilkan seluruh produk dari tabel `produk` di Supabase secara *server-side*. Pesan error tampil jelas jika gagal dan teks *"Belum ada produk"* muncul saat tabel kosong. Komponen `CatatanBelumAktif` dihapus.

**Perbaikan:**
Menambahkan pembersihan format URL Supabase otomatis di `lib/supabase/server.js` untuk mengatasi URL yang memiliki akhiran `/rest/v1/` atau *trailing slash*.

## US-02 Detail produk

**Prompt:**

Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
Halaman `/produk/[id]` berhasil mengambil data spesifik produk dari database secara *server-side*. Jika produk tidak ada atau format ID tidak valid, fungsi `notFound()` dipanggil dan mengarahkan ke halaman 404.

**Perbaikan:**
Memastikan pemanggilan `notFound()` dilakukan di luar blok `try-catch` agar error navigasi internal Next.js tidak tertelan.

## US-03 Pesan via WhatsApp

**Prompt:**

Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
Komponen `TombolWhatsApp` menjadi tautan `<a>` yang membuka `https://wa.me/<nomor>?text=...` di tab baru. Pesan terisi otomatis dengan nama dan harga produk dalam format rupiah serta di-encode dengan `encodeURIComponent`.

**Perbaikan:**
Membersihkan karakter non-digit dari nomor WhatsApp agar format nomor internasional selalu valid.

## US-04 Login admin

**Prompt:**

Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
Login admin berhasil dibuat dengan `@supabase/ssr` dan cookie melalui Server Action `login` di `app/admin/actions.js`. Jika kredensial salah, pesan error tampil di halaman login. Tombol "Keluar" di `NavAdmin` berhasil mengakhiri sesi dan kembali ke `/admin/login`.

**Perbaikan:**
Mengimplementasikan client sesi admin di `lib/supabase/session.js` menggunakan metode `getAll` dan `setAll` untuk cookie sesi Next.js.

## US-05 Ganti password

**Prompt:**

Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Server Action `gantiPassword` memvalidasi panjang password minimal 8 karakter dan mencocokkan konfirmasi password di server. Sesi login diverifikasi terlebih dahulu sebelum memanggil `supabase.auth.updateUser`. Pesan sukses atau error tampil jelas.

**Perbaikan:**
Menampilkan kotak pesan berhasil hijau pada `/admin/password` setelah password berhasil diperbarui.

## US-06 Proteksi halaman admin

**Prompt:**

Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.

Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
Dibuat file `proxy.js` di root proyek untuk memproteksi seluruh rute `/admin` (kecuali `/admin/login`). Pengunjung yang belum login otomatis dialihkan ke halaman login. Seluruh Server Action yang memodifikasi data memeriksa login di server.

**Perbaikan:**
Menggunakan matcher `["/admin", "/admin/:path*"]` untuk memastikan rute `/admin` itu sendiri maupun sub-rutenya terlindungi dengan presisi.

## US-07 List Produk

**Prompt:**

Baca docs/user-stories.md bagian US-07.

Ubah halaman app/admin/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase — bukan dari data contoh. Tampilkan produk memakai komponen/tampilan yang sudah ada tanpa mengubahnya. Kalau gagal mengambil data, tampilkan pesan error yang jelas. Kalau tabel kosong, tampilkan pesan yang jelas. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Halaman `/admin` berhasil mengambil dan menampilkan produk langsung dari database Supabase menggunakan `TabelProduk`. Jika tabel kosong, muncul tulisan *"Belum ada produk"*, dan pesan error tampil jika query gagal.

**Perbaikan:**
Menambahkan dukungan query parameters (`searchParams`) pada halaman admin untuk menampilkan pesan status feedback dari aksi server.

## US-08 Tambah produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-08.

Buat halaman tambah produk admin di app/admin/produk/baru/page.jsx dengan form produk (nama, kategori, harga, deskripsi, foto) yang disambungkan ke Server Action di app/admin/actions.js untuk menyimpan produk baru ke tabel "produk" di Supabase, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Pastikan Server Action memeriksa login admin di server, sehingga tanpa login aksinya ditolak. Setelah berhasil disimpan, arahkan kembali ke /admin. Kalau gagal, tampilkan pesan error yang jelas di halaman. Jangan ubah tampilan yang sudah ada. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Form di `/admin/produk/baru` tersambung ke Server Action `tambahProduk`. Validasi nama dan harga dijalankan di server. Aksi memeriksa login admin dan mengarahkan kembali ke `/admin` dengan pesan berhasil.

**Perbaikan:**
Menambahkan prop `action` pada `FormProduk` dan memanggil `revalidatePath` untuk memperbarui data katalog dan tabel admin secara instan.

## US-09 Ubah produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-09.

Buat halaman ubah produk admin di app/admin/produk/[id]/ubah/page.jsx yang mengambil data produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase, lalu mengisi form dengan data lama. Sambungkan form ke Server Action di app/admin/actions.js untuk memperbarui produk di tabel "produk". Pastikan Server Action memeriksa login admin di server, sehingga tanpa login aksinya ditolak. Setelah berhasil disimpan, arahkan kembali ke /admin. Kalau gagal, tampilkan pesan error yang jelas di halaman. Jangan ubah tampilan yang sudah ada. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Halaman ubah produk mengisi form dengan data lama dari database dan memperbarui produk via Server Action `ubahProduk`. Aksi terlindungi login dan menampilkan feedback berhasil di `/admin`.

**Perbaikan:**
Menambahkan input hidden `id` pada form dan mendukung akses baik melalui URL `/ubah` maupun `/edit`.

## US-10 Hapus produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-10.

Buat Server Action hapus produk di app/admin/actions.js untuk menghapus satu produk dari tabel "produk" di Supabase berdasarkan id, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Pastikan Server Action memeriksa login admin di server, sehingga tanpa login aksinya ditolak. Sambungkan aksi hapus ke tombol "Hapus" di halaman daftar produk admin (app/admin/page.jsx) dengan konfirmasi sebelum menghapus, tanpa mengubah tampilan yang sudah ada. Setelah berhasil dihapus, muat ulang daftar produk dan tampilkan pesan berhasil. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Tombol "Hapus" di tabel produk admin memunculkan konfirmasi browser (`window.confirm`) sebelum dieksekusi. Jika disetujui, produk dihapus dari database melalui Server Action `hapusProduk` yang terlindungi login.

**Perbaikan:**
Mengonversi `TabelProduk` menjadi Client Component yang membungkus aksi ke Server Action dan memperbarui tampilan via `revalidatePath`.

## US-11 Filter kategori atau pencarian

**Prompt:**

Baca docs/user-stories.md bagian US-11.

Tambahkan filter kategori dan/atau pencarian nama produk di halaman beranda app/page.jsx. Filter/pencarian dilakukan di query database (bukan hanya menyembunyikan kartu di browser), memakai koneksi Supabase di lib/supabase. Hasil harus sesuai dengan kategori atau kata kunci yang dipilih. Kalau tidak ada hasil, tampilkan pesan yang jelas. Jangan ubah tampilan kartu produk.

**Hasil:**
Filter kategori dan kotak pencarian nama produk ditambahkan ke beranda `app/page.jsx`. Penyaringan dilakukan langsung di level query database Supabase menggunakan operator `ilike` dan `eq`.

**Perbaikan:**
Menyediakan tombol "Reset" dan pesan informatif saat tidak ada produk yang cocok dengan kata kunci atau filter.

## US-12 Pilih jumlah atau varian

**Prompt:**

Baca docs/user-stories.md bagian US-12.

Tambahkan pilihan jumlah atau varian di halaman detail produk app/produk/[id]/page.jsx sebelum tombol WhatsApp. Pilihan pengunjung harus ikut tertulis di pesan WhatsApp yang dibuka lewat components/TombolWhatsApp.jsx (misalnya "2x Kopi Robusta 250 g"). Pertahankan format harga rupiah dan encodeURIComponent. Jangan ubah tampilan lain.

**Hasil:**
Kontrol pemilihan jumlah produk (stepper `-` dan `+`) ditambahkan sebelum tombol pesan WhatsApp. Jumlah dan total harga dihitung secara otomatis dan disertakan ke dalam teks pesan WhatsApp (misalnya *"2x Nama Produk seharga Rp ..."*).

**Perbaikan:**
Format rupiah dan fungsi `encodeURIComponent` dipertahankan dengan aman dalam pembentukan tautan `wa.me`.

## US-13 PWA

**Prompt:**

Baca docs/user-stories.md bagian US-13.

Tambahkan web app manifest (app/manifest.js atau public/manifest.webmanifest) dan tautkan di layout. Gunakan ikon yang tersedia di public/icons dan rujuk di manifest. Pastikan katalog bisa di-install ke layar utama HP (manifest valid, ikon cukup ukuran, start_url benar). Jangan ubah tampilan halaman.

**Hasil:**
Dibuat `app/manifest.js` yang merujuk pada ikon `icon-192.png` dan `icon-512.png` di `public/icons`, dengan `display: "standalone"`, `start_url: "/"`, serta warna tema toko.

**Perbaikan:**
Menempatkan `themeColor` pada konfigurasi `viewport` di `app/layout.jsx` sesuai standar App Router Next.js 16.

## US-14 Deskripsi produk dibuat AI

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-14.

Tambahkan fitur buat deskripsi otomatis dengan Gemini API di halaman tambah/ubah produk admin. Panggil Gemini API dari server (Server Action atau route handler), kunci API disimpan di environment variable dan tidak boleh ada di browser. Hasilnya mengisi kolom deskripsi di form sebelum produk disimpan. Tangani error dengan pesan yang jelas. Aksi harus memeriksa login admin di server.

**Hasil:**
Dibuat Server Action `buatDeskripsiAI` di `app/admin/actions.js` yang memanggil Google Gemini API dari server menggunakan `GEMINI_API_KEY`. Tombol *"✨ Buat deskripsi dengan AI"* pada form produk mengisi textarea deskripsi secara otomatis. Aksi ini terlindungi oleh verifikasi sesi login admin di server.

**Perbaikan:**
Menangani pesan kesalahan secara informatif jika API key belum diatur atau jika nama produk belum diisi.

## US-15 Urutkan produk

**Prompt:**

Baca docs/user-stories.md bagian US-15.

Tambahkan pilihan urutan produk di beranda: termurah, termahal, terbaru. Urutan diterapkan di query database (order by), bukan hanya mengurutkan array di tampilan. Pertahankan tampilan kartu.

**Hasil:**
Menu dropdown urutan produk (Termurah, Termahal, Terbaru) ditambahkan pada form beranda. Pengurutan diterapkan langsung pada query database Supabase menggunakan method `.order()`.

**Perbaikan:**
Mengintegrasikan pengurutan secara terpadu bersama pencarian dan filter kategori dalam satu form GET yang bersih dan dapat di-bookmark.

Mengintegrasikan pengurutan secara terpadu bersama pencarian dan filter kategori dalam satu form GET yang bersih dan dapat di-bookmark.
**Perbaikan:**