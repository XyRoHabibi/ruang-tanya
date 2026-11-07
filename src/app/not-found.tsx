import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <main className="home">
      <div className="card-form" style={{ textAlign: "center" }}>
        <Avatar i={8} size={90} />
        <h1>Sesi tidak ditemukan</h1>
        <p>Cek lagi kode atau link yang dibagikan kelompok penyaji.</p>
        <Link className="btn sun" href="/" style={{ marginTop: 14 }}>Masukkan kode lain</Link>
      </div>
      <SiteFooter />
    </main>
  );
}
