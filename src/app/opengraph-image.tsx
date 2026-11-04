import { OG_SIZE, hostTampil, ogImage } from "@/lib/og";

export const alt = "Ruang Tanya: tanya jawab interaktif untuk presentasi kelas";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return ogImage({
    kicker: "Untuk presentasi kelas",
    judul: "Tanya jawab presentasi jadi seru",
    sub: "Pilih avatar, kirim pertanyaan, dukung pertanyaan teman.",
    cta: "Masukkan kode sesi →",
    url: hostTampil(),
  });
}
