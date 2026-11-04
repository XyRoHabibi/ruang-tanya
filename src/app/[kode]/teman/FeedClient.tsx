"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PertanyaanPublik, SesiPublik, StatePublik } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { REAKSI, api, getDeviceId, jam, loadProfil, saveProfil, useDebounced, useSesiChannel } from "@/lib/client";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { useToast } from "@/components/useToast";

type Edit = { id: string; avatar: number; nama: string; nim: string; kelompok: string; tampil_sebagai: "nama" | "avatar"; pertanyaan: string; jawaban_penanya: string };

export default function FeedClient({ sesiAwal }: { sesiAwal: SesiPublik }) {
  const kode = sesiAwal.kode;
  const [sesi, setSesi] = useState(sesiAwal);
  const [list, setList] = useState<PertanyaanPublik[] | null>(null);
  const [urut, setUrut] = useState<"top" | "new">("top");
  const [edit, setEdit] = useState<Edit | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galatEdit, setGalatEdit] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [myAvatar, setMyAvatar] = useState<number | null>(null);
  const known = useRef<Set<string> | null>(null);
  const lastReact = useRef(0);
  const { toast, node: toastNode } = useToast();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- profil hanya ada di browser
  useEffect(() => { setMyAvatar(loadProfil()?.avatar ?? null); }, []);

  const muat = useCallback(async () => {
    try {
      const st = await api<StatePublik>(`/api/s/${kode}?d=${getDeviceId()}`);
      setSesi(st.sesi);
      if (known.current) {
        const baru = st.pertanyaan.filter((q) => !known.current!.has(q.id)).map((q) => q.id);
        if (baru.length) { setFresh(new Set(baru)); setTimeout(() => setFresh(new Set()), 900); }
      }
      known.current = new Set(st.pertanyaan.map((q) => q.id));
      setList(st.pertanyaan);
    } catch { /* coba lagi nanti */ }
  }, [kode]);
  const muatNanti = useDebounced(muat, 300);
  const ch = useSesiChannel(kode, { onUbah: () => muatNanti() });
  // eslint-disable-next-line react-hooks/set-state-in-effect -- muat() memanggil setState setelah fetch selesai
  useEffect(() => { muat(); }, [muat]);

  async function dukung(q: PertanyaanPublik) {
    setList((l) => l?.map((x) => x.id === q.id ? { ...x, didukung: !x.didukung, dukungan: x.dukungan + (x.didukung ? -1 : 1) } : x) ?? null);
    try {
      const r = await api<{ didukung: boolean; dukungan: number }>(`/api/s/${kode}/dukung/${q.id}`, "POST", { perangkat: getDeviceId() });
      setList((l) => l?.map((x) => x.id === q.id ? { ...x, didukung: r.didukung, dukungan: r.dukungan } : x) ?? null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Gagal.");
      muat();
    }
  }

  function reaksi(e: string, ev: React.MouseEvent<HTMLButtonElement>) {
    const now = ev.timeStamp;
    if (now - lastReact.current < 900) return;
    lastReact.current = now;
    ch.current?.send({ type: "broadcast", event: "reaksi", payload: { e } });
    const r = ev.currentTarget.getBoundingClientRect();
    const p = document.createElement("span");
    p.className = "pop-react";
    p.textContent = e;
    p.style.left = `${r.left + 8}px`;
    p.style.top = `${r.top - 10}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }

  function mulaiEdit(q: PertanyaanPublik) {
    if (!q.pribadi) return;
    setGalatEdit("");
    setKonfirmasi(null);
    setEdit({ id: q.id, avatar: q.avatar, pertanyaan: q.pertanyaan, ...q.pribadi });
  }

  async function simpanEdit() {
    if (!edit) return;
    setSibuk(true); setGalatEdit("");
    try {
      await api(`/api/s/${kode}/tanya/${edit.id}`, "PATCH", { perangkat: getDeviceId(), ...edit });
      saveProfil({ nama: edit.nama.trim(), nim: edit.nim.trim(), kelompok: edit.kelompok.trim(), avatar: edit.avatar, tampil_sebagai: edit.tampil_sebagai });
      setMyAvatar(edit.avatar);
      setEdit(null);
      toast("Perubahan disimpan.");
      muat();
    } catch (e) {
      setGalatEdit(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally { setSibuk(false); }
  }

  async function tarik(id: string) {
    setSibuk(true);
    try {
      await api(`/api/s/${kode}/tanya/${id}`, "DELETE", { perangkat: getDeviceId() });
      setKonfirmasi(null);
      toast("Pertanyaan ditarik. Tidak tampil di feed, layar, dan rekap.");
      muat();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Gagal menarik pertanyaan.");
    } finally { setSibuk(false); }
  }

  const tampil = list ? (urut === "top" ? [...list].sort((a, b) => b.dukungan - a.dukungan || a.nomor - b.nomor) : [...list].reverse()) : [];
  const kunci = (q: PertanyaanPublik) =>
    q.id === sesi.sorotan_id ? "sedang dibahas" : q.sudah_dijawab ? "sudah dijawab" : sesi.status !== "dibuka" ? "sesi ditutup" : "";

  return (
    <main className="mob" style={{ paddingBottom: 0 }}>
      <div className="feed-head">
        <Avatar i={myAvatar ?? 0} size={40} />
        <div className="t"><b>{sesi.topik}</b><span>{list?.length ?? 0} pertanyaan · {sesi.kelompok_penyaji}</span></div>
        {sesi.status === "dibuka" && <Link className="btn sm sun" href={`/${kode}`}>+ Tanya</Link>}
      </div>
      <div className="tabs" role="group" aria-label="Urutkan">
        <button aria-pressed={urut === "top"} onClick={() => setUrut("top")}>🔥 Terpopuler</button>
        <button aria-pressed={urut === "new"} onClick={() => setUrut("new")}>Terbaru</button>
      </div>

      <div className="flist">
        {list === null && <div className="empty-feed">Memuat…</div>}
        {list?.length === 0 && (
          <div className="empty-feed"><Avatar i={0} size={64} /><p>Belum ada pertanyaan. Jadilah yang pertama!</p>
            {sesi.status === "dibuka" && <Link className="btn go" href={`/${kode}`}>Kirim pertanyaan</Link>}</div>
        )}
        {tampil.map((q) => {
          const spot = q.id === sesi.sorotan_id;
          const status = spot ? <span className="chip live">Sedang dibahas</span> : q.sudah_dijawab ? <span className="chip done">Sudah dijawab</span> : null;
          const k = kunci(q);
          const sedangEdit = edit?.id === q.id;
          return (
            <article key={q.id} className={`fq ${q.milik ? "mine" : ""} ${spot ? "spot" : ""} ${fresh.has(q.id) ? "fresh" : ""}`}>
              <div className="fq-top">
                <Avatar i={sedangEdit ? edit.avatar : q.avatar} size={34} />
                <span className="nm">{q.nama_tampil}{q.milik ? " (kamu)" : ""}<small>{jam(q.dibuat_pada)}{q.diedit ? " · diedit" : ""}</small></span>
                {q.milik && !status ? <span className="mini-badge">PERTANYAANMU</span> : status}
              </div>

              {sedangEdit ? (
                <div className="edit-box">
                  <div className="fld"><span className="lbl">Avatar</span><AvatarPicker value={edit.avatar} onChange={(a) => setEdit({ ...edit, avatar: a })} /></div>
                  <div className="fld"><label htmlFor="e-tanya">Pertanyaan</label><textarea id="e-tanya" rows={4} maxLength={1000} value={edit.pertanyaan} onChange={(e) => setEdit({ ...edit, pertanyaan: e.target.value })} /></div>
                  <div className="fld"><label htmlFor="e-jwb">Jawaban versimu <span>opsional</span></label><textarea id="e-jwb" rows={3} maxLength={3000} value={edit.jawaban_penanya} onChange={(e) => setEdit({ ...edit, jawaban_penanya: e.target.value })} /></div>
                  <div className="fld"><label htmlFor="e-nama">Nama</label><input id="e-nama" value={edit.nama} maxLength={80} onChange={(e) => setEdit({ ...edit, nama: e.target.value })} /></div>
                  <div className="fld two">
                    <div><label htmlFor="e-nim">NIM</label><input id="e-nim" inputMode="numeric" maxLength={20} value={edit.nim} onChange={(e) => setEdit({ ...edit, nim: e.target.value.replace(/\D/g, "") })} /></div>
                    <div><label htmlFor="e-kel">Kelompok</label><input id="e-kel" maxLength={20} value={edit.kelompok} onChange={(e) => setEdit({ ...edit, kelompok: e.target.value })} /></div>
                  </div>
                  <div className="fld"><span className="lbl">Tampil sebagai</span>
                    <div className="seg">
                      <button type="button" aria-pressed={edit.tampil_sebagai === "nama"} onClick={() => setEdit({ ...edit, tampil_sebagai: "nama" })}>Nama asli</button>
                      <button type="button" aria-pressed={edit.tampil_sebagai === "avatar"} onClick={() => setEdit({ ...edit, tampil_sebagai: "avatar" })}>{AVATARS[edit.avatar].name}</button>
                    </div>
                  </div>
                  {galatEdit && <div className="galat" role="alert">{galatEdit}</div>}
                  <div className="fq-bot">
                    <span className="own-acts">
                      <button className="btn sm go" disabled={sibuk} onClick={simpanEdit}>{sibuk ? "Menyimpan…" : "Simpan"}</button>
                      <button className="btn sm" onClick={() => setEdit(null)}>Batal</button>
                    </span>
                    {edit.pertanyaan.trim() !== q.pertanyaan && <span className="lock">AI akan menjawab ulang</span>}
                  </div>
                </div>
              ) : (
                <>
                  <p>{q.pertanyaan}</p>
                  <div className="fq-bot">
                    {konfirmasi === q.id ? (
                      <>
                        <span className="confirm">Tarik pertanyaan ini?</span>
                        <span className="own-acts">
                          <button className="btn sm go" disabled={sibuk} onClick={() => tarik(q.id)}>Ya, tarik</button>
                          <button className="btn sm" onClick={() => setKonfirmasi(null)}>Batal</button>
                        </span>
                      </>
                    ) : q.milik ? (
                      <>
                        <span className="plus static"><span className="n">{q.dukungan}</span>dukungan</span>
                        {k ? <span className="lock">🔒 Terkunci: {k}</span> : (
                          <span className="own-acts">
                            <button className="linkish" onClick={() => mulaiEdit(q)}>Edit</button>
                            <button className="linkish danger" onClick={() => { setEdit(null); setKonfirmasi(q.id); }}>Tarik</button>
                          </span>
                        )}
                      </>
                    ) : (
                      <button className={`plus ${q.didukung ? "on" : ""}`} onClick={() => dukung(q)} aria-pressed={q.didukung}>
                        <span className="n">{q.dukungan}</span>{q.didukung ? "Kamu juga penasaran" : "Aku juga penasaran"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="react-bar" role="group" aria-label="Kirim reaksi ke layar">
        <span>Kirim<br />reaksi</span>
        {REAKSI.map((e) => <button key={e} onClick={(ev) => reaksi(e, ev)} aria-label={`Reaksi ${e}`}>{e}</button>)}
      </div>
      {toastNode}
    </main>
  );
}
