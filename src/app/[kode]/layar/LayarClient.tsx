"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PertanyaanPublik, SesiPublik, StatePublik } from "@/lib/types";
import { api, useDebounced, useOrigin, useSesiChannel } from "@/lib/client";
import { Avatar } from "@/components/Avatar";
import { QR } from "@/components/QR";

type Float = { id: number; e: string; left: number; dx: number };

export default function LayarClient({ sesiAwal, isAdmin }: { sesiAwal: SesiPublik; isAdmin: boolean }) {
  const kode = sesiAwal.kode;
  const [sesi, setSesi] = useState(sesiAwal);
  const [list, setList] = useState<PertanyaanPublik[]>([]);
  const origin = useOrigin();
  const [floats, setFloats] = useState<Float[]>([]);
  const [baru, setBaru] = useState<PertanyaanPublik | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [podium, setPodium] = useState(false);
  const [swapKey, setSwapKey] = useState(0);
  const known = useRef<Set<string> | null>(null);
  const lastSpot = useRef<string | null>(sesiAwal.sorotan_id);
  const fid = useRef(0);

  const tambahFloat = useCallback((e: string) => {
    const id = ++fid.current;
    setFloats((f) => [...f.slice(-40), { id, e, left: 8 + Math.random() * 84, dx: Math.random() * 120 - 60 }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 3700);
  }, []);

  const muat = useCallback(async () => {
    try {
      const st = await api<StatePublik>(`/api/s/${kode}`);
      if (known.current) {
        const masuk = st.pertanyaan.filter((q) => !known.current!.has(q.id));
        if (masuk.length) {
          setFreshIds(new Set(masuk.map((q) => q.id)));
          setBaru(masuk[masuk.length - 1]);
          setTimeout(() => setBaru(null), 3400);
          setTimeout(() => setFreshIds(new Set()), 900);
        }
      }
      known.current = new Set(st.pertanyaan.map((q) => q.id));
      if (st.sesi.sorotan_id !== lastSpot.current) { lastSpot.current = st.sesi.sorotan_id; setSwapKey((k) => k + 1); }
      setSesi(st.sesi);
      setList(st.pertanyaan);
    } catch { /* coba lagi nanti */ }
  }, [kode]);
  const muatNanti = useDebounced(muat, 250);
  useSesiChannel(kode, { onUbah: () => muatNanti(), onReaksi: tambahFloat }, 10000);
  useEffect(() => { muat(); }, [muat]);

  const berikutnya = useCallback(async () => {
    try { await api(`/api/admin/sesi/${sesi.id}/aksi`, "POST", { aksi: "berikutnya" }); muat(); } catch { /* abaikan */ }
  }, [sesi.id, muat]);

  const bahas = useCallback(async (id: string | null) => {
    // Langsung tampil di layar, lalu disimpan ke server.
    setSesi((s) => ({ ...s, sorotan_id: id }));
    lastSpot.current = id;
    setSwapKey((k) => k + 1);
    try { await api(`/api/admin/sesi/${sesi.id}`, "PATCH", { sorotan_id: id }); } catch { /* muat ulang di bawah */ }
    muat();
  }, [sesi.id, muat]);

  const bukaPodium = useCallback(() => {
    setPodium(true);
    for (let i = 0; i < 16; i++) setTimeout(() => tambahFloat(["👏", "🔥", "🎉"][i % 3]), i * 140);
  }, [tambahFloat]);

  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" || e.key === "ArrowRight") berikutnya();
      if (e.key === "p") setPodium((p) => !p);
      if (e.key === "f") document.documentElement.requestFullscreen?.().catch(() => {});
      if (e.key === "Escape") setPodium(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, berikutnya]);

  const spot = list.find((q) => q.id === sesi.sorotan_id) ?? null;
  const byVotes = [...list].sort((a, b) => b.dukungan - a.dukungan || a.nomor - b.nomor);
  const antrean = byVotes.filter((q) => q.id !== sesi.sorotan_id).sort((a, b) => Number(a.sudah_dijawab) - Number(b.sudah_dijawab));
  // Admin bisa menggulir dan mengeklik semua antrean; penonton tanpa login melihat 5 teratas.
  const tampilAntrean = isAdmin ? antrean : antrean.slice(0, 5);
  const top3 = byVotes.filter((q) => q.dukungan > 0).slice(0, 3);
  const joinUrl = origin ? `${origin}/${kode}` : `/${kode}`;
  const urlTeks = joinUrl.replace(/^https?:\/\//, "");

  return (
    <div className="live-root">
      <div className="lv">
        <div className="lv-top">
          <span className="brand"><i />Ruang Tanya</span>
          <span className="lv-title">{sesi.topik} · {sesi.kelompok_penyaji}</span>
          <div className="lv-join">
            {origin && <QR className="qr" text={joinUrl} />}
            <div><span>{sesi.status === "dibuka" ? "Ikut bertanya di" : "Sesi ditutup · lihat di"}</span><b>{urlTeks}</b></div>
          </div>
          <div className="lv-count"><b>{list.length}</b><span>pertanyaan</span></div>
        </div>

        <div className="lv-main">
          {spot ? (
            <div key={swapKey} className={`spotlight ${swapKey ? "swap" : ""}`}>
              <span className="chip">Sedang dibahas · No. {String(spot.nomor).padStart(2, "0")}</span>
              <p className={`spot-q ${spot.pertanyaan.length > 180 ? "long" : ""}`}>{spot.pertanyaan}</p>
              <div className="spot-who">
                <Avatar i={spot.avatar} size={74} />
                <div><b>{spot.nama_tampil}</b><span>Kelompok {spot.kelompok}</span></div>
                <span className="votes">🔥 {spot.dukungan}</span>
              </div>
              {isAdmin && <button className="spot-off" onClick={() => bahas(null)} title="Kembalikan ke antrean">Turunkan</button>}
            </div>
          ) : (
            <div className="spotlight empty">
              <div>
                <p className="spot-q" style={{ margin: 0 }}>{list.length ? "Pertanyaan mana yang dibahas duluan?" : "Pindai QR dan kirim pertanyaanmu!"}</p>
                <p style={{ color: "#aaa", margin: "12px 0 0" }}>{list.length ? "Dukung pertanyaan teman supaya naik ke atas antrean." : "Pertanyaanmu akan muncul di sini."}</p>
              </div>
            </div>
          )}
          <div className="queue">
            <h3><span>Antrean</span><span>{isAdmin ? "klik untuk membahas" : "urut dukungan"}</span></h3>
            <div className={`q-scroll ${isAdmin ? "admin" : ""}`}>
              {tampilAntrean.map((q) => {
                const isi = (
                  <>
                    <Avatar i={q.avatar} size={48} />
                    <div><small>{q.nama_tampil}{q.sudah_dijawab ? " · sudah dijawab" : ""}</small><p>{q.pertanyaan}</p></div>
                    <span className="v">{q.dukungan}</span>
                  </>
                );
                const cls = `lq ${freshIds.has(q.id) ? "new" : ""} ${q.sudah_dijawab ? "done" : ""}`;
                return isAdmin ? (
                  <button key={q.id} className={`${cls} pickable`} onClick={() => bahas(q.id)} title="Bahas pertanyaan ini">{isi}</button>
                ) : (
                  <div key={q.id} className={cls}>{isi}</div>
                );
              })}
            </div>
            {antrean.length > tampilAntrean.length && <div className="more">+{antrean.length - tampilAntrean.length} pertanyaan lain</div>}
          </div>
        </div>
      </div>

      <div className={`new-pop ${baru ? "show" : ""}`} aria-live="polite">
        {baru && <><Avatar i={baru.avatar} size={36} /> {baru.nama_tampil} baru bertanya!</>}
      </div>

      <div className="float-layer" aria-hidden="true">
        {floats.map((f) => (
          <span key={f.id} className="flo" style={{ left: `${f.left}%`, ["--dx" as string]: `${f.dx}px` }}>{f.e}</span>
        ))}
      </div>

      {podium && (
        <div className="podium" role="dialog" aria-label="Podium penanya terbaik">
          <h2>Penanya terbaik hari ini</h2>
          <p>Berdasarkan dukungan teman sekelas</p>
          {top3.length ? (
            <div className="pods">
              {[top3[1], top3[0], top3[2]].map((q, i) => q && (
                <div key={q.id} className={`pod ${["p2", "p1", "p3"][i]}`}>
                  <Avatar i={q.avatar} size={96} />
                  <b>{q.nama_tampil}</b>
                  <small>🔥 {q.dukungan} dukungan</small>
                  <div className="blk">{[2, 1, 3][i]}</div>
                </div>
              ))}
            </div>
          ) : <p>Belum ada pertanyaan yang didukung.</p>}
          <p style={{ marginTop: 28 }}><button className="btn sun" onClick={() => setPodium(false)}>Tutup podium</button></p>
        </div>
      )}

      {isAdmin && (
        <div className="lv-ctl">
          <Link href={`/admin/sesi/${sesi.id}`}>← Panel</Link>
          <button onClick={berikutnya} title="Tombol N">Bahas berikutnya</button>
          <button onClick={bukaPodium} title="Tombol P">Tampilkan podium</button>
          <button onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} title="Tombol F">Layar penuh</button>
        </div>
      )}
    </div>
  );
}
