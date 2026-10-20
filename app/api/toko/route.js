import { NextResponse } from "next/server";
import { getPengaturanToko } from "@/lib/pengaturan-toko";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const toko = await getPengaturanToko();
    return NextResponse.json(toko);
  } catch {
    return NextResponse.json({ error: "Gagal memuat info toko" }, { status: 500 });
  }
}

