import { createServerClient } from "@/lib/supabase/server";

/**
 * Mengambil daftar akun admin lewat Supabase Auth Admin API (US-44).
 */
export async function listSemuaAdmin() {
  const adminClient = createServerClient();
  try {
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      return [];
    }
    return (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      banned: Boolean(u.banned_until && new Date(u.banned_until) > new Date()),
    }));
  } catch {
    return [];
  }
}

/**
 * Tambah admin baru lewat Supabase Auth (US-44).
 */
export async function tambahAdminBaruInternal({ email, password }) {
  const cleanEmail = email.trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Email tidak valid.");
  }
  if (!password || password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const adminClient = createServerClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: cleanEmail,
    password: password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message || "Gagal membuat akun admin baru.");
  }

  return data.user;
}

/**
 * Hapus akun admin lain (tidak boleh akunnya sendiri - US-44).
 */
export async function hapusAdminInternal(targetUserId, currentUserId) {
  if (String(targetUserId) === String(currentUserId)) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  const adminClient = createServerClient();
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

  if (error) {
    throw new Error(error.message || "Gagal menghapus akun admin.");
  }

  return true;
}

