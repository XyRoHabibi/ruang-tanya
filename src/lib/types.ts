export type StatusSesi = "draf" | "dibuka" | "ditutup";
export type StatusAI = "menunggu" | "memproses" | "selesai" | "gagal";
export type PilihanWord = "ai" | "penanya" | "admin";
export type TampilSebagai = "nama" | "avatar";

export interface Sesi {
  id: string;
  kode: string;
  topik: string;
  matkul: string;
  kelompok_penyaji: string;
  tanggal: string;
  materi: string | null;
  status: StatusSesi;
  sorotan_id: string | null;
  dibuat_pada: string;
}

export interface Pertanyaan {
  id: string;
  sesi_id: string;
  nomor: number;
  nama: string;
  nim: string;
  kelompok: string;
  avatar: number;
  tampil_sebagai: TampilSebagai;
  pertanyaan: string;
  jawaban_penanya: string | null;
  jawaban_ai: string | null;
  status_ai: StatusAI;
  ai_percobaan: number;
  ai_model: string | null;
  ai_galat: string | null;
  jawaban_admin: string | null;
  pilihan_word: PilihanWord | null;
  jumlah_dukungan: number;
  sudah_dijawab: boolean;
  disembunyikan: boolean;
  ditarik: boolean;
  diedit: boolean;
  perlu_dicek: boolean;
  perangkat: string;
  ip: string | null;
  dibuat_pada: string;
  diubah_pada: string;
}

/** Data sesi yang boleh dilihat publik. */
export interface SesiPublik {
  id: string;
  kode: string;
  topik: string;
  matkul: string;
  kelompok_penyaji: string;
  tanggal: string;
  status: StatusSesi;
  sorotan_id: string | null;
}

/** Data pertanyaan yang boleh dilihat publik (tanpa NIM, tanpa jawaban). */
export interface PertanyaanPublik {
  id: string;
  nomor: number;
  avatar: number;
  nama_tampil: string;
  pakai_avatar: boolean;
  kelompok: string;
  pertanyaan: string;
  dukungan: number;
  sudah_dijawab: boolean;
  diedit: boolean;
  dibuat_pada: string;
  /** Hanya terisi untuk perangkat pemilik. */
  milik: boolean;
  didukung: boolean;
  /** Data pribadi hanya dikirim ke pemiliknya sendiri, untuk keperluan edit. */
  pribadi?: { nama: string; nim: string; kelompok: string; tampil_sebagai: TampilSebagai; jawaban_penanya: string };
}

export interface StatePublik {
  sesi: SesiPublik;
  pertanyaan: PertanyaanPublik[];
}

export type AdminState = { sesi: Sesi; pertanyaan: Pertanyaan[] };
