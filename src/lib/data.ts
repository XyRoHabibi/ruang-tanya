import "server-only";
import { db } from "./supabase/admin";
import type { Pertanyaan, PertanyaanPublik, Sesi, SesiPublik, StatePublik } from "./types";
import { AVATARS } from "./avatars";

export async function sesiByKode(kode: string): Promise<Sesi | null> {
  const { data } = await db().from("sesi").select("*").eq("kode", kode.toLowerCase()).maybeSingle();
  return (data as Sesi) ?? null;
}

export async function sesiById(id: string): Promise<Sesi | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db().from("sesi").select("*").eq("id", id).maybeSingle();
  return (data as Sesi) ?? null;
}

export function sesiPublik(s: Sesi): SesiPublik {
  return {
    id: s.id, kode: s.kode, topik: s.topik, matkul: s.matkul,
    kelompok_penyaji: s.kelompok_penyaji, tanggal: s.tanggal, status: s.status, sorotan_id: s.sorotan_id,
  };
}

export function namaTampil(q: Pick<Pertanyaan, "tampil_sebagai" | "avatar" | "nama">) {
  return q.tampil_sebagai === "avatar" ? AVATARS[q.avatar]?.name ?? "Anonim" : q.nama;
}

export async function statePublik(s: Sesi, perangkat: string | null): Promise<StatePublik> {
  const { data } = await db()
    .from("pertanyaan")
    .select("id,nomor,avatar,nama,nim,kelompok,tampil_sebagai,pertanyaan,jawaban_penanya,jumlah_dukungan,sudah_dijawab,diedit,dibuat_pada,perangkat")
    .eq("sesi_id", s.id)
    .eq("disembunyikan", false)
    .eq("ditarik", false)
    .order("nomor");
  const rows = (data ?? []) as Pertanyaan[];

  let didukung = new Set<string>();
  if (perangkat && rows.length) {
    const { data: d } = await db().from("dukungan").select("pertanyaan_id").eq("perangkat", perangkat).in("pertanyaan_id", rows.map((r) => r.id));
    didukung = new Set((d ?? []).map((x: { pertanyaan_id: string }) => x.pertanyaan_id));
  }

  const pertanyaan: PertanyaanPublik[] = rows.map((r) => {
    const milik = !!perangkat && r.perangkat === perangkat;
    return {
      id: r.id, nomor: r.nomor, avatar: r.avatar, nama_tampil: namaTampil(r), pakai_avatar: r.tampil_sebagai === "avatar",
      kelompok: r.kelompok, pertanyaan: r.pertanyaan, dukungan: r.jumlah_dukungan, sudah_dijawab: r.sudah_dijawab,
      diedit: r.diedit, dibuat_pada: r.dibuat_pada, milik, didukung: didukung.has(r.id),
      pribadi: milik ? { nama: r.nama, nim: r.nim, kelompok: r.kelompok, tampil_sebagai: r.tampil_sebagai, jawaban_penanya: r.jawaban_penanya ?? "" } : undefined,
    };
  });
  return { sesi: sesiPublik(s), pertanyaan };
}

export async function stateAdmin(s: Sesi) {
  const { data } = await db().from("pertanyaan").select("*").eq("sesi_id", s.id).order("nomor");
  return { sesi: s, pertanyaan: (data ?? []) as Pertanyaan[] };
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "lokal";
}
