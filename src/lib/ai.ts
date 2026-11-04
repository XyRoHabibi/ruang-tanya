import "server-only";
import { db } from "./supabase/admin";
import { kabari } from "./broadcast";
import type { Pertanyaan, Sesi } from "./types";

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";
const CADANGAN = () => process.env.GEMINI_MODEL_CADANGAN || "gemini-3.5-flash-lite";

function systemPrompt(s: Sesi) {
  return [
    `Kamu membantu kelompok mahasiswa yang baru saja presentasi di mata kuliah ${s.matkul} dengan topik "${s.topik}".`,
    "Tulis jawaban atas pertanyaan teman sekelas dalam bahasa Indonesia yang baku, jelas, dan mudah dipahami, seolah ditulis oleh kelompok penyaji.",
    "Aturan:",
    "- Singkat dan padat: 40 sampai 90 kata, satu paragraf.",
    "- Kalimat pertama langsung menjawab inti pertanyaan. Jangan membuka dengan salam, ucapan terima kasih, pujian terhadap pertanyaan (misalnya \"Pertanyaan yang bagus\"), atau mengulang pertanyaan. Jangan menutup dengan basa-basi atau ajakan.",
    "- Sebut dalil (ayat Al-Qur'an, hadits, atau pendapat ulama) hanya jika relevan DAN kamu yakin rujukannya benar. Jangan pernah mengarang nomor surat, nomor ayat, perawi, atau nomor hadits. Jika ragu, jelaskan tanpa menyebut nomor rujukan.",
    "- Untuk masalah khilafiyah, sebutkan secara singkat dan berimbang bahwa ada perbedaan pendapat.",
    "- Bila ada materi presentasi, utamakan isi materi itu.",
    "- Teks biasa saja: tanpa markdown, tanpa judul, tanpa daftar berpoin, tanpa tanda bintang.",
  ].join("\n");
}

function userPrompt(s: Sesi, q: Pertanyaan) {
  const materi = s.materi?.trim() ? `Materi presentasi:\n"""\n${s.materi.trim().slice(0, 12000)}\n"""\n\n` : "";
  return `${materi}Pertanyaan dari teman sekelas:\n"""\n${q.pertanyaan}\n"""\n\nTulis jawabannya.`;
}

class AIError extends Error {
  constructor(msg: string, public retry: boolean) { super(msg); }
}

async function panggilGemini(model: string, system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AIError("GEMINI_API_KEY belum diatur.", false);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const retry = res.status === 429 || res.status >= 500 || res.status === 404;
    const pesan = res.status === 429 ? "Kuota Gemini sementara habis." : `Gemini menolak (${res.status}).`;
    console.error("Gemini", model, res.status, body.slice(0, 300));
    throw new AIError(pesan, retry);
  }
  const json = await res.json();
  const parts: { text?: string; thought?: boolean }[] = json?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join("").trim();
  if (!text) throw new AIError("Gemini tidak mengembalikan jawaban.", true);
  return buangBasaBasi(text.replace(/\*\*?|__|^#+\s*/gm, "").trim());
}

/** Jaga-jaga bila model tetap membuka dengan basa-basi: buang kalimat pembuka semacam itu. */
const PEMBUKA = /^(terima ?kasih|makasih|pertanyaan (yang |ini )?(sangat )?(bagus|menarik|penting|kritis)|wah|baik[,!]|oke[,!]|halo|hai|assalamu['’]?alaikum)[^.!?\n]*[.!?]+\s*/i;
const PENUTUP = /\s*(semoga (jawaban ini )?(bermanfaat|membantu|menjawab|dapat dipahami)|terima ?kasih)[^.!?\n]*[.!?]*\s*$/i;
function buangBasaBasi(t: string) {
  let s = t;
  for (let i = 0; i < 3 && PEMBUKA.test(s); i++) s = s.replace(PEMBUKA, "");
  for (let i = 0; i < 2 && PENUTUP.test(s); i++) s = s.replace(PENUTUP, "");
  s = s.trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : t;
}

/**
 * Membuat jawaban AI untuk satu pertanyaan. Aman dipanggil berkali-kali:
 * hanya satu proses yang bisa "mengambil" pertanyaan berstatus menunggu.
 */
export async function jawabPertanyaan(id: string) {
  const { data: ambil } = await db()
    .from("pertanyaan")
    .update({ status_ai: "memproses", ai_galat: null })
    .eq("id", id)
    .eq("status_ai", "menunggu")
    .select("*")
    .maybeSingle();
  if (!ambil) return;
  const q = ambil as Pertanyaan;
  const { data: s } = await db().from("sesi").select("*").eq("id", q.sesi_id).single();
  const sesi = s as Sesi;
  await kabari(sesi.kode);

  const system = systemPrompt(sesi), user = userPrompt(sesi, q);
  let galat = "Gagal membuat jawaban.";
  let percobaan = q.ai_percobaan;
  for (let i = 0; i < 3; i++) {
    percobaan++;
    for (const model of [MODEL(), CADANGAN()]) {
      try {
        const jawaban = await panggilGemini(model, system, user);
        // Jangan menimpa bila pertanyaan diedit lagi selama AI bekerja.
        const { data: masih } = await db().from("pertanyaan").select("pertanyaan").eq("id", id).single();
        if (masih?.pertanyaan !== q.pertanyaan) return;
        await db().from("pertanyaan").update({
          jawaban_ai: jawaban, status_ai: "selesai", ai_model: model, ai_percobaan: percobaan, ai_galat: null,
        }).eq("id", id);
        await kabari(sesi.kode);
        return;
      } catch (e) {
        galat = e instanceof Error ? e.message : String(e);
        if (e instanceof AIError && !e.retry) { i = 3; break; }
      }
    }
    if (i < 2) await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
  }
  await db().from("pertanyaan").update({ status_ai: "gagal", ai_percobaan: percobaan, ai_galat: galat }).eq("id", id);
  await kabari(sesi.kode);
}

/** Proses ulang pertanyaan yang tertinggal (misalnya server mati di tengah jalan). */
export async function prosesTertinggal(sesiId: string) {
  const batas = new Date(Date.now() - 2 * 60_000).toISOString();
  await db().from("pertanyaan").update({ status_ai: "menunggu" })
    .eq("sesi_id", sesiId).eq("status_ai", "memproses").lt("diubah_pada", batas);
  const { data } = await db().from("pertanyaan").select("id")
    .eq("sesi_id", sesiId).eq("status_ai", "menunggu").eq("ditarik", false).limit(5);
  for (const r of data ?? []) await jawabPertanyaan(r.id);
}
