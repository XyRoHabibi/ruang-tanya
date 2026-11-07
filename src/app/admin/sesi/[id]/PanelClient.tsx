"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminState, PilihanWord, Pertanyaan } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { api, jam, tanggalIndo, useBusy, useDebounced, useOrigin, useSesiChannel } from "@/lib/client";
import { masukRekap, versiTerpilih } from "@/lib/word";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { AdminNav } from "@/components/AdminNav";
import { QR } from "@/components/QR";
import { useToast } from "@/components/useToast";

type DataForm = { nama: string; nim: string; kelompok: string; avatar: number; tampil_sebagai: "nama" | "avatar"; pertanyaan: string; jawaban_penanya: string };
const kosong: DataForm = { nama: "", nim: "", kelompok: "", avatar: 0, tampil_sebagai: "nama", pertanyaan: "", jawaban_penanya: "" };

export default function PanelClient({ awal }: { awal: AdminState }) {
  const router = useRouter();
  const [state, setState] = useState(awal);
  const { sesi } = state;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [simpanStatus, setSimpanStatus] = useState<Record<string, string>>({});
  const [menu, setMenu] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | { jenis: "qr" } | { jenis: "data"; id: string | null; form: DataForm }>(null);
  const [galatModal, setGalatModal] = useState("");
  const origin = useOrigin();
  const known = useRef(new Set(awal.pertanyaan.map((q) => q.id)));
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const { toast, node: toastNode } = useToast();
  const { run, is, any } = useBusy();

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".menu-wrap")) setMenu(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const muat = useCallback(async () => {
    try {
      const st = await api<AdminState>(`/api/admin/sesi/${awal.sesi.id}`);
      const baru = st.pertanyaan.filter((q) => !known.current.has(q.id));
      if (baru.length) {
        setFresh(new Set(baru.map((q) => q.id)));
        setTimeout(() => setFresh(new Set()), 900);
        toast(`Pertanyaan baru masuk: nomor ${baru.map((q) => String(q.nomor).padStart(2, "0")).join(", ")}`);
      }
      known.current = new Set(st.pertanyaan.map((q) => q.id));
      setState(st);
    } catch (e) {
      if (e instanceof Error && e.message.includes("login")) router.replace("/admin/login");
    }
  }, [awal.sesi.id, toast, router]);
  const muatNanti = useDebounced(muat, 300);
  useSesiChannel(sesi.kode, { onUbah: () => muatNanti() }, 8000);

  function patchQ(id: string, body: Record<string, unknown>, pesan?: string, key = `q-${id}`) {
    return run(key, async () => {
      try { await api(`/api/admin/pertanyaan/${id}`, "PATCH", body); await muat(); if (pesan) toast(pesan); }
      catch (e) { toast(e instanceof Error ? e.message : "Gagal."); }
    });
  }
  function patchSesi(body: Record<string, unknown>, pesan: string | undefined, key: string) {
    return run(key, async () => {
      try { await api(`/api/admin/sesi/${sesi.id}`, "PATCH", body); await muat(); if (pesan) toast(pesan); }
      catch (e) { toast(e instanceof Error ? e.message : "Gagal."); }
    });
  }

  const jawabanSaya = (q: Pertanyaan) => drafts[q.id] ?? q.jawaban_admin ?? "";
  const denganDraft = (q: Pertanyaan): Pertanyaan => ({ ...q, jawaban_admin: jawabanSaya(q) });

  function ketik(q: Pertanyaan, v: string) {
    setDrafts((d) => ({ ...d, [q.id]: v }));
    setSimpanStatus((s) => ({ ...s, [q.id]: "Menyimpan…" }));
    if (q.perlu_dicek) setState((st) => ({ ...st, pertanyaan: st.pertanyaan.map((x) => x.id === q.id ? { ...x, perlu_dicek: false } : x) }));
    clearTimeout(timers.current[q.id]);
    timers.current[q.id] = setTimeout(async () => {
      try {
        await api(`/api/admin/pertanyaan/${q.id}`, "PATCH", { jawaban_admin: v });
        setSimpanStatus((s) => ({ ...s, [q.id]: "Tersimpan" }));
      } catch {
        setSimpanStatus((s) => ({ ...s, [q.id]: "Gagal menyimpan" }));
      }
    }, 700);
  }

  function salinKeSaya(q: Pertanyaan) {
    ketik(q, q.jawaban_ai ?? "");
    patchQ(q.id, { pilihan_word: "admin" }, undefined, `pick-${q.id}-admin`);
    toast("Jawaban AI disalin ke Versi saya. Silakan edit.");
    setTimeout(() => document.getElementById(`saya-${q.id}`)?.focus(), 50);
  }

  function regen(q: Pertanyaan) {
    return run(`ai-${q.id}`, async () => {
      try { await api(`/api/admin/pertanyaan/${q.id}/ai`, "POST"); await muat(); }
      catch (e) { toast(e instanceof Error ? e.message : "Gagal."); }
    });
  }

  function aksi(a: string, extra: Record<string, unknown> = {}, pesan?: string) {
    return run(`aksi-${a}`, async () => {
      try { await api(`/api/admin/sesi/${sesi.id}/aksi`, "POST", { aksi: a, ...extra }); await muat(); if (pesan) toast(pesan); }
      catch (e) { toast(e instanceof Error ? e.message : "Gagal."); }
    });
  }

  function simpanData() {
    if (!modal || modal.jenis !== "data") return;
    setGalatModal("");
    return run("modal", async () => { try {
      if (modal.id) await api(`/api/admin/pertanyaan/${modal.id}`, "PATCH", { data: modal.form });
      else await api(`/api/admin/sesi/${sesi.id}/aksi`, "POST", { aksi: "tambah", ...modal.form });
      toast(modal.id ? "Data pertanyaan disimpan." : "Pertanyaan ditambahkan.");
      await muat();
      setModal(null);
    } catch (e) { setGalatModal(e instanceof Error ? e.message : "Gagal menyimpan."); } });
  }

  const link = `${origin}/${sesi.kode}`;
  const tampil = state.pertanyaan.filter(masukRekap);
  const siap = tampil.filter((q) => versiTerpilih(denganDraft(q))).length;
  const totalDukungan = tampil.reduce((s, q) => s + q.jumlah_dukungan, 0);

  return (
    <main className="p-wrap">
      <AdminNav crumb={<>Semua sesi / {sesi.kode}</>} />
      <div className="p-head">
        <div>
          <span className="label">{sesi.matkul} · {sesi.kelompok_penyaji} · {tanggalIndo(sesi.tanggal)}</span>
          <h1>{sesi.topik}</h1>
        </div>
        <div className="stats">
          <div className="stat a"><b>{tampil.length}</b><span>pertanyaan</span></div>
          <div className="stat b"><b>{siap}</b><span>siap Word</span></div>
          <div className="stat c"><b>{totalDukungan}</b><span>dukungan</span></div>
        </div>
      </div>

      <div className="toolbar">
        <button className="switch" aria-pressed={sesi.status === "dibuka"} aria-busy={is("status")} disabled={is("status")}
          onClick={() => patchSesi({ status: sesi.status === "dibuka" ? "ditutup" : "dibuka" },
            sesi.status === "dibuka" ? "Sesi ditutup. Form tidak menerima pertanyaan." : "Sesi dibuka. Teman bisa mengirim pertanyaan.", "status")}>
          <span className="tr" />{sesi.status === "dibuka" ? "Sesi dibuka" : sesi.status === "draf" ? "Draf · klik untuk membuka" : "Sesi ditutup"}
        </button>
        <span className="url">{link.replace(/^https?:\/\//, "") || `/${sesi.kode}`}</span>
        <button className="linkish" onClick={() => { navigator.clipboard?.writeText(link); toast("Link disalin. Tempel ke grup WA."); }}>Salin link</button>
        <button className="linkish" onClick={() => setModal({ jenis: "qr" })}>QR</button>
        <Link className="linkish" href={`/admin/sesi/${sesi.id}/atur`}>Atur sesi</Link>
        <span className="grow" />
        <button className="btn sm" aria-busy={is("aksi-pakai-ai-semua")} disabled={is("aksi-pakai-ai-semua")} onClick={() => aksi("pakai-ai-semua", {}, "Semua pertanyaan memakai jawaban AI.")}>Pakai AI untuk semua</button>
        <a className="btn sm sun" href={`/${sesi.kode}/layar`} target="_blank" rel="noreferrer">Buka layar presentasi ↗</a>
        <Link className="btn sm dark" href={`/admin/sesi/${sesi.id}/word`}>Pratinjau &amp; unduh Word</Link>
      </div>

      {state.pertanyaan.length === 0 && (
        <div className="empty-panel" style={{ marginBottom: 22 }}>
          <b>Belum ada pertanyaan</b>
          {sesi.status === "dibuka" ? "Bagikan link atau tampilkan QR. Pertanyaan muncul di sini secara langsung." : "Buka sesi dulu supaya teman bisa mengirim pertanyaan."}
        </div>
      )}

      {state.pertanyaan.map((q) => {
        const spot = q.id === sesi.sorotan_id;
        const qd = denganDraft(q);
        const pilih = versiTerpilih(qd);
        const col = (key: PilihanWord, judul: string, body: React.ReactNode, acts: React.ReactNode, bisa: boolean) => (
          <div className={`col ${key === "admin" ? "me" : key === "penanya" ? "pen" : "ai"}`}>
            <div className="col-h"><span className="label">{judul}</span>{pilih === key && masukRekap(q) && <span className="stamp">MASUK WORD</span>}</div>
            {body}
            <div className="col-f">
              <button className={`pick ${pilih === key ? "on" : ""}`} disabled={!bisa || is(`pick-${q.id}-${key}`)} aria-pressed={pilih === key} aria-busy={is(`pick-${q.id}-${key}`)}
                onClick={() => patchQ(q.id, { pilihan_word: key }, undefined, `pick-${q.id}-${key}`)}><span className="bx" />Masuk Word</button>
              <span className="acts">{acts}</span>
            </div>
          </div>
        );
        return (
          <article key={q.id} className={`pq ${!masukRekap(q) ? "dim" : ""} ${fresh.has(q.id) ? "fresh" : ""} ${spot ? "spot" : ""}`} aria-busy={is(`q-${q.id}`) || any(`pick-${q.id}`) || is(`spot-${q.id}`, `ai-${q.id}`)}>
            {(is(`q-${q.id}`) || any(`pick-${q.id}`) || is(`spot-${q.id}`, `ai-${q.id}`)) && <div className="busy-bar" />}
            <div className="pq-top">
              <span className="pq-no">{String(q.nomor).padStart(2, "0")}</span>
              <Avatar i={q.avatar} size={56} />
              <div>
                <div className="pq-who">
                  <b>{q.nama}</b><span>{q.nim}</span><span>Kel. {q.kelompok}</span><span>{jam(q.dibuat_pada)}</span>
                  {q.tampil_sebagai === "avatar" && <span className="chip">tampil sebagai {AVATARS[q.avatar].name}</span>}
                  {q.diedit && <span className="chip">diedit penanya</span>}
                  {q.ditarik && <span className="chip live">Ditarik penanya</span>}
                  {q.disembunyikan && <span className="chip muted">Disembunyikan</span>}
                  {q.sudah_dijawab && <span className="chip done">Sudah dijawab</span>}
                </div>
                <p className="pq-text">{q.pertanyaan}</p>
              </div>
              <div className="pq-side">
                <span className="chip sun">🔥 {q.jumlah_dukungan} penasaran</span>
                {masukRekap(q) && (spot
                  ? <button className="chip live" aria-busy={is(`spot-${q.id}`)} disabled={is(`spot-${q.id}`)} onClick={() => patchSesi({ sorotan_id: null }, "Layar kembali ke tampilan antrean.", `spot-${q.id}`)}>Di layar · turunkan</button>
                  : <button className="btn sm" onClick={() => patchSesi({ sorotan_id: q.id }, `Pertanyaan ${String(q.nomor).padStart(2, "0")} tampil besar di layar.`, `spot-${q.id}`)} aria-busy={is(`spot-${q.id}`)} disabled={is(`spot-${q.id}`)}>Tampilkan di layar</button>)}
                <span className="menu-wrap">
                  <button className="linkish" onClick={() => setMenu(menu === q.id ? null : q.id)} aria-expanded={menu === q.id}>••• lainnya</button>
                  {menu === q.id && (
                    <span className="menu">
                      <button onClick={() => { setMenu(null); patchQ(q.id, { sudah_dijawab: !q.sudah_dijawab }); }}>{q.sudah_dijawab ? "Tandai belum dijawab" : "Tandai sudah dijawab"}</button>
                      <button onClick={() => { setMenu(null); setGalatModal(""); setModal({ jenis: "data", id: q.id, form: { nama: q.nama, nim: q.nim, kelompok: q.kelompok, avatar: q.avatar, tampil_sebagai: q.tampil_sebagai, pertanyaan: q.pertanyaan, jawaban_penanya: q.jawaban_penanya ?? "" } }); }}>Ubah pertanyaan / data penanya</button>
                      {q.ditarik
                        ? <button onClick={() => { setMenu(null); patchQ(q.id, { ditarik: false }, "Pertanyaan dikembalikan."); }}>Kembalikan pertanyaan</button>
                        : <button onClick={() => { setMenu(null); patchQ(q.id, { disembunyikan: !q.disembunyikan }, q.disembunyikan ? "Ditampilkan lagi." : "Disembunyikan dari feed, layar, dan Word."); }}>{q.disembunyikan ? "Tampilkan lagi" : "Sembunyikan (spam/dobel)"}</button>}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="cols">
              {col("ai", "Jawaban AI",
                q.status_ai === "selesai" && q.jawaban_ai ? <div className="col-body">{q.jawaban_ai}</div>
                  : q.status_ai === "gagal" ? <span className="st fail">Gagal: {q.ai_galat || "coba lagi."}</span>
                  : <><span className="st work">AI sedang menjawab…</span><div className="skel"><i /><i /><i /><i /></div></>,
                q.status_ai === "gagal" ? <button className="linkish" aria-busy={is(`ai-${q.id}`)} disabled={is(`ai-${q.id}`)} onClick={() => regen(q)}>Coba lagi</button>
                  : q.status_ai === "selesai" ? <><button className="linkish" aria-busy={is(`ai-${q.id}`)} disabled={is(`ai-${q.id}`)} onClick={() => regen(q)}>Buat ulang</button><button className="linkish" onClick={() => salinKeSaya(q)}>Salin ke Saya</button></> : null,
                !!q.jawaban_ai)}
              {col("penanya", "Versi penanya",
                q.jawaban_penanya ? <div className="col-body">{q.jawaban_penanya}</div> : <div className="col-body empty">Penanya tidak mengisi.</div>,
                null, !!q.jawaban_penanya?.trim())}
              {col("admin", "Versi saya",
                <>
                  {q.perlu_dicek && <div className="flag">Pertanyaan diubah penanya. Cek lagi jawabanmu.</div>}
                  <textarea id={`saya-${q.id}`} value={jawabanSaya(q)} onChange={(e) => ketik(q, e.target.value)} placeholder="Tulis jawabanmu sendiri…" maxLength={5000} />
                </>,
                <span className="saved">{simpanStatus[q.id] ?? (q.jawaban_admin ? "Tersimpan" : "")}</span>,
                !!jawabanSaya(q).trim())}
            </div>
          </article>
        );
      })}

      <div className="p-add">
        <span>Ada pertanyaan lisan atau dari WA?</span>
        <button className="btn sm" onClick={() => { setGalatModal(""); setModal({ jenis: "data", id: null, form: { ...kosong } }); }}>+ Tambah pertanyaan manual</button>
      </div>

      {modal?.jenis === "qr" && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ textAlign: "center" }} role="dialog" aria-label="Kode QR">
            <span className="label">Pindai untuk bertanya</span>
            <QR className="qr-big" text={link} />
            <div className="url" style={{ display: "inline-block", fontSize: 18 }}>{link.replace(/^https?:\/\//, "")}</div>
            <div className="acts" style={{ justifyContent: "center" }}><button className="btn" onClick={() => setModal(null)}>Tutup</button></div>
          </div>
        </div>
      )}

      {modal?.jenis === "data" && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" role="dialog" aria-label={modal.id ? "Ubah pertanyaan" : "Tambah pertanyaan"}>
            <h2>{modal.id ? "Ubah pertanyaan" : "Tambah pertanyaan manual"}</h2>
            {(() => {
              const f = modal.form;
              const set = (p: Partial<DataForm>) => setModal({ ...modal, form: { ...f, ...p } });
              return (
                <>
                  <div className="fld"><span className="lbl">Avatar</span><AvatarPicker value={f.avatar} onChange={(a) => set({ avatar: a })} /></div>
                  <div className="fld"><label htmlFor="m-nama">Nama</label><input id="m-nama" value={f.nama} maxLength={80} onChange={(e) => set({ nama: e.target.value })} /></div>
                  <div className="fld two">
                    <div><label htmlFor="m-nim">NIM</label><input id="m-nim" inputMode="numeric" value={f.nim} maxLength={20} onChange={(e) => set({ nim: e.target.value.replace(/\D/g, "") })} /></div>
                    <div><label htmlFor="m-kel">Kelompok</label><input id="m-kel" value={f.kelompok} maxLength={20} onChange={(e) => set({ kelompok: e.target.value })} /></div>
                  </div>
                  <div className="fld"><label htmlFor="m-q">Pertanyaan</label><textarea id="m-q" rows={4} value={f.pertanyaan} maxLength={1000} onChange={(e) => set({ pertanyaan: e.target.value })} /></div>
                  <div className="fld"><label htmlFor="m-j">Jawaban versi penanya <span>opsional</span></label><textarea id="m-j" rows={3} value={f.jawaban_penanya} maxLength={3000} onChange={(e) => set({ jawaban_penanya: e.target.value })} /></div>
                  <div className="fld"><span className="lbl">Tampil sebagai</span>
                    <div className="seg">
                      <button type="button" aria-pressed={f.tampil_sebagai === "nama"} onClick={() => set({ tampil_sebagai: "nama" })}>Nama asli</button>
                      <button type="button" aria-pressed={f.tampil_sebagai === "avatar"} onClick={() => set({ tampil_sebagai: "avatar" })}>{AVATARS[f.avatar].name}</button>
                    </div>
                  </div>
                </>
              );
            })()}
            {galatModal && <div className="galat" style={{ marginTop: 14 }} role="alert">{galatModal}</div>}
            <div className="acts">
              <button className="btn" onClick={() => setModal(null)}>Batal</button>
              <button className="btn go" onClick={simpanData} aria-busy={is("modal")} disabled={is("modal")}>{is("modal") ? "Menyimpan…" : modal.id ? "Simpan" : "Tambahkan"}</button>
            </div>
          </div>
        </div>
      )}
      {toastNode}
    </main>
  );
}
