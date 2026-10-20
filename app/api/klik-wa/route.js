import { catatKlikWhatsAppInternal } from "@/lib/klik-wa";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const produkId = body?.produkId;

    if (produkId) {
      await catatKlikWhatsAppInternal(produkId);
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const produkId = searchParams.get("produkId");

    if (produkId) {
      await catatKlikWhatsAppInternal(produkId);
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

