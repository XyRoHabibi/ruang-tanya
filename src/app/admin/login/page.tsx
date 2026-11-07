"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { Avatar } from "@/components/Avatar";
import { SiteFooter } from "@/components/SiteFooter";
import type { CekAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [galat, setGalat] = useState<React.ReactNode>("");
  const [sibuk, setSibuk] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setSibuk(true); setGalat("");
    const sb = browserClient();
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) {
      setGalat(error.message.includes("Invalid") ? "Email atau password salah." : error.message);
      setSibuk(false);
      return;
    }

    // Pastikan server juga mengenali login ini sebelum pindah halaman.
    const cek: CekAdmin = await fetch("/api/admin/cek", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ status: "galat", pesan: "Server tidak bisa dihubungi." }));
    if (cek.status === "admin") {
      router.replace("/admin");
      router.refresh();
      return;
    }
    await sb.auth.signOut();
    setSibuk(false);
    if (cek.status === "bukan-admin") {
      setGalat(<>Password benar, tapi <b>{cek.email}</b> tidak terdaftar sebagai admin. Samakan isi <code>ADMIN_EMAIL</code> (di <code>.env.local</code> atau di Vercel → Settings → Environment Variables) dengan email ini, lalu jalankan ulang / Redeploy.</>);
    } else if (cek.status === "belum-login") {
      setGalat(<>Password benar, tapi server tidak menerima sesi login (cookie). Pastikan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di Vercel sama dengan di <code>.env.local</code>, lalu Redeploy. Coba juga matikan pemblokir cookie untuk situs ini.</>);
    } else {
      setGalat(<>Password benar, tapi server gagal memeriksa login: {cek.pesan}</>);
    }
  }

  return (
    <main className="login">
      <form className="card-form" onSubmit={masuk}>
        <span className="brand"><i />Ruang Tanya</span>
        <h1>Masuk admin</h1>
        <div className="fld"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="fld"><label htmlFor="pw">Password</label><input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        {galat && <div className="galat" style={{ marginTop: 14, fontWeight: 500 }} role="alert">{galat}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
          <button className="btn go" disabled={sibuk} aria-busy={sibuk} style={{ flex: 1, padding: 14 }}>{sibuk ? "Masuk…" : "Masuk"}</button>
          <Avatar i={6} size={48} />
        </div>
      </form>
      <SiteFooter />
    </main>
  );
}
