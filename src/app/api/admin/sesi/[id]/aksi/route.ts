import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { getAdmin, unauthorized } from "@/lib/auth";
import { sesiById } from "@/lib/data";
import { kabari } from "@/lib/broadcast";
import { jawabPertanyaan } from "@/lib/ai";
import { validasiPenanya } from "@/lib/validate";

export const maxDuration = 300;

/**
 * Aksi panel/layar:
 *  - pakai-ai-semua : pilihan Word = AI untuk semua yang punya jawaban AI
 *  - berikutnya     : tandai sorotan sekarang sudah dijawab, sorot antrean teratas
 *  - tambah         : tambah pertanyaan manual
 */
export async function POST(req: Request, ctx: RouteContext<"/api/admin/sesi/[id]/aksi">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const s = await sesiById(id);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });
  const b = await req.json().catch(() => ({}));

  if (b.aksi === "pakai-ai-semua") {
    await db().from("pertanyaan").update({ pilihan_word: "ai" }).eq("sesi_id", id).not("jawaban_ai", "is", null);
  } else if (b.aksi === "berikutnya") {
    if (s.sorotan_id) await db().from("pertanyaan").update({ sudah_dijawab: true }).eq("id", s.sorotan_id);
    const { data: nx } = await db().from("pertanyaan").select("id")
      .eq("sesi_id", id).eq("sudah_dijawab", false).eq("disembunyikan", false).eq("ditarik", false)
      .neq("id", s.sorotan_id ?? "00000000-0000-0000-0000-000000000000")
      .order("jumlah_dukungan", { ascending: false }).order("nomor").limit(1).maybeSingle();
    await db().from("sesi").update({ sorotan_id: nx?.id ?? null }).eq("id", id);
  } else if (b.aksi === "tambah") {
    const v = validasiPenanya({ avatar: 0, tampil_sebagai: "nama", ...b });
    if (!v.ok) return Response.json({ galat: v.galat }, { status: 400 });
    const { data, error } = await db().from("pertanyaan").insert({ ...v.data, sesi_id: id, perangkat: "admin-manual", ip: "admin" }).select("id").single();
    if (error) return Response.json({ galat: "Gagal menyimpan." }, { status: 500 });
    after(() => jawabPertanyaan(data.id));
  } else {
    return Response.json({ galat: "Aksi tidak dikenal." }, { status: 400 });
  }
  after(() => kabari(s.kode));
  return Response.json({ ok: true });
}
