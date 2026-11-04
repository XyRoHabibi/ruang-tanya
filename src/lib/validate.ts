export const RESERVED = new Set(["admin", "api", "login", "teman", "layar", "_next", "favicon.ico"]);

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+\n/g, "\n").trim().slice(0, max) : "";

export const isDevice = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(v);

export interface DataPenanya {
  nama: string;
  nim: string;
  kelompok: string;
  avatar: number;
  tampil_sebagai: "nama" | "avatar";
  pertanyaan: string;
  jawaban_penanya: string | null;
}

export function validasiPenanya(b: Record<string, unknown>): { ok: true; data: DataPenanya } | { ok: false; galat: string } {
  const nama = clean(b.nama, 80);
  const nim = clean(b.nim, 20).replace(/\s/g, "");
  const kelompok = clean(b.kelompok, 20);
  const pertanyaan = clean(b.pertanyaan, 1000);
  const jawab = clean(b.jawaban_penanya, 3000);
  const avatar = Number(b.avatar);
  const tampil = b.tampil_sebagai === "avatar" ? "avatar" : "nama";
  if (nama.length < 2) return { ok: false, galat: "Nama wajib diisi." };
  if (!/^\d{5,20}$/.test(nim)) return { ok: false, galat: "NIM hanya angka, 5 sampai 20 digit." };
  if (!kelompok) return { ok: false, galat: "Kelompok wajib diisi." };
  if (pertanyaan.length < 10) return { ok: false, galat: "Pertanyaan minimal 10 karakter." };
  if (!Number.isInteger(avatar) || avatar < 0 || avatar > 11) return { ok: false, galat: "Avatar tidak valid." };
  return { ok: true, data: { nama, nim, kelompok, avatar, tampil_sebagai: tampil, pertanyaan, jawaban_penanya: jawab || null } };
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "sesi";
}
