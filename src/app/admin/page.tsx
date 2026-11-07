import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/AdminNav";
import { SiteFooter } from "@/components/SiteFooter";
import type { Sesi } from "@/lib/types";
import { SesiRowActions } from "./SesiRowActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Semua sesi · Ruang Tanya" };

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const tgl = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${BULAN[m - 1]} ${y}`; };

export default async function AdminHome() {
  if (!(await getAdmin())) redirect("/admin/login");
  // Tabel sesi & pertanyaan punya dua relasi (pemilik dan sorotan), jadi relasinya disebut eksplisit.
  const { data, error } = await db().from("sesi")
    .select("*, pertanyaan:pertanyaan!pertanyaan_sesi_id_fkey(count)")
    .order("dibuat_pada", { ascending: false });
  if (error) throw new Error(`Gagal memuat daftar sesi: ${error.message}`);
  const list = (data ?? []) as (Sesi & { pertanyaan: { count: number }[] })[];

  return (
    <main className="p-wrap">
      <AdminNav />
      <div className="p-head">
        <div><span className="label">Admin</span><h1>Semua sesi</h1></div>
        <Link className="btn go" href="/admin/sesi/baru">+ Sesi baru</Link>
      </div>
      {list.length === 0 ? (
        <div className="empty-panel"><b>Belum ada sesi</b>Buat sesi untuk presentasi pertamamu.<p><Link className="btn sun" href="/admin/sesi/baru">Buat sesi</Link></p></div>
      ) : (
        <div className="s-list">
          {list.map((s) => (
            <div className="s-row" key={s.id}>
              <div>
                <div className="meta">
                  {s.status === "dibuka" ? <span className="chip live">Dibuka</span> : s.status === "ditutup" ? <span className="chip muted">Ditutup</span> : <span className="chip">Draf</span>}
                  <span>{s.matkul}</span><span>{s.kelompok_penyaji}</span><span>{tgl(s.tanggal)}</span>
                </div>
                <h3><Link href={`/admin/sesi/${s.id}`}>{s.topik}</Link></h3>
                <div className="meta"><span className="url" style={{ fontSize: 12.5, padding: "3px 8px" }}>/{s.kode}</span><span>{s.pertanyaan?.[0]?.count ?? 0} pertanyaan</span></div>
              </div>
              <div className="r">
                <Link className="btn sm dark" href={`/admin/sesi/${s.id}`}>Buka panel</Link>
                <Link className="btn sm" href={`/admin/sesi/${s.id}/atur`}>Atur</Link>
                <SesiRowActions id={s.id} topik={s.topik} />
              </div>
            </div>
          ))}
        </div>
      )}
      <SiteFooter />
    </main>
  );
}
