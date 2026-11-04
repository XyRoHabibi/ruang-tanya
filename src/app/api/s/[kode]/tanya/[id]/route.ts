import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { sesiByKode } from "@/lib/data";
import { isDevice, validasiPenanya } from "@/lib/validate";
import { kabari } from "@/lib/broadcast";
import { jawabPertanyaan } from "@/lib/ai";
import type { Pertanyaan, Sesi } from "@/lib/types";

export const maxDuration = 300;

type Hasil = { ok: true; s: Sesi; q: Pertanyaan } | { ok: false; res: Response };

async function milikku(kode: string, id: string, perangkat: unknown): Promise<Hasil> {
  const s = await sesiByKode(kode);
  if (!s) return { ok: false, res: Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 }) };
  if (!isDevice(perangkat)) return { ok: false, res: Response.json({ galat: "Perangkat tidak dikenali." }, { status: 400 }) };
  const { data } = await db().from("pertanyaan").select("*").eq("id", id).eq("sesi_id", s.id).maybeSingle();
  const q = data as Pertanyaan | null;
  if (!q || q.perangkat !== perangkat || q.ditarik) {
    return { ok: false, res: Response.json({ galat: "Pertanyaan ini tidak bisa diubah dari perangkat ini." }, { status: 403 }) };
  }
  const kunci = s.sorotan_id === q.id ? "sedang dibahas" : q.sudah_dijawab ? "sudah dijawab" : s.status !== "dibuka" ? "sesi ditutup" : q.disembunyikan ? "disembunyikan admin" : null;
  if (kunci) return { ok: false, res: Response.json({ galat: `Terkunci: ${kunci}. Minta tolong kelompok penyaji untuk mengubahnya.` }, { status: 409 }) };
  return { ok: true, s, q };
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/s/[kode]/tanya/[id]">) {
  const { kode, id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const m = await milikku(kode, id, b.perangkat);
  if (!m.ok) return m.res;
  const v = validasiPenanya(b);
  if (!v.ok) return Response.json({ galat: v.galat }, { status: 400 });

  const berubah = v.data.pertanyaan !== m.q.pertanyaan;
  const patch: Partial<Pertanyaan> = { ...v.data };
  if (berubah) {
    Object.assign(patch, {
      diedit: true,
      perlu_dicek: !!m.q.jawaban_admin?.trim() || m.q.perlu_dicek,
      jawaban_ai: null, status_ai: "menunggu", ai_percobaan: 0, ai_galat: null,
    });
  }
  const { error } = await db().from("pertanyaan").update(patch).eq("id", id);
  if (error) return Response.json({ galat: "Gagal menyimpan perubahan." }, { status: 500 });

  after(async () => {
    await kabari(m.s.kode);
    if (berubah) await jawabPertanyaan(id);
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/s/[kode]/tanya/[id]">) {
  const { kode, id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const m = await milikku(kode, id, b.perangkat);
  if (!m.ok) return m.res;
  await db().from("pertanyaan").update({ ditarik: true }).eq("id", id);
  after(() => kabari(m.s.kode));
  return Response.json({ ok: true });
}
