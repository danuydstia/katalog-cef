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

## US-16 Paginasi atau muat lebih banyak

**Prompt:**

Baca docs/user-stories.md bagian US-16.

Tambahkan paginasi atau tombol "Muat lebih banyak" pada daftar produk di beranda. Batas jumlah diambil lewat query database (range/limit), bukan hanya menyembunyikan kartu. Navigasi antar halaman berfungsi dan jumlah halaman benar.

**Hasil:**
Paginasi produk berhasil diterapkan pada beranda `app/page.jsx` dengan 12 produk per halaman. Batas jumlah diambil langsung melalui query database menggunakan method `.range(from, to)` dan `{ count: "exact" }`. Navigasi Sebelumnya / Selanjutnya berfungsi dengan nomor halaman yang akurat.

**Perbaikan:**
Fungsi navigasi paginasi mempertahankan parameter pencarian, filter kategori, dan urutan yang sedang aktif melalui `URLSearchParams`.

## US-17 Produk terkait di halaman detail

**Prompt:**

Baca docs/user-stories.md bagian US-17.

Di halaman detail app/produk/[id]/page.jsx, tampilkan beberapa produk lain dari kategori yang sama, diambil dari database. Produk yang sedang dibuka tidak ikut ditampilkan. Jangan ubah tampilan utama halaman detail.

**Hasil:**
Halaman detail `app/produk/[id]/page.jsx` menampilkan bagian *"Produk terkait"* dari kategori yang sama langsung dari database Supabase (`.eq("kategori", ...)`). Produk yang sedang dibuka dikecualikan dari daftar dengan filter `.neq("id", id)`.

**Perbaikan:**
Menampilkan hingga 4 produk terkait dalam tata letak grid kartu menggunakan komponen `KartuProduk` yang konsisten.

## US-18 Galeri beberapa foto produk

**Prompt:**

Baca docs/user-stories.md bagian US-18.

Tambahkan dukungan beberapa foto per produk (misalnya kolom array atau tabel foto_produk). Halaman detail menampilkan galeri: foto utama dan gambar kecil, pengunjung bisa berganti foto. Produk dengan satu foto tetap tampil normal.

**Hasil:**
Dibuat komponen `GaleriProduk` untuk mendukung multi-foto pada produk. Halaman detail menampilkan foto utama dan deretan thumbnail kecil yang dapat diklik untuk berganti foto secara interaktif. Produk dengan satu foto tetap tampil normal seperti semula.

**Perbaikan:**
Mendukung format multi-foto baik berupa array `foto_urls` maupun string URL yang dipisahkan tanda koma pada `foto_url`.

## US-19 Status stok

**Prompt:**

Baca docs/user-stories.md bagian US-19.

Tambahkan kolom status/jumlah stok di tabel produk. Produk yang habis diberi penanda "Habis" di kartu dan halaman detail, serta tombol pesan WhatsApp dinonaktifkan atau disembunyikan untuk produk tersebut.

**Hasil:**
Dukungan status stok (`stok` / `status_stok`) ditambahkan pada kartu produk dan halaman detail. Produk yang habis ditandai dengan badge *"Habis"* berwarna merah, dan tombol pesan WhatsApp otomatis dinonaktifkan dengan label *"Produk Habis"*.

**Perbaikan:**
Mencegah pengunjung mengeklik tombol pemesanan WhatsApp saat stok produk habis, sekaligus memberikan feedback visual yang jelas.

## US-20 Harga coret dan badge

**Prompt:**

Baca docs/user-stories.md bagian US-20.

Tambahkan dukungan harga diskon dan badge ("Baru" / "Terlaris") berdasarkan data produk. Harga normal tampil dicoret di kartu dan halaman detail kalau ada harga diskon. Badge tampil sesuai data produk.

**Hasil:**
Dukungan harga diskon (`harga_diskon`) dan badge (*"Baru"* / *"Terlaris"*) ditambahkan pada kartu produk dan halaman detail. Harga normal tampil dicoret (`line-through`) jika terdapat harga diskon, dan badge tampil di sudut kartu/halaman detail.

**Perbaikan:**
Perhitungan total harga pada pemesanan WhatsApp otomatis memakai harga diskon yang aktif.

## US-21 Keranjang, pesan semua via WhatsApp

**Prompt:**

Baca docs/user-stories.md bagian US-21.

Tambahkan fitur keranjang: tombol "Tambah ke keranjang" di kartu atau halaman detail, halaman keranjang yang bisa mengubah jumlah dan menghapus item dengan total harga benar, isi keranjang bertahan saat pindah halaman (localStorage), dan satu tombol untuk mengirim seluruh isi keranjang dalam satu pesan WhatsApp ke nomor di lib/toko.js.

**Hasil:**
Fitur keranjang belanja berhasil dibuat menggunakan React Context dan `localStorage` agar isi keranjang bertahan saat berpindah halaman. Tombol "Tambah ke Keranjang" tersedia pada kartu produk dan halaman detail produk. Halaman `/keranjang` menyediakan pengubah jumlah item (`-` dan `+`), tombol hapus item, perhitungan total harga dalam format Rupiah, serta tombol "Pesan Semua via WhatsApp" yang merangkum seluruh pesanan ke dalam satu pesan WhatsApp ke nomor di `lib/toko.js`.

**Perbaikan:**
Menambahkan badge counter jumlah produk pada ikon keranjang di header navigasi yang terbarui secara instan.

## US-22 Halaman Tentang dan kontak toko

**Prompt:**

Baca docs/user-stories.md bagian US-22.

Buat halaman /tentang berisi profil toko, alamat, jam buka, dan kontak. Tautkan halaman ini dari navigasi atau footer. Jangan ubah tampilan halaman lain.

**Hasil:**
Halaman `/tentang` berhasil dibuat memuat profil usaha, jam operasional, alamat lengkap, dan nomor kontak resmi dari `lib/toko.js`. Tautan ke halaman ini ditambahkan pada header navigasi dan footer aplikasi tanpa mengubah tata letak halaman lain.

**Perbaikan:**
Menyediakan tombol interaktif "Chat via WhatsApp" langsung pada bagian kontak halaman `/tentang` untuk memudahkan pembeli menghubungi pemilik toko.

## US-23 Bagikan atau salin link produk

**Prompt:**

Baca docs/user-stories.md bagian US-23.

Tambahkan tombol bagikan atau salin link di halaman detail produk memakai Web Share API (kalau tersedia) atau clipboard. Tampilkan umpan balik setelah ditekan, misalnya "Link tersalin".

**Hasil:**
Komponen `TombolBagikan` ditambahkan pada halaman detail produk `app/produk/[id]/page.jsx`. Tombol memanfaatkan Web Share API jika didukung oleh peramban pengguna, dan otomatis menggunakan `navigator.clipboard` sebagai fallback jika tidak tersedia. Umpan balik visual "Link tersalin!" atau "Berhasil dibagikan!" tampil selama 2,5 detik setelah tombol ditekan.

**Perbaikan:**
Menangani pembatalan dialog share (`AbortError`) dengan aman tanpa memicu error atau menampilkan peringatan kegagalan yang tidak perlu.

## US-24 Favorit tersimpan di browser

**Prompt:**

Baca docs/user-stories.md bagian US-24.

Tambahkan tombol favorit di kartu atau halaman detail. Favorit disimpan di browser (localStorage) dan bertahan setelah halaman dimuat ulang. Sediakan tampilan/halaman yang hanya berisi produk favorit.

**Hasil:**
Fitur penanda produk favorit dibuat menggunakan `localStorage` browser dan dapat diakses dari tombol hati pada setiap `KartuProduk` maupun halaman detail produk. Halaman khusus `/favorit` dibuat untuk menampilkan daftar produk yang ditandai favorit secara responsif, lengkap dengan informasi jumlah favorit di header.

**Perbaikan:**
Mencegah navigasi kartu (`e.preventDefault()` & `e.stopPropagation()`) saat pengunjung mengeklik ikon favorit pada kartu produk di katalog.

## US-25 Mode gelap

**Prompt:**

Baca docs/user-stories.md bagian US-25.

Tambahkan tombol berpindah mode terang/gelap. Pilihan disimpan di browser dan diingat setelah halaman dimuat ulang. Pastikan semua teks tetap terbaca di kedua mode.

**Hasil:**
Dibuat tombol pengalih mode terang/gelap pada header navigasi. Pilihan mode disimpan di `localStorage` dan dipertahankan saat halaman dimuat ulang. Seluruh token warna di `app/globals.css` disesuaikan untuk mode gelap (`html.dark`) guna menjamin keterbacaan teks dan kontras yang optimal di kedua mode.

**Perbaikan:**
Menambahkan skrip inisialisasi tema inline pada elemen `<head>` di `app/layout.jsx` untuk mencegah efek kedipan warna putih (*flash of unstyled content / FOUC*) saat memuat ulang halaman dalam mode gelap.

## US-26 Metadata SEO dan Open Graph

**Prompt:**

Baca docs/user-stories.md bagian US-26.

Di halaman detail app/produk/[id]/page.jsx, tambahkan generateMetadata yang memakai judul dan deskripsi sesuai produk, serta Open Graph berisi nama dan foto produk.

**Hasil:**
Fungsi `generateMetadata` ditambahkan pada `app/produk/[id]/page.jsx`. Judul dan deskripsi meta dihasilkan secara dinamis berdasarkan data produk dari database. Tag Open Graph dan Twitter Card memuat nama produk, deskripsi, serta foto utama produk untuk pratinjau yang optimal saat link produk dibagikan ke media sosial.

**Perbaikan:**
Membersihkan tag deskripsi teknis (seperti `[diskon: ...]`, `[baru]`, `[habis]`) dari teks deskripsi meta publik.

## US-27 sitemap.xml dan robots.txt

**Prompt:**

Baca docs/user-stories.md bagian US-27.

Buat sitemap.xml dinamis (app/sitemap.js) dari database yang memuat halaman produk, dan robots.txt (app/robots.js) yang valid dan menunjuk ke sitemap.

**Hasil:**
Dibuat `app/sitemap.js` yang secara dinamis mengambil seluruh produk dari database Supabase dan memetakan rute halaman statis serta halaman produk dengan `lastModified` dan prioritas yang tepat. Dibuat `app/robots.js` yang mengizinkan pengindeksan publik, memblokir area admin (`/admin`), dan menunjuk langsung ke `sitemap.xml`.

**Perbaikan:**
Menangani kegagalan koneksi database saat fase build dengan aman agar build produksi tidak gagal jika database sedang tidak dapat dijangkau.

## US-28 Halaman 404 dan loading kustom

**Prompt:**

Baca docs/user-stories.md bagian US-28.

Buat app/not-found.jsx kustom dengan tautan kembali ke beranda, dan app/loading.jsx atau skeleton di halaman yang mengambil data.

**Hasil:**
Dibuat halaman `app/not-found.jsx` kustom yang ramah dan konsisten dengan panduan desain, dilengkapi tombol "Kembali ke Katalog". Ditambahkan juga `app/loading.jsx` dan `app/produk/[id]/loading.jsx` dengan animasi efek skeleton loader saat data sedang dimuat dari server.

**Perbaikan:**
Menyesuaikan struktur skeleton kartu katalog agar presisi dengan grid 2 kolom di HP dan 3 kolom di layar lebar.

## US-29 Upload foto ke Supabase Storage

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-29.

Tambahkan input file foto di form produk. File diunggah ke Supabase Storage dari server (Server Action), kunci tidak ada di browser. URL foto tersimpan di produk dan tampil di katalog. Validasi tipe file (gambar) dan ukuran maksimal dengan pesan error yang jelas. Aksi memeriksa login admin di server.

**Hasil:**
Form produk di `components/FormProduk.jsx` kini memiliki input file foto dengan pratinjau gambar langsung. File diunggah ke Supabase Storage (bucket `produk`) secara aman dari server melalui Server Action di `app/admin/actions.js` tanpa mengekspos kunci ke browser. Validasi tipe file (wajib berupa gambar) dan ukuran maksimal (maksimal 2 MB) dilakukan di server dengan pesan error yang jelas. Aksi upload terlindungi oleh pemeriksaan login admin di server.

**Perbaikan:**
Otomatis membuat bucket penyimpanan jika belum ada di Supabase serta mempertahankan opsi input link foto manual.

## US-30 Dashboard ringkasan admin

**Prompt:**

Baca docs/user-stories.md bagian US-30.

Ubah /admin menjadi dashboard ringkasan: jumlah produk dari database dan jumlah produk per kategori. Halaman hanya bisa dibuka setelah login (dijaga oleh proxy.js).

**Hasil:**
Halaman `/admin` diubah menjadi dashboard ringkasan yang menampilkan metrik utama toko: kartu jumlah total produk di database, jumlah total kategori, serta rincian distribusi jumlah produk per kategori. Di bawah ringkasan, daftar produk (`TabelProduk`) dan tombol tambah produk tetap tersedia untuk pengelolaan produk. Seluruh halaman admin terlindungi oleh `proxy.js` dan verifikasi sesi login server.

**Perbaikan:**
Menata kartu ringkasan kategori dalam grid responsif dengan badge angka produk berpenampilan modern dan kontras tinggi.


## US-31 Kelola kategori

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-31.

Buat halaman admin untuk kelola kategori: tambah, ubah nama, hapus. Kategori yang masih dipakai produk ditolak atau ditangani dengan pesan jelas. Daftar kategori di form produk berasal dari data ini. Semua aksi memeriksa login admin di server.

**Hasil:**
Dibuat halaman `/admin/kategori` untuk mengelola kategori: menambah kategori baru, mengubah nama kategori (otomatis memperbarui seluruh produk terkait), dan menghapus kategori. Jika kategori masih digunakan oleh produk, aksi hapus ditolak dengan pesan peringatan yang jelas. Form tambah dan ubah produk (`FormProduk`) kini mengambil pilihan kategori langsung dari daftar kategori ini. Seluruh aksi Server Action terlindungi oleh verifikasi sesi login admin.

**Perbaikan:**
Menampilkan badge jumlah produk yang menggunakan masing-masing kategori pada tabel dan mencegah penghapusan kategori yang masih memiliki produk aktif.

## US-32 Aktif atau nonaktifkan produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-32.

Tambahkan kolom aktif/nonaktif di produk dan tombol untuk mengubahnya di halaman admin. Produk nonaktif tidak muncul di katalog publik dan halaman detailnya menampilkan "tidak ditemukan". Aksi memeriksa login admin di server.

**Hasil:**
Ditambahkan tombol pengubah status (Aktif / Nonaktif) pada setiap baris produk di tabel admin melalui Server Action `toggleStatusProduk`. Produk yang berstatus nonaktif otomatis disaring keluar dari katalog publik (`/`) dan jika URL detailnya (`/produk/[id]`) diakses langsung, sistem mengembalikan halaman 404 (`notFound()`). Seluruh aksi memeriksa login admin di server.

**Perbaikan:**
Menyinkronkan status baik melalui kolom status database maupun tag status deskripsi agar kompatibel dengan seluruh konfigurasi skema tabel.

## US-33 Cari dan paginasi di list admin

**Prompt:**

Baca docs/user-stories.md bagian US-33.

Tambahkan kolom cari di /admin yang menyaring lewat query database dan paginasi daftar produk. Kata kunci dan nomor halaman disimpan di URL (searchParams) sehingga tetap ada setelah dimuat ulang.

**Hasil:**
Kolom pencarian nama produk ditambahkan di halaman `/admin` dengan penyaringan langsung di level query database Supabase menggunakan operator `.ilike()`. Daftar produk dibatasi 10 produk per halaman menggunakan `.range()` dengan kontrol paginasi Sebelumnya / Selanjutnya. Kata kunci pencarian dan nomor halaman disimpan di URL (`searchParams`) sehingga tetap bertahan saat halaman dimuat ulang.

**Perbaikan:**
Menyertakan tombol "Reset" saat pencarian aktif dan mempertahankan kata kunci pencarian dalam setiap perpindahan halaman paginasi.

## US-34 Validasi form admin di server

**Prompt:**

Baca docs/user-stories.md bagian US-34.

Tambahkan validasi server pada form produk: nama wajib, harga angka positif. Pesan error tampil per field di bawah input yang salah. Nilai yang sudah diisi tidak hilang saat terjadi error.

**Hasil:**
Validasi server diterapkan pada Server Action `tambahProduk` dan `ubahProduk` menggunakan `useActionState`: nama wajib diisi dan harga harus berupa angka positif. Pesan error ditampilkan per field tepat di bawah input yang salah, dan nilai yang sudah diketik pengguna tidak hilang saat terjadi kesalahan validasi.

**Perbaikan:**
Menggunakan `useActionState` React 19 / Next.js 16 sehingga feedback validasi tampil instan tanpa me-reload form atau menghilangkan data input lainnya.

## US-35 Ekspor produk ke CSV

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-35.

Buat tombol "Ekspor CSV" yang mengunduh semua produk. CSV dibuat di server (route handler), header dan kolom jelas, karakter khusus (koma, kutip) di-escape dengan benar. Endpoint memeriksa login: tanpa login ditolak.

**Hasil:**
Dibuat Route Handler di `app/api/admin/ekspor-csv/route.js` yang menghasilkan file CSV dari seluruh data produk di database Supabase lengkap dengan header kolom yang rapi dan escaping karakter khusus (koma, tanda kutip ganda, enter) yang aman. Tombol "Ekspor CSV" ditambahkan di `/admin`. Endpoint memverifikasi sesi login admin di server dan menolak akses dengan respons 401 Unauthorized jika belum login.

**Perbaikan:**
Menyertakan nama file otomatis berstempel tanggal (misalnya `katalog-produk-2026-10-20.csv`) dan membersihkan tag teknis internal dari deskripsi produk yang diekspor.


## US-36 Terakhir dilihat

**Prompt:**

Baca docs/user-stories.md bagian US-36.

Buat fitur produk terakhir dilihat: produk yang dibuka disimpan di browser (localStorage) dengan batas maksimal 6 produk. Tampilkan bagian "Terakhir dilihat" di beranda jika ada riwayat dan tidak muncul bila masih kosong.

**Hasil:**
Dibuat komponen `CatatTerakhirDilihat` pada halaman detail produk yang otomatis merekam produk yang sedang dilihat ke `localStorage` (maksimal 6 produk terakhir tanpa duplikasi). Komponen `TerakhirDilihat` ditambahkan di bagian bawah beranda katalog yang menampilkan riwayat produk dan otomatis disembunyikan jika riwayat masih kosong.

**Perbaikan:**
Menambahkan tombol "Hapus riwayat" sehingga pengunjung dapat membersihkan daftar produk terakhir dilihat kapan saja.

## US-37 Bandingkan 2 produk

**Prompt:**

Baca docs/user-stories.md bagian US-37.

Tambahkan fitur membandingkan dua produk secara berdampingan: tombol pilih bandingkan di kartu dan halaman detail, floating bar pilihan produk, halaman perbandingan `/bandingkan` menampilkan foto, nama, kategori, harga, dan deskripsi berdampingan. Batasi maksimal 2 produk dengan penolakan atau pesan jelas jika memilih lebih dari 2. Tangani produk yang tidak ditemukan dengan pesan yang ramah.

**Hasil:**
Fitur perbandingan 2 produk berhasil dibuat. Tombol "Bandingkan" tersedia pada setiap kartu produk dan halaman detail. Floating bar di bagian bawah layar muncul saat produk dipilih, menolak pemilihan lebih dari 2 produk dengan peringatan yang jelas. Halaman `/bandingkan` memuat kedua produk secara berdampingan lengkap dengan foto, nama, kategori, harga, deskripsi, dan tombol pesan WhatsApp. Jika salah satu atau kedua produk tidak ditemukan di database, halaman menampilkan pesan informatif.

**Perbaikan:**
Mengintegrasikan floating bar perbandingan langsung ke dalam `PenyediaAplikasi` agar status pilihan tetap sinkron saat berpindah antar halaman katalog.

## US-38 Ulasan dan rating

**Prompt:**

Baca docs/user-stories.md bagian US-38.

Tambahkan formulir ulasan (nama, rating 1 sampai 5 bintang, komentar) di halaman detail produk. Simpan ulasan melalui Server Action dengan validasi server dan perlindungan spam dasar (honeypot serta pembatasan panjang karakter). Tampilkan daftar ulasan dan rata-rata rating pembeli di halaman detail.

**Hasil:**
Formulir ulasan pembeli (`FormUlasan`) dan daftar ulasan (`DaftarUlasan`) ditambahkan ke halaman detail produk. Nilai rating bintang (1-5), nama pengulas, dan teks komentar divalidasi di server melalui Server Action `tambahUlasan`. Perlindungan spam diterapkan menggunakan field jebakan *honeypot* serta batas panjang karakter (nama maks 50 karakter, komentar maks 500 karakter). Rata-rata rating dihitung secara dinamis dan ditampilkan di atas ulasan.

**Perbaikan:**
Menyediakan penyimpanan data ulasan ganda (Supabase table dan fallback lokal) untuk memastikan ulasan selalu dapat tersimpan dan tampil tanpa dependensi schema manual.

## US-39 Moderasi ulasan di admin

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-39.

Buat halaman moderasi ulasan di `/admin/ulasan` untuk melihat semua ulasan pelanggan. Admin yang sudah login dapat menyembunyikan atau menghapus ulasan yang tidak pantas. Ulasan yang disembunyikan tidak muncul di halaman publik dan tidak dihitung ke rata-rata rating. Semua aksi memeriksa login di server.

**Hasil:**
Halaman `/admin/ulasan` dibuat untuk menampilkan seluruh ulasan masuk ke admin. Admin dapat menekan tombol "Sembunyikan" / "Tampilkan" untuk menyaring ulasan atau "Hapus" untuk menghapus ulasan secara permanen via Server Actions `toggleStatusUlasan` dan `hapusUlasan`. Ulasan yang berstatus disembunyikan otomatis dikecualikan dari halaman detail produk publik dan tidak dihitung dalam penilaian rata-rata rating.

**Perbaikan:**
Menambahkan navigasi "Ulasan" pada header admin dan konfirmasi keamanan peramban sebelum menghapus ulasan.

## US-40 Catat klik pesan WhatsApp

**Prompt:**

Baca docs/user-stories.md bagian US-40.

Catat setiap klik tombol pesan WhatsApp ke database (produk dan waktu) tanpa menghambat atau menunda terbukanya aplikasi WhatsApp. Tidak boleh menyimpan data pribadi pengunjung.

**Hasil:**
Dibuat Route Handler `app/api/klik-wa/route.js` dan helper `lib/klik-wa.js` untuk mencatat metrik klik pemesanan WhatsApp (hanya ID produk dan stempel waktu, tanpa IP atau data pribadi pengunjung). Tombol pemesanan WhatsApp di `TombolWhatsApp.jsx` mengirimkan sinyal pelacakan menggunakan `navigator.sendBeacon` / `fetch(..., { keepalive: true })` secara *background* sehingga pengguna langsung diarahkan ke aplikasi WhatsApp seketika tanpa jeda.

**Perbaikan:**
Menggunakan API `sendBeacon` peramban untuk menjamin pengiriman analitik klik tetap berhasil meskipun tab segera beralih ke WhatsApp.


## US-36 Terakhir dilihat

**Prompt:**

Baca docs/user-stories.md bagian US-36.

Buat fitur produk terakhir dilihat: produk yang dibuka disimpan di browser (localStorage) dengan batas maksimal 6 produk. Tampilkan bagian "Terakhir dilihat" di beranda jika ada riwayat dan tidak muncul bila masih kosong.

**Hasil:**
Dibuat komponen `CatatTerakhirDilihat` pada halaman detail produk yang otomatis merekam produk yang sedang dilihat ke `localStorage` (maksimal 6 produk terakhir tanpa duplikasi). Komponen `TerakhirDilihat` ditambahkan di bagian bawah beranda katalog yang menampilkan riwayat produk dan otomatis disembunyikan jika riwayat masih kosong.

**Perbaikan:**
Menambahkan tombol "Hapus riwayat" sehingga pengunjung dapat membersihkan daftar produk terakhir dilihat kapan saja.

## US-37 Bandingkan 2 produk

**Prompt:**

Baca docs/user-stories.md bagian US-37.

Tambahkan fitur membandingkan dua produk secara berdampingan: tombol pilih bandingkan di kartu dan halaman detail, floating bar pilihan produk, halaman perbandingan `/bandingkan` menampilkan foto, nama, kategori, harga, dan deskripsi berdampingan. Batasi maksimal 2 produk dengan penolakan atau pesan jelas jika memilih lebih dari 2. Tangani produk yang tidak ditemukan dengan pesan yang ramah.

**Hasil:**
Fitur perbandingan 2 produk berhasil dibuat. Tombol "Bandingkan" tersedia pada setiap kartu produk dan halaman detail. Floating bar di bagian bawah layar muncul saat produk dipilih, menolak pemilihan lebih dari 2 produk dengan peringatan yang jelas. Halaman `/bandingkan` memuat kedua produk secara berdampingan lengkap dengan foto, nama, kategori, harga, deskripsi, dan tombol pesan WhatsApp. Jika salah satu atau kedua produk tidak ditemukan di database, halaman menampilkan pesan informatif.

**Perbaikan:**
Mengintegrasikan floating bar perbandingan langsung ke dalam `PenyediaAplikasi` agar status pilihan tetap sinkron saat berpindah antar halaman katalog.

## US-38 Ulasan dan rating

**Prompt:**

Baca docs/user-stories.md bagian US-38.

Tambahkan formulir ulasan (nama, rating 1 sampai 5 bintang, komentar) di halaman detail produk. Simpan ulasan melalui Server Action dengan validasi server dan perlindungan spam dasar (honeypot serta pembatasan panjang karakter). Tampilkan daftar ulasan dan rata-rata rating pembeli di halaman detail.

**Hasil:**
Formulir ulasan pembeli (`FormUlasan`) dan daftar ulasan (`DaftarUlasan`) ditambahkan ke halaman detail produk. Nilai rating bintang (1-5), nama pengulas, dan teks komentar divalidasi di server melalui Server Action `tambahUlasan`. Perlindungan spam diterapkan menggunakan field jebakan *honeypot* serta batas panjang karakter (nama maks 50 karakter, komentar maks 500 karakter). Rata-rata rating dihitung secara dinamis dan ditampilkan di atas ulasan.

**Perbaikan:**
Menyediakan penyimpanan data ulasan ganda (Supabase table dan fallback lokal) untuk memastikan ulasan selalu dapat tersimpan dan tampil tanpa dependensi schema manual.

## US-39 Moderasi ulasan di admin

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-39.

Buat halaman moderasi ulasan di `/admin/ulasan` untuk melihat semua ulasan pelanggan. Admin yang sudah login dapat menyembunyikan atau menghapus ulasan yang tidak pantas. Ulasan yang disembunyikan tidak muncul di halaman publik dan tidak dihitung ke rata-rata rating. Semua aksi memeriksa login di server.

**Hasil:**
Halaman `/admin/ulasan` dibuat untuk menampilkan seluruh ulasan masuk ke admin. Admin dapat menekan tombol "Sembunyikan" / "Tampilkan" untuk menyaring ulasan atau "Hapus" untuk menghapus ulasan secara permanen via Server Actions `toggleStatusUlasan` dan `hapusUlasan`. Ulasan yang berstatus disembunyikan otomatis dikecualikan dari halaman detail produk publik dan tidak dihitung dalam penilaian rata-rata rating.

**Perbaikan:**
Menambahkan navigasi "Ulasan" pada header admin dan konfirmasi keamanan peramban sebelum menghapus ulasan.

## US-40 Catat klik pesan WhatsApp

**Prompt:**

Baca docs/user-stories.md bagian US-40.

Catat setiap klik tombol pesan WhatsApp ke database (produk dan waktu) tanpa menghambat atau menunda terbukanya aplikasi WhatsApp. Tidak boleh menyimpan data pribadi pengunjung.

**Hasil:**
Dibuat Route Handler `app/api/klik-wa/route.js` dan helper `lib/klik-wa.js` untuk mencatat metrik klik pemesanan WhatsApp (hanya ID produk dan stempel waktu, tanpa IP atau data pribadi pengunjung). Tombol pemesanan WhatsApp di `TombolWhatsApp.jsx` mengirimkan sinyal pelacakan menggunakan `navigator.sendBeacon` / `fetch(..., { keepalive: true })` secara *background* sehingga pengguna langsung diarahkan ke aplikasi WhatsApp seketika tanpa jeda.

**Perbaikan:**
Menggunakan API `sendBeacon` peramban untuk menjamin pengiriman analitik klik tetap berhasil meskipun tab segera beralih ke WhatsApp.

## US-41 Produk terlaris di dashboard

**Prompt:**

Baca docs/user-stories.md bagian US-41.

Tampilkan 5 produk dengan klik pesan terbanyak di dashboard /admin, dihitung dari tabel pencatatan klik di database. Jika belum ada data, tampilkan pesan yang jelas.

**Hasil:**
Menambahkan fungsi `getTopProdukKlik(5)` pada `lib/klik-wa.js` yang menghitung agregasi frekuensi klik pesan WhatsApp setiap produk dan mengambil data detail produknya. Di `app/admin/page.jsx`, dibuat kartu dan grid interaktif "5 Produk Paling Sering Dipesan (WhatsApp)" yang memuat peringkat (#1 - #5), nama produk, kategori, harga Rupiah, jumlah klik pesanan WhatsApp, dan tautan langsung untuk melihat produk. Jika belum ada klik, ditampilkan pesan informatif *"Belum ada data pemesanan WhatsApp yang tercatat."*

**Perbaikan:**
Mengurutkan kembali hasil gabungan dari Supabase dan penyimpanan lokal berdasarkan jumlah klik tertinggi agar peringkat selalu akurat dan tidak melambat saat query.

## US-42 Banner promo di beranda

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-42.

Buat fitur banner promo: admin bisa membuat dan mengubah banner (judul, teks, gambar, tautan) dengan login diperiksa di server. Beranda menampilkan banner aktif dari database. Banner bisa dinonaktifkan dan banner nonaktif tidak tampil.

**Hasil:**
Membuat halaman kelola banner di `app/admin/banner/page.jsx`, Server Actions (`simpanBannerAction`, `toggleBannerAction`, `hapusBannerAction`) di `app/admin/actions.js`, serta komponen `components/BannerPromo.jsx`. Banner promo dapat diatur judul, teks deskripsi, tautan tujuan, dan status aktif/nonaktifnya. Di halaman beranda `app/page.jsx`, banner yang aktif diambil secara server-side melalui `getBannerAktif()` di `lib/banner.js` dan ditampilkan di bawah judul utama toko. Banner nonaktif otomatis disembunyikan.

**Perbaikan:**
Menambahkan navigasi "Banner Promo" pada `NavAdmin.jsx` serta validasi hak akses admin di server sebelum menyimpan, mengaktifkan/menonaktifkan, atau menghapus banner.

## US-43 Pengaturan toko dari admin

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-43.

Buat halaman admin pengaturan toko untuk mengubah nama toko, nomor WhatsApp, jam buka, dan alamat, tersimpan di database. Tombol pesan WhatsApp memakai nomor dari pengaturan ini, dengan lib/toko.js sebagai cadangan. Halaman publik (header, footer, tentang) memakai nama dan jam buka dari database. Validasi nomor WhatsApp, dan aksi memeriksa login admin di server.

**Hasil:**
Membuat halaman `app/admin/pengaturan/page.jsx` dan helper `lib/pengaturan-toko.js` untuk mengelola data identitas toko (nama toko, slogan/tagline, nomor WhatsApp, jam buka operasional, dan alamat). Pengaturan tersimpan secara dinamis dan dipakai di seluruh halaman publik: `Header.jsx`, `Footer.jsx`, `app/page.jsx`, `app/tentang/page.jsx`, `app/keranjang/page.jsx`, dan tombol pemesanan WhatsApp di `TombolWhatsApp.jsx`. Dibuat pula endpoint `app/api/toko/route.js` untuk melayani data toko secara reaktif ke komponen klien. Jika data database belum ada, sistem otomatis menggunakan `lib/toko.js` sebagai fallback cadangan.

**Perbaikan:**
Menambahkan validasi format nomor WhatsApp minimal 9 digit angka dan pembersihan karakter non-digit agar tautan `https://wa.me/` selalu valid.

## US-44 Kelola akun admin

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-44.

Buat fitur kelola akun admin: admin bisa menambah admin baru lewat Supabase Auth, daftar admin tampil di halaman admin, dan admin bisa menonaktifkan atau menghapus admin lain tetapi tidak akunnya sendiri. Semua aksi diperiksa di server.

**Hasil:**
Membuat halaman `app/admin/pengguna/page.jsx` dan helper `lib/kelola-admin.js` yang terhubung dengan Supabase Auth Admin API (`admin.listUsers()`, `admin.createUser()`, `admin.deleteUser()`). Admin yang sedang login dapat mendaftarkan admin baru dengan email dan password (minimal 8 karakter), melihat daftar admin aktif beserta waktu terdaftar, dan menghapus admin lain. Sistem memblokir dan menyembunyikan opsi penghapusan akun milik admin yang sedang login untuk mencegah admin mengunci dirinya sendiri di luar sistem.

**Perbaikan:**
Melindungi fungsi penghapusan admin ganda di level Server Action (`hapusAdminAction`) dan modul internal dengan membandingkan ID admin target dengan ID admin yang sedang login.

## US-45 Log aktivitas admin

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-45.

Catat log setiap tambah, ubah, dan hapus produk: siapa, aksi, dan kapan. Buat halaman admin yang menampilkan 50 log terakhir. Tanpa login log tidak bisa diakses.

**Hasil:**
Membuat modul pencatatan `lib/log-aktivitas.js` dan halaman `app/admin/log/page.jsx`. Setiap aksi admin saat menambah produk (`tambahProduk`), memperbarui produk (`ubahProduk`), menghapus produk (`hapusProduk`), membuat banner, hingga menyimpan pengaturan toko otomatis dicatat ke riwayat log (mencatat email admin, jenis aksi, detail perubahan, dan stempel waktu). Halaman `/admin/log` menampilkan 50 riwayat aktivitas terakhir dalam tabel rapi lengkap dengan lencana jenis aksi berwarna, dan diproteksi oleh middleware `proxy.js` sehingga tidak dapat diakses tanpa login.

**Perbaikan:**
Mengintegrasikan pencatatan log di seluruh Server Action penting dengan fallback penyimpanan lokal `lib/log-data.json` agar riwayat tetap tersimpan aman dan tidak gagal jika tabel database belum dibuat.

## US-46 Impor produk dari CSV

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-46.

Buat form unggah CSV di admin dengan login diperiksa di server. Setiap baris divalidasi (kolom wajib, harga angka); baris yang salah dilaporkan beserta nomor barisnya. Baris valid disimpan sekaligus ke database. Tampilkan ringkasan hasil (berhasil dan gagal).

**Hasil:**
Membuat halaman `app/admin/impor/page.jsx`, modul parser `lib/impor-csv.js`, dan Server Action `imporProdukCsvAction` di `app/admin/actions.js`. Form unggah menerima file CSV yang divalidasi per baris (memastikan kolom `nama` terisi dan `harga` berupa angka positif > 0). Baris yang salah dilaporkan nomor baris dan penyebab errornya, sementara baris valid disimpan sekaligus (batch insert) ke database Supabase dan dicatat dalam log aktivitas admin. Halaman menampilkan ringkasan visual jumlah baris berhasil vs gagal beserta detail baris bermasalah.

**Perbaikan:**
Mendukung format pemisah CSV ganda (koma `,` dan titik koma `;`) serta pembersihan otomatis simbol non-numerik pada harga.

## US-47 Atur urutan tampil produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-47.

Tambahkan kolom urutan di produk. Admin bisa menaikkan dan menurunkan urutan produk, dan katalog publik mengikuti urutan tersebut. Aksi memeriksa login admin di server.

**Hasil:**
Membuat modul `lib/urutan.js` dan Server Action `geserUrutanAction` di `app/admin/actions.js`. Di tabel produk admin (`components/TabelProduk.jsx`), ditambahkan tombol geser naik (▲) dan turun (▼) untuk mengatur posisi relatif antar-produk. Urutan kustom disimpan ke database dan diselaraskan pada katalog publik (`app/page.jsx` dan `app/kategori/[slug]/page.jsx`) sehingga produk prioritas/unggulan tampil paling awal secara konsisten saat mode urutan bawaan aktif.

**Perbaikan:**
Menerapkan mekanisme dual-storage urutan dengan cache lokal `lib/urutan-data.json` agar urutan kustom tetap berjalan mulus meskipun kolom urutan belum dibuat di database remote Supabase.

## US-48 Varian harga per ukuran

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-48.

Buat tabel varian di database (produk, nama varian, harga). Admin bisa mengelola varian per produk. Halaman detail menampilkan pilihan varian dan harga berubah sesuai pilihan. Pesan WhatsApp memuat varian dan harga yang dipilih.

**Hasil:**
Membuat modul `lib/varian.js`, tabel varian di database/lokal, dan Server Actions `tambahVarianAction` serta `hapusVarianAction`. Di halaman edit produk (`/admin/produk/[id]/ubah`), admin dapat menambah dan menghapus varian ukuran beserta harganya. Pada halaman detail produk (`app/produk/[id]/page.jsx`), komponen `TombolWhatsApp.jsx` menampilkan tombol pilihan varian ukuran; ketika salah satu varian dipilih, harga produk yang tampil di layar otomatis diperbarui dan teks pesan pesanan WhatsApp memuat rincian nama varian beserta harganya secara spesifik.

**Perbaikan:**
Menyinkronkan penambahan varian ukuran ke dalam item keranjang belanja (`PenyediaAplikasi`) agar subtotal dan rincian pesanan tetap akurat sesuai varian yang dipilih.

## US-49 Halaman per kategori

**Prompt:**

Baca docs/user-stories.md bagian US-49.

Buat halaman /kategori/[slug] yang menampilkan produk kategori itu dari database. Kategori yang tidak ada menampilkan "tidak ditemukan". Nama kategori di kartu atau halaman detail tertaut ke halaman tersebut.

**Hasil:**
Membuat halaman dinamis `app/kategori/[slug]/page.jsx` dan modul `lib/kategori-slug.js` untuk mengonversi nama kategori menjadi slug SEO-friendly. Halaman menampilkan seluruh produk aktif dalam kategori tersebut dari database secara server-side. Jika slug tidak ditemukan, ditampilkan status "Kategori tidak ditemukan" dengan tautan kembali ke beranda katalog. Nama kategori pada `KartuProduk.jsx` dan di halaman detail produk `app/produk/[id]/page.jsx` dijadikan tautan aktif menuju halaman kategori terkait.

**Perbaikan:**
Menangani decoding URI karakter khusus seperti tanda ampersand (`&` -> `dan`) pada URL slug, serta merefaktor `KartuProduk.jsx` menjadi elemen `<article>` dengan tautan `<Link>` mandiri tanpa event handler `onClick` agar sepenuhnya valid dan kompatibel sebagai Server Component di Next.js App Router.

## US-50 Asisten AI tanya jawab produk

**Prompt:**

Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-50.

Tambahkan kotak tanya di halaman detail produk. Jawaban dari LLM dipanggil dari server, kunci tidak ada di browser, dan jawabannya hanya berdasarkan data produk. Batasi panjang pertanyaan, dan tangani error atau timeout dengan pesan yang jelas. Tambahkan pembatasan kiriman dasar agar tidak disalahgunakan.

**Hasil:**
Membuat Route Handler `app/api/tanya-produk/route.js` dan komponen klien `components/TanyaProdukAI.jsx`. Pengunjung dapat mengajukan pertanyaan tentang produk langsung di halaman detail produk. Jawaban diproses di server menggunakan Google Gemini API (tanpa membocorkan API key ke browser) dengan instruksi sistem ketat agar hanya menjawab sesuai data faktual produk (nama, harga, kategori, deskripsi, dan varian). Dilengkapi tombol rekomendasi pertanyaan cepat, batas panjang pertanyaan (maksimal 200 karakter), penanganan timeout koneksi (10 detik), dan pembatasan frekuensi pengiriman (rate limiting) maksimal 5 pertanyaan per menit per IP untuk mencegah penyalahgunaan.

**Perbaikan:**
Menambahkan fallback multibahasa dan multi-model Gemini (`gemini-flash-latest`, `gemini-3.8-flash`, `gemini-2.5-flash`, `gemini-1.5-flash`) serta penanganan error yang sopan mengarahkan pembeli ke WhatsApp jika API tidak tersedia.
