import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { getAdmin, unauthorized } from "@/lib/auth";
import { kabari } from "@/lib/broadcast";
import { jawabPertanyaan } from "@/lib/ai";

export const maxDuration = 300;

/** Buat ulang / coba lagi jawaban AI. */
export async function POST(_req: Request, ctx: RouteContext<"/api/admin/pertanyaan/[id]/ai">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const { data: q } = await db().from("pertanyaan").select("id, status_ai, pilihan_word, sesi:sesi_id(kode)").eq("id", id).maybeSingle();
  if (!q) return Response.json({ galat: "Pertanyaan tidak ditemukan." }, { status: 404 });
  if (q.status_ai === "memproses") return Response.json({ galat: "AI masih menjawab pertanyaan ini." }, { status: 409 });

  await db().from("pertanyaan").update({
    status_ai: "menunggu", jawaban_ai: null, ai_percobaan: 0, ai_galat: null,
    pilihan_word: q.pilihan_word === "ai" ? null : q.pilihan_word,
  }).eq("id", id);
  const kode = (q.sesi as unknown as { kode: string }).kode;
  after(async () => {
    await kabari(kode);
    await jawabPertanyaan(id);
  });
  return Response.json({ ok: true });
}
