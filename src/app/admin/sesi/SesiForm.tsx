"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Sesi } from "@/lib/types";
import { api, useOrigin } from "@/lib/client";

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function SesiForm({ sesi }: { sesi?: Sesi }) {
  const router = useRouter();
  const [topik, setTopik] = useState(sesi?.topik ?? "");
  const [matkul, setMatkul] = useState(sesi?.matkul ?? "Pendidikan Agama Islam");
  const [kelompok, setKelompok] = useState(sesi?.kelompok_penyaji ?? "");
  const [tanggal, setTanggal] = useState(sesi?.tanggal ?? new Date().toISOString().slice(0, 10));
  const [kode, setKode] = useState(sesi?.kode ?? "");
  const [kodeManual, setKodeManual] = useState(!!sesi);
  const [materi, setMateri] = useState(sesi?.materi ?? "");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const origin = useOrigin().replace(/^https?:\/\//, "");

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setSibuk(true); setGalat("");
    const body = { topik, matkul, kelompok_penyaji: kelompok, tanggal, kode: kode || slug(topik), materi };
    try {
      if (sesi) {
        await api(`/api/admin/sesi/${sesi.id}`, "PATCH", body);
        router.push(`/admin/sesi/${sesi.id}`);
      } else {
        const r = await api<{ id: string }>("/api/admin/sesi", "POST", body);
        router.push(`/admin/sesi/${r.id}`);
      }
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan.");
      setSibuk(false);
    }
  }

  return (
    <form className="card-form" onSubmit={simpan}>
      <div className="fld"><label htmlFor="topik">Topik presentasi</label>
        <input id="topik" value={topik} maxLength={160} required placeholder="Akhlak dalam Kehidupan Sehari-hari"
          onChange={(e) => { setTopik(e.target.value); if (!kodeManual) setKode(slug(e.target.value)); }} /></div>
      <div className="fld two">
        <div><label htmlFor="matkul">Mata kuliah</label><input id="matkul" value={matkul} maxLength={120} onChange={(e) => setMatkul(e.target.value)} /></div>
        <div><label htmlFor="kel">Kelompok penyaji</label><input id="kel" value={kelompok} maxLength={60} required placeholder="Kelompok 3" onChange={(e) => setKelompok(e.target.value)} /></div>
      </div>
      <div className="fld two">
        <div><label htmlFor="tgl">Tanggal</label><input id="tgl" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
        <div><label htmlFor="kode">Kode link</label><input id="kode" value={kode} maxLength={40} placeholder="akhlak"
          onChange={(e) => { setKodeManual(true); setKode(slug(e.target.value) || e.target.value.toLowerCase()); }} /></div>
      </div>
      <div className="seg-hint">Link untuk teman: <b>{origin}/{kode || "…"}</b></div>
      <div className="fld"><label htmlFor="materi">Ringkasan materi <span>opsional, jadi acuan jawaban AI</span></label>
        <textarea id="materi" rows={10} value={materi} maxLength={20000} onChange={(e) => setMateri(e.target.value)} placeholder="Tempel poin-poin materi presentasimu di sini." />
        <div className="count">{materi.length}/20000</div></div>
      {galat && <div className="galat" style={{ marginTop: 14 }} role="alert">{galat}</div>}
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <button className="btn go" disabled={sibuk}>{sibuk ? "Menyimpan…" : sesi ? "Simpan perubahan" : "Buat sesi"}</button>
        <button type="button" className="btn" onClick={() => router.back()}>Batal</button>
      </div>
    </form>
  );
}
