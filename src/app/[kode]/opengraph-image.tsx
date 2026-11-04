import { OG_SIZE, hostTampil, ogImage } from "@/lib/og";
import { sesiByKode } from "@/lib/data";
import { db } from "@/lib/supabase/admin";

export const alt = "Kirim pertanyaanmu di Ruang Tanya";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const s = await sesiByKode(kode).catch(() => null);
  const host = hostTampil();
  if (!s) {
    return ogImage({ kicker: "Ruang Tanya", judul: "Sesi tidak ditemukan", sub: "Cek lagi link dari kelompok penyaji.", cta: "Masukkan kode sesi →", url: host });
  }

  // Avatar penanya terbaru supaya gambarnya terasa "ramai".
  const { data } = await db().from("pertanyaan").select("avatar")
    .eq("sesi_id", s.id).eq("disembunyikan", false).eq("ditarik", false)
    .order("nomor", { ascending: false }).limit(6);
  const avatars = (data ?? []).map((r: { avatar: number }) => r.avatar);
  const isi = avatars.length >= 3 ? avatars : [...avatars, 0, 3, 4, 9, 10, 6].slice(0, 6);

  const [y, m, d] = s.tanggal.split("-").map(Number);
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][m - 1];

  return ogImage({
    kicker: s.matkul,
    judul: s.topik,
    sub: `${s.kelompok_penyaji} · ${d} ${bulan} ${y}`,
    cta: s.status === "ditutup" ? "Lihat pertanyaan →" : "Kirim pertanyaanmu →",
    url: `${host}/${s.kode}`.replace(/^\//, ""),
    avatars: isi,
    badge: s.status === "ditutup" ? "Sesi selesai" : s.status === "draf" ? "Segera dibuka" : "Tanya jawab live",
  });
}
