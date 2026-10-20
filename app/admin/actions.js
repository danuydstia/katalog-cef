"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";

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
 * Server Action untuk menambah produk baru ke database.
 */
export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    redirect(
      "/admin/produk/baru?error=" + encodeURIComponent("Formulir tidak valid.")
    );
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/kopi.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      "/admin/produk/baru?error=" + encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  if (!hargaRaw) {
    redirect(
      "/admin/produk/baru?error=" + encodeURIComponent("Harga produk wajib diisi.")
    );
  }

  const harga = Number(hargaRaw);
  if (isNaN(harga) || harga < 0 || !Number.isInteger(harga)) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent("Harga harus berupa angka bulat positif.")
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

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (insertError) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent(
          insertError.message || "Gagal menyimpan produk baru."
        )
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");

  redirect(
    "/admin?sukses=" + encodeURIComponent("Produk berhasil ditambahkan.")
  );
}

/**
 * Server Action untuk memperbarui produk di database.
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
    redirect(
      "/admin?error=" + encodeURIComponent("ID produk tidak valid.")
    );
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/kopi.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  if (!hargaRaw) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Harga produk wajib diisi.")
    );
  }

  const harga = Number(hargaRaw);
  if (isNaN(harga) || harga < 0 || !Number.isInteger(harga)) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Harga harus berupa angka bulat positif.")
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
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent(
          updateError.message || "Gagal memperbarui data produk."
        )
    );
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

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return {
      error:
        "Kunci GEMINI_API_KEY belum diatur di environment variable (.env.local).",
    };
  }

  try {
    const promptTeks = `Buatkan deskripsi produk yang menarik, singkat, menggugah minat pembeli, dan bernada ramah (1-2 kalimat) untuk produk UMKM dengan nama "${nama.trim()}"${kategori ? ` dalam kategori "${kategori.trim()}"` : ""}. Tuliskan langsung teks deskripsinya saja tanpa tanda kutip dan tanpa pembukaan.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptTeks }] }],
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        error: `Gemini API error: ${errData?.error?.message || res.statusText}`,
      };
    }

    const data = await res.json();
    const hasilDeskripsi =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!hasilDeskripsi) {
      return { error: "AI tidak menghasilkan respons. Silakan coba lagi." };
    }

    return { deskripsi: hasilDeskripsi };
  } catch (err) {
    return {
      error: err?.message || "Gagal menghubungi layanan Gemini API.",
    };
  }
}
