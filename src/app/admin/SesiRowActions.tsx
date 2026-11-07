"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function SesiRowActions({ id, topik }: { id: string; topik: string }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);

  async function duplikat() {
    setSibuk(true);
    try {
      const r = await api<{ id: string }>("/api/admin/sesi", "POST", { dariId: id });
      router.push(`/admin/sesi/${r.id}/atur`);
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal."); setSibuk(false); }
  }
  async function hapus() {
    if (!confirm(`Hapus sesi "${topik}" beserta semua pertanyaannya? Ini tidak bisa dibatalkan.`)) return;
    setSibuk(true);
    try { await api(`/api/admin/sesi/${id}`, "DELETE"); router.refresh(); }
    catch (e) { alert(e instanceof Error ? e.message : "Gagal."); }
    setSibuk(false);
  }
  return (
    <>
      <button className="btn sm" onClick={duplikat} disabled={sibuk} aria-busy={sibuk}>{sibuk ? "Memproses…" : "Duplikat"}</button>
      <button className="linkish danger" onClick={hapus} disabled={sibuk}>Hapus</button>
    </>
  );
}
