"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  const router = useRouter();
  const [kode, setKode] = useState("");
  return (
    <main className="home">
      <form className="card-form" onSubmit={(e) => { e.preventDefault(); const k = kode.trim().toLowerCase(); if (k) router.push(`/${encodeURIComponent(k)}`); }}>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[0, 3, 4, 9, 10].map((i) => <Avatar key={i} i={i} size={44} />)}
        </div>
        <h1>Ruang Tanya</h1>
        <p>Masukkan kode sesi dari kelompok penyaji.</p>
        <div className="fld"><label htmlFor="kode">Kode sesi</label><input id="kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="contoh: akhlak" autoCapitalize="none" /></div>
        <button className="btn go block" style={{ marginTop: 16, padding: 14 }}>Masuk</button>
        <p style={{ marginTop: 16, fontSize: 13 }}><Link className="linkish" href="/admin">Masuk sebagai penyaji</Link></p>
      </form>
      <SiteFooter />
    </main>
  );
}
