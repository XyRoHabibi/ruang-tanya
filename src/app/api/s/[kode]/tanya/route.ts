import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { clientIp, sesiByKode } from "@/lib/data";
import { isDevice, validasiPenanya } from "@/lib/validate";
import { kabari } from "@/lib/broadcast";
import { jawabPertanyaan } from "@/lib/ai";

export const maxDuration = 300;

const MAKS_PER_PERANGKAT = 5;
const MAKS_PER_IP_10_MENIT = 25;

export async function POST(req: Request, ctx: RouteContext<"/api/s/[kode]/tanya">) {
  const { kode } = await ctx.params;
  const b = await req.json().catch(() => ({}));

  // Kolom jebakan bot: manusia tidak melihat kolom ini.
  if (typeof b.website === "string" && b.website.trim()) return Response.json({ ok: true, nomor: 0 });

  const s = await sesiByKode(kode);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });
  if (s.status !== "dibuka") {
    return Response.json({ galat: s.status === "draf" ? "Sesi belum dibuka." : "Sesi sudah ditutup." }, { status: 409 });
  }
  if (!isDevice(b.perangkat)) return Response.json({ galat: "Perangkat tidak dikenali. Muat ulang halaman." }, { status: 400 });
  const v = validasiPenanya(b);
  if (!v.ok) return Response.json({ galat: v.galat }, { status: 400 });

  const ip = clientIp(req);
  const sejak = new Date(Date.now() - 10 * 60_000).toISOString();
  const [{ count: perPerangkat }, { count: perIp }] = await Promise.all([
    db().from("pertanyaan").select("id", { count: "exact", head: true }).eq("sesi_id", s.id).eq("perangkat", b.perangkat),
    db().from("pertanyaan").select("id", { count: "exact", head: true }).eq("ip", ip).gte("dibuat_pada", sejak),
  ]);
  if ((perPerangkat ?? 0) >= MAKS_PER_PERANGKAT) {
    return Response.json({ galat: `Batas ${MAKS_PER_PERANGKAT} pertanyaan per orang di sesi ini sudah tercapai.` }, { status: 429 });
  }
  if ((perIp ?? 0) >= MAKS_PER_IP_10_MENIT) {
    return Response.json({ galat: "Terlalu banyak kiriman dari jaringan ini. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  const { data, error } = await db().from("pertanyaan")
    .insert({ ...v.data, sesi_id: s.id, perangkat: b.perangkat, ip })
    .select("id,nomor").single();
  if (error || !data) {
    console.error(error);
    return Response.json({ galat: "Gagal menyimpan. Coba kirim lagi." }, { status: 500 });
  }

  after(async () => {
    await kabari(s.kode, { baru: data.id });
    await jawabPertanyaan(data.id);
  });

  return Response.json({ ok: true, id: data.id, nomor: data.nomor, pertamaKali: (perPerangkat ?? 0) === 0 });
}
