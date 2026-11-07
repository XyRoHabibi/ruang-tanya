import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { REPO_URL, SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Lisensi · Ruang Tanya",
  description: "Ruang Tanya dirilis dengan MIT License oleh Naufal Habibi.",
};

export default async function LisensiPage() {
  const teks = await readFile(join(process.cwd(), "LICENSE"), "utf8");
  return (
    <main className="lisensi">
      <div className="card-form">
        <Link href="/" className="brand"><i />Ruang Tanya</Link>
        <h1>MIT License</h1>
        <p className="lead">
          Ruang Tanya adalah proyek open source. Kamu boleh memakai, menyalin, mengubah, dan membagikan kodenya,
          asalkan tetap menyertakan pemberitahuan hak cipta dan lisensi di bawah ini.
        </p>
        <pre>{teks.trim()}</pre>
        <p><a className="btn sm" href={REPO_URL} target="_blank" rel="noreferrer">Lihat kode sumber di GitHub ↗</a></p>
      </div>
      <SiteFooter />
    </main>
  );
}
