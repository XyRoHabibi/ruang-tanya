import { db } from "@/lib/supabase/admin";
import { getAdmin, unauthorized } from "@/lib/auth";
import { RESERVED, clean, slugify } from "@/lib/validate";
import type { Sesi } from "@/lib/types";

async function kodeUnik(dasar: string) {
  let kode = slugify(dasar);
  if (RESERVED.has(kode) || kode.length < 2) kode = `sesi-${kode}`;
  for (let i = 0; i < 50; i++) {
    const coba = i === 0 ? kode : `${kode.slice(0, 36)}-${i + 1}`;
    const { data } = await db().from("sesi").select("id").eq("kode", coba).maybeSingle();
    if (!data) return coba;
  }
  return `${kode.slice(0, 30)}-${Date.now().toString(36)}`;
}

/** Membuat sesi baru, atau menduplikat sesi lama bila `dariId` dikirim. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return unauthorized();
  const b = await req.json().catch(() => ({}));

  let isi: Partial<Sesi>;
  if (typeof b.dariId === "string") {
    const { data: lama } = await db().from("sesi").select("*").eq("id", b.dariId).maybeSingle();
    if (!lama) return Response.json({ galat: "Sesi asal tidak ditemukan." }, { status: 404 });
    isi = {
      topik: `${lama.topik} (salinan)`, matkul: lama.matkul, kelompok_penyaji: lama.kelompok_penyaji,
      materi: lama.materi, tanggal: new Date().toISOString().slice(0, 10), kode: await kodeUnik(lama.kode),
    };
  } else {
    const topik = clean(b.topik, 160);
    const kelompok = clean(b.kelompok_penyaji, 60);
    if (!topik || !kelompok) return Response.json({ galat: "Topik dan kelompok penyaji wajib diisi." }, { status: 400 });
    const kodeDiminta = slugify(clean(b.kode, 40) || topik);
    if (RESERVED.has(kodeDiminta)) return Response.json({ galat: "Kode link itu tidak boleh dipakai." }, { status: 400 });
    const { data: bentrok } = await db().from("sesi").select("id").eq("kode", kodeDiminta).maybeSingle();
    if (bentrok && clean(b.kode, 40)) return Response.json({ galat: "Kode link sudah dipakai sesi lain." }, { status: 409 });
    isi = {
      topik, kelompok_penyaji: kelompok,
      matkul: clean(b.matkul, 120) || "Pendidikan Agama Islam",
      tanggal: /^\d{4}-\d{2}-\d{2}$/.test(b.tanggal) ? b.tanggal : new Date().toISOString().slice(0, 10),
      materi: clean(b.materi, 20000) || null,
      kode: bentrok ? await kodeUnik(kodeDiminta) : kodeDiminta,
    };
  }

  const { data, error } = await db().from("sesi").insert(isi).select("id").single();
  if (error) {
    console.error("Gagal membuat sesi:", error);
    return Response.json({ galat: `Gagal membuat sesi: ${error.message}` }, { status: 500 });
  }
  return Response.json({ ok: true, id: data.id });
}
