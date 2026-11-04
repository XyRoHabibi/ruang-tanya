import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { getAdmin, unauthorized } from "@/lib/auth";
import { kabari } from "@/lib/broadcast";
import { jawabPertanyaan } from "@/lib/ai";
import { clean, validasiPenanya } from "@/lib/validate";
import type { Pertanyaan } from "@/lib/types";

export const maxDuration = 300;

async function ambil(id: string) {
  const { data } = await db().from("pertanyaan").select("*, sesi:sesi_id(kode)").eq("id", id).maybeSingle();
  return data as (Pertanyaan & { sesi: { kode: string } }) | null;
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/pertanyaan/[id]">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const q = await ambil(id);
  if (!q) return Response.json({ galat: "Pertanyaan tidak ditemukan." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const patch: Partial<Pertanyaan> = {};

  if (typeof b.jawaban_admin === "string") { patch.jawaban_admin = clean(b.jawaban_admin, 5000) || null; patch.perlu_dicek = false; }
  if (b.pilihan_word === null || ["ai", "penanya", "admin"].includes(b.pilihan_word)) patch.pilihan_word = b.pilihan_word;
  for (const k of ["sudah_dijawab", "disembunyikan", "ditarik", "perlu_dicek"] as const) {
    if (typeof b[k] === "boolean") patch[k] = b[k];
  }

  let regen = false;
  if (b.data) {
    const v = validasiPenanya({ ...q, ...b.data });
    if (!v.ok) return Response.json({ galat: v.galat }, { status: 400 });
    Object.assign(patch, v.data);
    if (v.data.pertanyaan !== q.pertanyaan) {
      regen = true;
      Object.assign(patch, { jawaban_ai: null, status_ai: "menunggu", ai_percobaan: 0, ai_galat: null });
    }
  }

  const { error } = await db().from("pertanyaan").update(patch).eq("id", id);
  if (error) return Response.json({ galat: "Gagal menyimpan." }, { status: 500 });
  after(async () => {
    await kabari(q.sesi.kode);
    if (regen) await jawabPertanyaan(id);
  });
  return Response.json({ ok: true });
}
