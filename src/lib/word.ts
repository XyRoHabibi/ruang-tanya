import type { PilihanWord, Pertanyaan } from "./types";

/** Versi jawaban yang masuk Word: pilihan admin, atau aturan bawaan (Saya > AI). */
export function versiTerpilih(q: Pertanyaan): PilihanWord | null {
  const ada = { admin: !!q.jawaban_admin?.trim(), ai: !!q.jawaban_ai?.trim(), penanya: !!q.jawaban_penanya?.trim() };
  if (q.pilihan_word && ada[q.pilihan_word]) return q.pilihan_word;
  if (ada.admin) return "admin";
  if (ada.ai) return "ai";
  return null;
}

export function teksTerpilih(q: Pertanyaan): string {
  const v = versiTerpilih(q);
  return v === "admin" ? q.jawaban_admin ?? "" : v === "ai" ? q.jawaban_ai ?? "" : v === "penanya" ? q.jawaban_penanya ?? "" : "";
}

export const masukRekap = (q: Pertanyaan) => !q.disembunyikan && !q.ditarik;
