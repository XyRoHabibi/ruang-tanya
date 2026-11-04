import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { sesiByKode } from "@/lib/data";
import { isDevice } from "@/lib/validate";
import { kabari } from "@/lib/broadcast";

/** Mendukung / membatalkan dukungan ("Aku juga penasaran"). */
export async function POST(req: Request, ctx: RouteContext<"/api/s/[kode]/dukung/[id]">) {
  const { kode, id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  if (!isDevice(b.perangkat)) return Response.json({ galat: "Perangkat tidak dikenali." }, { status: 400 });
  const s = await sesiByKode(kode);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });

  const { data: q } = await db().from("pertanyaan").select("id,perangkat,ditarik,disembunyikan")
    .eq("id", id).eq("sesi_id", s.id).maybeSingle();
  if (!q || q.ditarik || q.disembunyikan) return Response.json({ galat: "Pertanyaan tidak ditemukan." }, { status: 404 });
  if (q.perangkat === b.perangkat) return Response.json({ galat: "Tidak bisa mendukung pertanyaan sendiri." }, { status: 400 });

  const { data: ada } = await db().from("dukungan").select("pertanyaan_id").eq("pertanyaan_id", id).eq("perangkat", b.perangkat).maybeSingle();
  if (ada) await db().from("dukungan").delete().eq("pertanyaan_id", id).eq("perangkat", b.perangkat);
  else await db().from("dukungan").insert({ pertanyaan_id: id, perangkat: b.perangkat });

  const { data: baru } = await db().from("pertanyaan").select("jumlah_dukungan").eq("id", id).single();
  after(() => kabari(s.kode));
  return Response.json({ ok: true, didukung: !ada, dukungan: baru?.jumlah_dukungan ?? 0 });
}
