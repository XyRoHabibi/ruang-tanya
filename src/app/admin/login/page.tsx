"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { Avatar } from "@/components/Avatar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setSibuk(true); setGalat("");
    const { error } = await browserClient().auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) {
      setGalat(error.message.includes("Invalid") ? "Email atau password salah." : error.message);
      setSibuk(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="login">
      <form className="card-form" onSubmit={masuk}>
        <span className="brand"><i />Ruang Tanya</span>
        <h1>Masuk admin</h1>
        <div className="fld"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="fld"><label htmlFor="pw">Password</label><input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        {galat && <div className="galat" style={{ marginTop: 14 }} role="alert">{galat}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
          <button className="btn go" disabled={sibuk} style={{ flex: 1, padding: 14 }}>{sibuk ? "Masuk…" : "Masuk"}</button>
          <Avatar i={6} size={48} />
        </div>
      </form>
    </main>
  );
}
