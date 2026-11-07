import { cekAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Dipakai halaman login untuk tahu kenapa seseorang tidak bisa masuk. Tidak membocorkan isi ADMIN_EMAIL. */
export async function GET() {
  return Response.json(await cekAdmin(), { headers: { "Cache-Control": "no-store" } });
}
