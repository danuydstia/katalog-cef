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
