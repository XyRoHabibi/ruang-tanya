"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PertanyaanPublik, SesiPublik, StatePublik } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { api, getDeviceId, loadProfil, saveProfil, useDebounced, useSesiChannel } from "@/lib/client";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { SesiHeader } from "@/components/SesiHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Sukses = { nomor: number; pertamaKali: boolean; avatar: number };

export default function FormClient({ sesiAwal }: { sesiAwal: SesiPublik }) {
  const [sesi, setSesi] = useState(sesiAwal);
  const [daftar, setDaftar] = useState<PertanyaanPublik[]>([]);
  const [avatar, setAvatar] = useState(0);
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [kelompok, setKelompok] = useState("");
  const [tanya, setTanya] = useState("");
  const [jawab, setJawab] = useState("");
  const [tampil, setTampil] = useState<"nama" | "avatar">("nama");
  const [website, setWebsite] = useState("");
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState("");
  const [sukses, setSukses] = useState<Sukses | null>(null);

  // Profil tersimpan hanya ada di browser, jadi dibaca setelah halaman tampil.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = loadProfil();
    if (p) {
      setNama(p.nama); setNim(p.nim); setKelompok(p.kelompok); setAvatar(p.avatar); setTampil(p.tampil_sebagai);
    } else {
      setAvatar(Math.floor(Math.random() * AVATARS.length));
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const muat = useCallback(async () => {
    try {
      const st = await api<StatePublik>(`/api/s/${sesiAwal.kode}`);
      setSesi(st.sesi);
      setDaftar(st.pertanyaan);
    } catch { /* abaikan, coba lagi nanti */ }
  }, [sesiAwal.kode]);
  const muatNanti = useDebounced(muat, 400);
  useSesiChannel(sesiAwal.kode, { onUbah: () => muatNanti() }, 20000);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- muat() memanggil setState setelah fetch selesai
  useEffect(() => { muat(); }, [muat]);

  const acak = () => {
    let n = avatar;
    while (n === avatar) n = Math.floor(Math.random() * AVATARS.length);
    setAvatar(n);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (!/^\d{5,20}$/.test(nim.trim())) return setGalat("NIM hanya angka, 5 sampai 20 digit.");
    if (tanya.trim().length < 10) return setGalat("Pertanyaan minimal 10 karakter.");
    setKirim(true);
    try {
      const r = await api<{ nomor: number; pertamaKali: boolean }>(`/api/s/${sesi.kode}/tanya`, "POST", {
        perangkat: getDeviceId(), nama, nim, kelompok, avatar, tampil_sebagai: tampil,
        pertanyaan: tanya, jawaban_penanya: jawab, website,
      });
      saveProfil({ nama: nama.trim(), nim: nim.trim(), kelompok: kelompok.trim(), avatar, tampil_sebagai: tampil });
      setSukses({ nomor: r.nomor, pertamaKali: r.pertamaKali, avatar });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal mengirim.");
    } finally {
      setKirim(false);
    }
  }

  if (sukses) {
    return (
      <main className="mob">
        <div className="success" aria-live="polite">
          <div className="burst">
            <svg className="ray" viewBox="0 0 170 170" aria-hidden="true">
              <g fill="#FFC93C" stroke="#121212" strokeWidth="2">
                <path d="M85 0 L95 60 L85 85 L75 60z" /><path d="M85 170 L95 110 L85 85 L75 110z" />
                <path d="M0 85 L60 75 L85 85 L60 95z" /><path d="M170 85 L110 75 L85 85 L110 95z" />
                <path d="M25 25 L72 66 L85 85 L64 72z" /><path d="M145 145 L98 104 L85 85 L106 98z" />
                <path d="M145 25 L104 72 L85 85 L98 64z" /><path d="M25 145 L66 98 L85 85 L72 106z" />
              </g>
            </svg>
            <Avatar i={sukses.avatar} />
          </div>
          <h2>Terkirim! Kamu penanya ke-{sukses.nomor}</h2>
          <p>{sesi.kelompok_penyaji} akan membahasnya di sesi tanya jawab.</p>
          {sukses.pertamaKali && (
            <div className="badge-earn">
              <Medal />
              <div><b>Lencana: Berani Bertanya</b><span>Dapat dari pertanyaan pertamamu di sesi ini.</span></div>
            </div>
          )}
          <Link className="btn dark block" style={{ padding: 15 }} href={`/${sesi.kode}/teman`}>Lihat pertanyaan teman →</Link>
          <p style={{ marginTop: 14 }}>
            <button className="linkish" onClick={() => { setSukses(null); setTanya(""); setJawab(""); }}>Kirim pertanyaan lain</button>
          </p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const terakhir = daftar.slice(-5);
  return (
    <main className="mob">
      <SesiHeader sesi={sesi} />
      <div className="crowd">
        {terakhir.length > 0 && <span className="stack">{terakhir.map((q) => <Avatar key={q.id} i={q.avatar} size={28} />)}</span>}
        <span>{daftar.length ? `${daftar.length} teman sudah bertanya` : "Jadilah penanya pertama!"}</span>
        {daftar.length > 0 && <Link href={`/${sesi.kode}/teman`} className="linkish" style={{ marginLeft: "auto" }}>Lihat</Link>}
      </div>

      {sesi.status !== "dibuka" ? (
        <div className="closed">
          <Avatar i={8} size={72} />
          <h2>{sesi.status === "draf" ? "Sesi belum dibuka" : "Sesi sudah ditutup"}</h2>
          <p>{sesi.status === "draf" ? "Tunggu sebentar. Halaman ini otomatis terbuka saat sesi dimulai." : "Terima kasih sudah ikut! Kamu masih bisa melihat pertanyaan teman."}</p>
          <Link className="btn sun" href={`/${sesi.kode}/teman`}>Lihat pertanyaan teman</Link>
        </div>
      ) : (
        <>
          <div className="av-box">
            <div className="av-cur">
              <Avatar key={avatar} i={avatar} size={52} />
              <div className="t"><span className="label">Avatarmu</span><b>{AVATARS[avatar].name}</b></div>
              <button type="button" className="btn sm" onClick={acak}>🎲 Acak</button>
            </div>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          <form className="card-form" id="ask" onSubmit={submit} noValidate>
            <div className="fld"><label htmlFor="nama">Nama</label><input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" maxLength={80} required /></div>
            <div className="fld two">
              <div><label htmlFor="nim">NIM</label><input id="nim" value={nim} onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={20} required /></div>
              <div><label htmlFor="kel">Kelompok</label><input id="kel" value={kelompok} onChange={(e) => setKelompok(e.target.value)} maxLength={20} required /></div>
            </div>
            <div className="fld">
              <label htmlFor="tanya">Pertanyaan</label>
              <textarea id="tanya" rows={4} value={tanya} onChange={(e) => setTanya(e.target.value)} maxLength={1000} placeholder="Tulis pertanyaanmu…" required />
              <div className="count">{tanya.length}/1000</div>
            </div>
            <div className="fld">
              <label htmlFor="jwb">Jawaban versimu <span>opsional</span></label>
              <textarea id="jwb" rows={3} value={jawab} onChange={(e) => setJawab(e.target.value)} maxLength={3000} placeholder="Punya pendapat sendiri? Tulis di sini." />
            </div>
            <div className="fld">
              <span className="lbl">Tampil di layar sebagai</span>
              <div className="seg">
                <button type="button" aria-pressed={tampil === "nama"} onClick={() => setTampil("nama")}>Nama asli</button>
                <button type="button" aria-pressed={tampil === "avatar"} onClick={() => setTampil("avatar")}>{AVATARS[avatar].name}</button>
              </div>
              <div className="seg-hint">NIM tidak pernah ditampilkan ke teman.</div>
            </div>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            {galat && <div className="galat" style={{ marginTop: 14 }} role="alert">{galat}</div>}
          </form>
          <div className="submit">
            <button className="btn go" form="ask" type="submit" disabled={kirim} aria-busy={kirim}>{kirim ? "Mengirim…" : "Kirim pertanyaan 🚀"}</button>
          </div>
        </>
      )}
      <SiteFooter />
    </main>
  );
}

function Medal() {
  return (
    <svg className="medal" viewBox="0 0 46 46" aria-hidden="true">
      <path d="M14 2h8l4 14h-8z M32 2h-8l-4 14h8z" fill="#FF5B3A" stroke="#121212" strokeWidth="2" />
      <circle cx="23" cy="29" r="14" fill="#FFC93C" stroke="#121212" strokeWidth="2" />
      <path d="M23 21l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#fff" stroke="#121212" strokeWidth="1.5" />
    </svg>
  );
}
