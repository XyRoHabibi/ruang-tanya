"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AlignmentType, Document, Packer, PageOrientation, Paragraph, ShadingType, Table, TableCell, TableRow,
  TabStopType, TextRun, VerticalAlign, WidthType,
} from "docx";
import type { AdminState, Sesi } from "@/lib/types";
import { tanggalWord } from "@/lib/client";
import { masukRekap, teksTerpilih, versiTerpilih } from "@/lib/word";

type Baris = { no: number; nama: string; nim: string; kelompok: string; pertanyaan: string; jawaban: string };

const LEBAR = [600, 1900, 1500, 1100, 3800, 5670]; // twip, total 14570 = A4 landscape - margin 2 cm
const JUDUL = ["No", "Nama", "NIM", "Kelompok", "Pertanyaan", "Jawaban"];

function namaFile(s: Sesi) {
  const t = s.topik.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
  return `Rekap_Tanya_Jawab_${t || "Sesi"}_${s.tanggal}.docx`;
}

function paragraf(teks: string, align: (typeof AlignmentType)[keyof typeof AlignmentType], bold = false) {
  return (teks || "").split(/\n+/).map((line) => new Paragraph({ alignment: align, children: [new TextRun({ text: line, bold })] }));
}

async function buatDocx(s: Sesi, rows: Baris[]) {
  const sel = (teks: string, i: number, header = false) => new TableCell({
    width: { size: LEBAR[i], type: WidthType.DXA },
    verticalAlign: header ? VerticalAlign.CENTER : VerticalAlign.TOP,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: header ? { type: ShadingType.CLEAR, color: "auto", fill: "D9E2F3" } : undefined,
    children: paragraf(teks, header || i === 0 || i === 2 || i === 3 ? AlignmentType.CENTER : i >= 4 ? AlignmentType.JUSTIFIED : AlignmentType.LEFT, header),
  });

  const ident: [string, string][] = [
    ["Mata Kuliah", s.matkul], ["Topik", s.topik], ["Kelompok Penyaji", s.kelompok_penyaji],
    ["Tanggal", tanggalWord(s.tanggal)], ["Jumlah Pertanyaan", String(rows.length)],
  ];

  const doc = new Document({
    creator: "Ruang Tanya",
    title: `Rekapitulasi Sesi Tanya Jawab - ${s.topik}`,
    styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE, width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: "REKAPITULASI SESI TANYA JAWAB", bold: true, size: 28 })] }),
        ...ident.map(([k, v]) => new Paragraph({
          tabStops: [{ type: TabStopType.LEFT, position: 2600 }],
          children: [new TextRun({ text: k, bold: true }), new TextRun({ text: `\t: ${v}` })],
        })),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: LEBAR.reduce((a, b) => a + b, 0), type: WidthType.DXA },
          columnWidths: LEBAR,
          rows: [
            new TableRow({ tableHeader: true, children: JUDUL.map((j, i) => sel(j, i, true)) }),
            ...rows.map((r) => new TableRow({
              cantSplit: false,
              children: [String(r.no), r.nama, r.nim, r.kelompok, r.pertanyaan, r.jawaban].map((t, i) => {
                const c = sel(t, i);
                return c;
              }),
            })),
          ],
        }),
      ],
    }],
  });
  return Packer.toBlob(doc);
}

export default function WordClient({ state }: { state: AdminState }) {
  const { sesi } = state;
  const [sibuk, setSibuk] = useState(false);
  const daftar = state.pertanyaan.filter(masukRekap);
  const kurang = daftar.filter((q) => !versiTerpilih(q));
  const rows: Baris[] = daftar.map((q, i) => ({
    no: i + 1, nama: q.nama, nim: q.nim, kelompok: q.kelompok, pertanyaan: q.pertanyaan, jawaban: teksTerpilih(q),
  }));

  async function unduh() {
    setSibuk(true);
    try {
      const blob = await buatDocx(sesi, rows);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile(sesi);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally { setSibuk(false); }
  }

  return (
    <div className="word-root">
      <div className="w-bar">
        <div><span className="label">Pratinjau</span><h2>{namaFile(sesi)}</h2></div>
        <div className="r">
          <Link className="btn" href={`/admin/sesi/${sesi.id}`}>← Panel</Link>
          <button className="btn go" onClick={unduh} disabled={sibuk || rows.length === 0}>{sibuk ? "Membuat…" : "Unduh .docx"}</button>
        </div>
      </div>
      <div className={`warn ${kurang.length ? "" : "ok"}`}>
        {rows.length === 0 ? <span><b>Belum ada pertanyaan.</b></span>
          : kurang.length ? <>
            <span><b>{kurang.length} pertanyaan belum punya jawaban</b> (nomor {kurang.map((q) => String(q.nomor).padStart(2, "0")).join(", ")}). Kolom jawabannya akan kosong di Word.</span>
            <Link className="btn sm" href={`/admin/sesi/${sesi.id}`}>Lengkapi di panel</Link>
          </> : <span><b>Semua {rows.length} pertanyaan sudah punya jawaban.</b> Siap diunduh.</span>}
      </div>
      <div className="page">
        <h3>REKAPITULASI SESI TANYA JAWAB</h3>
        <div className="ident">
          <div><b>Mata Kuliah</b><span>: {sesi.matkul}</span></div>
          <div><b>Topik</b><span>: {sesi.topik}</span></div>
          <div><b>Kelompok Penyaji</b><span>: {sesi.kelompok_penyaji}</span></div>
          <div><b>Tanggal</b><span>: {tanggalWord(sesi.tanggal)}</span></div>
          <div><b>Jumlah Pertanyaan</b><span>: {rows.length}</span></div>
        </div>
        <table>
          <thead><tr>{JUDUL.map((j, i) => <th key={j} style={{ width: `${(LEBAR[i] / 145.7).toFixed(1)}%` }}>{j}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.no}>
                <td className="c">{r.no}</td><td>{r.nama}</td><td className="c">{r.nim}</td><td className="c">{r.kelompok}</td>
                <td className="j">{r.pertanyaan}</td>
                {r.jawaban ? <td className="j">{r.jawaban}</td> : <td className="miss">Belum ada jawaban terpilih</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
