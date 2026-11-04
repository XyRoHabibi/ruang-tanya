import { sesiByKode, statePublik } from "@/lib/data";
import { isDevice } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: RouteContext<"/api/s/[kode]">) {
  const { kode } = await ctx.params;
  const s = await sesiByKode(kode);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });
  const d = new URL(req.url).searchParams.get("d");
  return Response.json(await statePublik(s, isDevice(d) ? d : null), { headers: { "Cache-Control": "no-store" } });
}
