import "server-only";
import { db } from "./supabase/admin";

export const channelName = (kode: string) => `ruang-${kode}`;

/**
 * Memberi tahu semua layar (feed, layar presentasi, panel admin) bahwa data sesi berubah.
 * Isinya sengaja kosong: setiap layar mengambil ulang data yang boleh ia lihat.
 */
export async function kabari(kode: string, info: Record<string, unknown> = {}) {
  try {
    const ch = db().channel(channelName(kode));
    await ch.httpSend("ubah", { t: Date.now(), ...info });
    await db().removeChannel(ch);
  } catch (e) {
    console.error("broadcast gagal", e);
  }
}
