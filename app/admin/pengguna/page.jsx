import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";
import { listSemuaAdmin } from "@/lib/kelola-admin";
import { tambahAdminAction, hapusAdminAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanAdminPengguna({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const pesanError = params?.error;

  const sessionClient = await createSessionClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const dataAdmins = await listSemuaAdmin();
  let listAdmin = [...dataAdmins];

  // Pastikan admin yang sedang aktif selalu terdaftar di list tampilan
  if (currentUser && !listAdmin.some((u) => u.id === currentUser.id)) {
    listAdmin.unshift({
      id: currentUser.id,
      email: currentUser.email,
      created_at: currentUser.created_at,
    });
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Kelola Akun Admin</h1>
        <p className="text-sm text-teks-lembut">
          Tambah rekan pengelola toko atau hapus hak akses admin lain.
        </p>
      </div>

      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-utama">{pesanSukses}</p>
        </div>
      )}

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-bahaya">{pesanError}</p>
        </div>
      )}

      {/* Form Tambah Admin Baru */}
      <div className="max-w-xl rounded-2xl border border-garis bg-permukaan p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-teks">Tambah Admin Baru</h2>
        <form action={tambahAdminAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="input-email" className="text-xs font-bold uppercase tracking-wider text-teks">
              Email Admin Baru
            </label>
            <input
              id="input-email"
              type="email"
              name="email"
              required
              placeholder="admin2@tokocontoh.com"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="input-password" className="text-xs font-bold uppercase tracking-wider text-teks">
              Password Baru (Min. 8 Karakter)
            </label>
            <input
              id="input-password"
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <Tombol type="submit" className="self-start mt-2">
            Tambah Admin
          </Tombol>
        </form>
      </div>

      {/* Tabel Daftar Admin */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-teks">Daftar Admin Aktif ({listAdmin.length})</h2>

        <div className="overflow-x-auto rounded-2xl border border-garis bg-permukaan">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-garis bg-latar text-xs uppercase text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status / Peran</th>
                <th className="px-4 py-3 font-semibold">Terdaftar</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {listAdmin.map((admin) => {
                const isCurrent = currentUser?.id === admin.id;

                return (
                  <tr key={admin.id} className="hover:bg-latar/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-teks">
                      <div className="flex items-center gap-2">
                        <span>{admin.email}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-utama/10 px-2 py-0.5 text-[11px] font-bold text-utama">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-teks-lembut">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Admin Aktif
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-teks-lembut">
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCurrent ? (
                        <span className="text-xs text-teks-lembut italic">
                          Akun Sendiri
                        </span>
                      ) : (
                        <form action={hapusAdminAction} className="inline-block">
                          <input type="hidden" name="id" value={admin.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-2.5 py-1 text-xs font-semibold text-bahaya hover:bg-bahaya hover:text-white transition-colors"
                          >
                            Hapus
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

