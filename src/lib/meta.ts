import type { Metadata } from "next";
import type { Sesi } from "./types";

/** Judul + deskripsi + kartu pratinjau link untuk halaman sebuah sesi. */
export function metaSesi(s: Sesi | null, jenis: "tanya" | "teman" | "layar"): Metadata {
  if (!s) return { title: "Sesi tidak ditemukan · Ruang Tanya", robots: { index: false } };
  const judul = jenis === "tanya" ? `Tanya: ${s.topik}` : jenis === "teman" ? `Pertanyaan teman: ${s.topik}` : `Layar: ${s.topik}`;
  const deskripsi = `${s.kelompok_penyaji} · ${s.matkul}. Pilih avatar, kirim pertanyaanmu, dan dukung pertanyaan teman di Ruang Tanya.`;
  const url = jenis === "tanya" ? `/${s.kode}` : `/${s.kode}/${jenis}`;
  return {
    title: `${judul} · Ruang Tanya`,
    description: deskripsi,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Ruang Tanya", locale: "id_ID", title: judul, description: deskripsi, url },
    twitter: { card: "summary_large_image", title: judul, description: deskripsi },
    robots: jenis === "tanya" ? undefined : { index: false },
  };
}
