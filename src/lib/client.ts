"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { browserClient } from "./supabase/browser";

export const channelName = (kode: string) => `ruang-${kode}`;

export function getDeviceId(): string {
  const k = "rt-perangkat";
  let id = localStorage.getItem(k);
  if (!id || !/^[a-zA-Z0-9-]{8,64}$/.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(k, id);
  }
  return id;
}

export interface Profil { nama: string; nim: string; kelompok: string; avatar: number; tampil_sebagai: "nama" | "avatar" }

export function loadProfil(): Profil | null {
  try {
    const p = JSON.parse(localStorage.getItem("rt-profil") || "null");
    return p && typeof p.nama === "string" ? p : null;
  } catch {
    return null;
  }
}
export const saveProfil = (p: Profil) => localStorage.setItem("rt-profil", JSON.stringify(p));
export const clearProfil = () => localStorage.removeItem("rt-profil");

export async function api<T = { ok: true }>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.galat || `Terjadi galat (${res.status}).`);
  return json as T;
}

/**
 * Berlangganan kanal realtime sesi. `onUbah` dipanggil saat data berubah,
 * `onReaksi` saat ada reaksi. Ada juga polling cadangan bila realtime putus.
 */
export function useSesiChannel(
  kode: string | null,
  handlers: { onUbah?: (info: Record<string, unknown>) => void; onReaksi?: (e: string) => void },
  pollMs = 15000,
): React.RefObject<RealtimeChannel | null> {
  const ref = useRef<RealtimeChannel | null>(null);
  const h = useRef(handlers);
  useEffect(() => { h.current = handlers; });

  useEffect(() => {
    if (!kode) return;
    const sb = browserClient();
    const ch = sb.channel(channelName(kode), { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "ubah" }, (m) => h.current.onUbah?.(m.payload ?? {}))
      .on("broadcast", { event: "reaksi" }, (m) => {
        const e = m.payload?.e;
        if (typeof e === "string" && REAKSI.includes(e)) h.current.onReaksi?.(e);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") h.current.onUbah?.({ sambung: true });
      });
    ref.current = ch;
    const poll = setInterval(() => h.current.onUbah?.({ poll: true }), pollMs);
    const vis = () => { if (document.visibilityState === "visible") h.current.onUbah?.({ kembali: true }); };
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", vis);
      sb.removeChannel(ch);
      ref.current = null;
    };
  }, [kode, pollMs]);
  return ref;
}

const noop = () => () => {};
/** origin situs (mis. https://qna.domainmu.com); string kosong saat render di server. */
export const useOrigin = () => useSyncExternalStore(noop, () => window.location.origin, () => "");

export const REAKSI = ["👏", "🔥", "🤯", "😂", "🤲"];

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function tanggalIndo(iso: string, pendek = false) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (pendek) return `${HARI[dt.getUTCDay()].slice(0, 3)}, ${d} ${BULAN[m - 1].slice(0, 3)}`;
  return `${HARI[dt.getUTCDay()]}, ${d} ${BULAN[m - 1]} ${y}`;
}
export const tanggalWord = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
};
export const jam = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export function useDebounced<T extends unknown[]>(fn: (...a: T) => void, ms: number) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const f = useRef(fn);
  useEffect(() => { f.current = fn; });
  return (...a: T) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => f.current(...a), ms);
  };
}
