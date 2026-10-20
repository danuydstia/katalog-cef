"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";
import {
  tambahKategoriInternal,
  ubahKategoriInternal,
  hapusKategoriInternal,
} from "@/lib/kategori";

/**
 * Server Action untuk memproses login admin.
 */
export async function login(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    redirect(
      "/admin/login?error=" + encodeURIComponent("Formulir tidak valid.")
    );
  }

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect(
      "/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi.")
    );
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const pesan = "Email atau password salah. Silakan coba lagi.";
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (keluar).
 */
export async function keluar() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 */
export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    redirect(
      "/admin/password?error=" + encodeURIComponent("Formulir tidak valid.")
    );
  }

  const passwordBaru = formData.get("password_baru")?.toString() || "";
  const konfirmasiPassword =
    formData.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru dan konfirmasi password wajib diisi.")
    );
  }

  if (passwordBaru.length < 8) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru minimal 8 karakter.")
    );
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru dan konfirmasi password harus sama.")
    );
  }

  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Sesi telah berakhir. Silakan login kembali.")
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent(
          error.message || "Gagal mengganti password. Silakan coba lagi."
        )
    );
  }

  redirect(
    "/admin/password?sukses=" +
      encodeURIComponent("Password berhasil diperbarui.")
  );
}

/**
 * Helper Server-side untuk mengunggah foto ke Supabase Storage (US-29).
 */
async function prosesUploadFoto(fotoFile, errorRedirectPath) {
  if (!fotoFile || typeof fotoFile.size !== "number" || fotoFile.size === 0) {
    return null;
  }

  // 1. Validasi tipe file (gambar)
  if (!fotoFile.type || !fotoFile.type.startsWith("image/")) {
    redirect(
      `${errorRedirectPath}${errorRedirectPath.includes("?") ? "&" : "?"}error=` +
        encodeURIComponent("File yang diunggah harus berupa gambar (JPG, PNG, WebP).")
    );
  }

  // 2. Validasi ukuran maksimal (2 MB)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (fotoFile.size > MAX_SIZE) {
    redirect(
      `${errorRedirectPath}${errorRedirectPath.includes("?") ? "&" : "?"}error=` +
        encodeURIComponent("Ukuran file foto maksimal 2 MB.")
    );
  }

  try {
    const adminClient = createServerClient();
    const BUCKET = "produk";

    // Pastikan bucket ada dan bersifat publik
    const { data: buckets } = await adminClient.storage.listBuckets();
    const bucketAda = buckets?.some((b) => b.name === BUCKET);
    if (!bucketAda) {
      await adminClient.storage.createBucket(BUCKET, { public: true });
    }

    const ext = fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const namaFile = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await fotoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(namaFile, buffer, {
        contentType: fotoFile.type,
        upsert: true,
      });

    if (uploadError) {
      redirect(
        `${errorRedirectPath}${errorRedirectPath.includes("?") ? "&" : "?"}error=` +
          encodeURIComponent(`Gagal mengunggah foto ke storage: ${uploadError.message}`)
      );
    }

    const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(namaFile);
    return urlData.publicUrl;
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    redirect(
      `${errorRedirectPath}${errorRedirectPath.includes("?") ? "&" : "?"}error=` +
        encodeURIComponent(`Terjadi kesalahan saat upload foto: ${err?.message || "Storage error"}`)
    );
  }
}

/**
 * Server Action untuk menambah produk baru ke database.
 * Mendukung validasi server per-field dan mempertahankan nilai input (US-34).
 */
export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return {
      errors: { general: "Formulir tidak valid." },
      values: {},
    };
  }

  const nama = formData.get("nama")?.toString().trim() || "";
  const hargaRaw = formData.get("harga")?.toString().trim() || "";
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const fotoFile = formData.get("foto_file");
  let foto_url = formData.get("foto_url")?.toString().trim() || "";

  // US-34: Validasi server per field
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }

  if (!hargaRaw) {
    errors.harga = "Harga produk wajib diisi.";
  } else {
    const hargaNum = Number(hargaRaw);
    if (isNaN(hargaNum) || hargaNum < 0 || !Number.isInteger(hargaNum)) {
      errors.harga = "Harga harus berupa angka bulat positif.";
    }
  }

  // Jika ada error validasi, kembalikan pesan per-field dan pertahankan nilai input
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        nama,
        harga: hargaRaw,
        kategori,
        foto_url,
        deskripsi,
      },
    };
  }

  const harga = Number(hargaRaw);
  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Sesi telah berakhir. Silakan login kembali.")
    );
  }

  // Proses upload foto jika admin memilih file dari perangkat (US-29)
  if (fotoFile && typeof fotoFile.size === "number" && fotoFile.size > 0) {
    const uploadedUrl = await prosesUploadFoto(fotoFile, "/admin/produk/baru");
    if (uploadedUrl) {
      foto_url = uploadedUrl;
    }
  }

  if (!foto_url) {
    foto_url = "/produk/kopi.svg";
  }

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (insertError) {
    return {
      errors: { general: insertError.message || "Gagal menyimpan produk baru." },
      values: { nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  redirect(
    "/admin?sukses=" + encodeURIComponent("Produk berhasil ditambahkan.")
  );
}

/**
 * Server Action untuk memperbarui produk di database.
 * Mendukung validasi server per-field dan mempertahankan nilai input (US-34).
 */
export async function ubahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  const id = formData?.get("id")?.toString();

  if (!formData || !id) {
    return {
      errors: { general: "ID produk tidak valid." },
      values: {},
    };
  }

  const nama = formData.get("nama")?.toString().trim() || "";
  const hargaRaw = formData.get("harga")?.toString().trim() || "";
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const fotoFile = formData.get("foto_file");
  let foto_url = formData.get("foto_url")?.toString().trim() || "";

  // US-34: Validasi server per field
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }

  if (!hargaRaw) {
    errors.harga = "Harga produk wajib diisi.";
  } else {
    const hargaNum = Number(hargaRaw);
    if (isNaN(hargaNum) || hargaNum < 0 || !Number.isInteger(hargaNum)) {
      errors.harga = "Harga harus berupa angka bulat positif.";
    }
  }

  // Jika ada error validasi, kembalikan pesan per-field dan pertahankan nilai input
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        id,
        nama,
        harga: hargaRaw,
        kategori,
        foto_url,
        deskripsi,
      },
    };
  }

  const harga = Number(hargaRaw);
  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Sesi telah berakhir. Silakan login kembali.")
    );
  }

  // Proses upload foto jika admin memilih file dari perangkat (US-29)
  if (fotoFile && typeof fotoFile.size === "number" && fotoFile.size > 0) {
    const uploadedUrl = await prosesUploadFoto(fotoFile, `/admin/produk/${id}/ubah`);
    if (uploadedUrl) {
      foto_url = uploadedUrl;
    }
  }

  if (!foto_url) {
    foto_url = "/produk/kopi.svg";
  }

  const { error: updateError } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (updateError) {
    return {
      errors: { general: updateError.message || "Gagal memperbarui data produk." },
      values: { id, nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
  }

  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/admin");

  redirect(
    "/admin?sukses=" + encodeURIComponent("Produk berhasil diperbarui.")
  );
}

/**
 * Server Action untuk menghapus produk dari database.
 */
export async function hapusProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  const id = formData?.get("id")?.toString();

  if (!id) {
    redirect(
      "/admin?error=" + encodeURIComponent("ID produk tidak valid.")
    );
  }

  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Sesi telah berakhir. Silakan login kembali.")
    );
  }

  const { error: deleteError } = await supabase
    .from("produk")
    .delete()
    .eq("id", id);

  if (deleteError) {
    redirect(
      "/admin?error=" +
        encodeURIComponent(
          deleteError.message || "Gagal menghapus produk."
        )
    );
  }

  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/admin");

  redirect(
    "/admin?sukses=" + encodeURIComponent("Produk berhasil dihapus.")
  );
}

/**
 * Server Action untuk mengaktifkan / menonaktifkan produk (US-32).
 */
export async function toggleStatusProduk(formData) {
  const id = formData?.get("id")?.toString();

  if (!id) {
    redirect("/admin?error=" + encodeURIComponent("ID produk tidak valid."));
  }

  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Sesi telah berakhir. Silakan login kembali.")
    );
  }

  // Ambil data produk saat ini
  const { data: produk, error: fetchError } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !produk) {
    redirect("/admin?error=" + encodeURIComponent("Produk tidak ditemukan."));
  }

  const isCurrentlyNonaktif =
    produk.aktif === false ||
    (typeof produk.deskripsi === "string" && /\[nonaktif\]/i.test(produk.deskripsi));

  const newStatus = isCurrentlyNonaktif ? true : false;

  // 1. Coba update kolom aktif jika kolom tersebut ada di database
  try {
    await supabase.from("produk").update({ aktif: newStatus }).eq("id", id);
  } catch {}

  // 2. Sinkronkan tag [nonaktif] di deskripsi agar bekerja di skema database apapun
  let updatedDeskripsi = produk.deskripsi || "";
  if (!newStatus) {
    // Nonaktifkan
    if (!/\[nonaktif\]/i.test(updatedDeskripsi)) {
      updatedDeskripsi = `${updatedDeskripsi} [nonaktif]`.trim();
    }
  } else {
    // Aktifkan kembali
    updatedDeskripsi = updatedDeskripsi.replace(/\[nonaktif\]/gi, "").trim();
  }

  await supabase
    .from("produk")
    .update({ deskripsi: updatedDeskripsi })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);

  redirect(
    "/admin?sukses=" +
      encodeURIComponent(
        `Produk "${produk.nama}" berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}.`
      )
  );
}

/**
 * Server Action: Tambah Kategori (US-31).
 */
export async function tambahKategori(formData) {
  const nama = formData?.get("nama")?.toString().trim();

  if (!nama) {
    redirect("/admin/kategori?error=" + encodeURIComponent("Nama kategori wajib diisi."));
  }

  const supabase = await createSessionClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Sesi telah berakhir. Silakan login kembali."));
  }

  try {
    await tambahKategoriInternal(nama);
    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/");
    redirect("/admin/kategori?sukses=" + encodeURIComponent(`Kategori "${nama}" berhasil ditambahkan.`));
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/admin/kategori?error=" + encodeURIComponent(err.message || "Gagal menambah kategori."));
  }
}

/**
 * Server Action: Ubah Nama Kategori (US-31).
 */
export async function ubahKategori(formData) {
  const namaLama = formData?.get("namaLama")?.toString().trim();
  const namaBaru = formData?.get("namaBaru")?.toString().trim();

  if (!namaLama || !namaBaru) {
    redirect("/admin/kategori?error=" + encodeURIComponent("Nama kategori tidak boleh kosong."));
  }

  const supabase = await createSessionClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Sesi telah berakhir. Silakan login kembali."));
  }

  try {
    await ubahKategoriInternal(namaLama, namaBaru);
    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/");
    redirect("/admin/kategori?sukses=" + encodeURIComponent(`Kategori "${namaLama}" berhasil diubah menjadi "${namaBaru}".`));
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/admin/kategori?error=" + encodeURIComponent(err.message || "Gagal mengubah kategori."));
  }
}

/**
 * Server Action: Hapus Kategori (US-31).
 */
export async function hapusKategori(formData) {
  const nama = formData?.get("nama")?.toString().trim();

  if (!nama) {
    redirect("/admin/kategori?error=" + encodeURIComponent("Nama kategori tidak valid."));
  }

  const supabase = await createSessionClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Sesi telah berakhir. Silakan login kembali."));
  }

  try {
    await hapusKategoriInternal(nama);
    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/");
    redirect("/admin/kategori?sukses=" + encodeURIComponent(`Kategori "${nama}" berhasil dihapus.`));
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/admin/kategori?error=" + encodeURIComponent(err.message || "Gagal menghapus kategori."));
  }
}

/**
 * Server Action untuk membuat deskripsi produk otomatis memakai Gemini API (US-14).
 */
export async function buatDeskripsiAI(nama, kategori) {
  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk harus diisi terlebih dahulu untuk membuat deskripsi AI." };
  }

  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    return {
      error:
        "Kunci GEMINI_API_KEY belum terdeteksi. Jika baru menambahkannya ke .env.local, silakan restart server 'npm run dev'.",
    };
  }

  try {
    const promptTeks = `Buatkan deskripsi produk yang menarik, singkat, menggugah minat pembeli, dan bernada ramah (1-2 kalimat) untuk produk UMKM dengan nama "${nama.trim()}"${kategori ? ` dalam kategori "${kategori.trim()}"` : ""}. Tuliskan langsung teks deskripsinya saja tanpa tanda kutip dan tanpa pembukaan.`;

    const modelNames = [
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
    ];

    let lastError = null;
    let hasilDeskripsi = null;

    for (const model of modelNames) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptTeks }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          hasilDeskripsi =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (hasilDeskripsi) break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData?.error?.message || res.statusText;
          const reason = errData?.error?.details?.[0]?.reason;

          if (reason === "API_KEY_INVALID" || lastError.toLowerCase().includes("api key not valid")) {
            return {
              error: "API key Gemini ditolak oleh Google (API_KEY_INVALID). Pastikan Anda membuat API key dari Google AI Studio (https://aistudio.google.com/app/apikey).",
            };
          }

          if (res.status === 404 || lastError?.includes("not found") || lastError?.includes("no longer available")) {
            continue;
          } else {
            break;
          }
        }
      } catch (e) {
        lastError = e?.message;
      }
    }

    if (!hasilDeskripsi) {
      return { error: lastError || "AI tidak menghasilkan respons. Silakan coba lagi." };
    }

    return { deskripsi: hasilDeskripsi };
  } catch (err) {
    return {
      error: err?.message || "Gagal menghubungi layanan Gemini API.",
    };
  }
}
