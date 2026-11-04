import { after } from "next/server";
import { db } from "@/lib/supabase/admin";
import { getAdmin, unauthorized } from "@/lib/auth";
import { sesiById, stateAdmin } from "@/lib/data";
import { kabari } from "@/lib/broadcast";
import { prosesTertinggal } from "@/lib/ai";
import { RESERVED, clean, slugify } from "@/lib/validate";
import type { Sesi } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/sesi/[id]">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const s = await sesiById(id);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });
  const state = await stateAdmin(s);
  if (state.pertanyaan.some((q) => q.status_ai === "menunggu" || q.status_ai === "memproses")) {
    after(() => prosesTertinggal(s.id));
  }
  return Response.json(state, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/sesi/[id]">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const s = await sesiById(id);
  if (!s) return Response.json({ galat: "Sesi tidak ditemukan." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const patch: Partial<Sesi> = {};

  if (["draf", "dibuka", "ditutup"].includes(b.status)) patch.status = b.status;
  if ("sorotan_id" in b) patch.sorotan_id = typeof b.sorotan_id === "string" ? b.sorotan_id : null;
  if (typeof b.topik === "string") patch.topik = clean(b.topik, 160);
  if (typeof b.matkul === "string") patch.matkul = clean(b.matkul, 120);
  if (typeof b.kelompok_penyaji === "string") patch.kelompok_penyaji = clean(b.kelompok_penyaji, 60);
  if (typeof b.materi === "string") patch.materi = clean(b.materi, 20000) || null;
  if (typeof b.tanggal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.tanggal)) patch.tanggal = b.tanggal;
  if (typeof b.kode === "string") {
    const kode = slugify(b.kode);
    if (RESERVED.has(kode) || kode.length < 2) return Response.json({ galat: "Kode link tidak boleh dipakai." }, { status: 400 });
    if (kode !== s.kode) {
      const { data } = await db().from("sesi").select("id").eq("kode", kode).maybeSingle();
      if (data) return Response.json({ galat: "Kode link sudah dipakai sesi lain." }, { status: 409 });
      patch.kode = kode;
    }
  }
  if (patch.topik === "" || patch.kelompok_penyaji === "") return Response.json({ galat: "Topik dan kelompok penyaji wajib diisi." }, { status: 400 });

  // Pertanyaan yang naik ke layar otomatis dianggap "belum dijawab".
  if (patch.sorotan_id) await db().from("pertanyaan").update({ sudah_dijawab: false }).eq("id", patch.sorotan_id).eq("sesi_id", s.id);

  const { error } = await db().from("sesi").update(patch).eq("id", id);
  if (error) return Response.json({ galat: "Gagal menyimpan." }, { status: 500 });
  after(async () => {
    await kabari(s.kode);
    if (patch.kode) await kabari(patch.kode);
  });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/sesi/[id]">) {
  if (!(await getAdmin())) return unauthorized();
  const { id } = await ctx.params;
  await db().from("sesi").update({ sorotan_id: null }).eq("id", id);
  const { error } = await db().from("sesi").delete().eq("id", id);
  if (error) return Response.json({ galat: "Gagal menghapus sesi." }, { status: 500 });
  return Response.json({ ok: true });
}
