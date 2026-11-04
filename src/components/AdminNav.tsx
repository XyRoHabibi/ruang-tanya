"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminNav({ crumb }: { crumb?: React.ReactNode }) {
  const router = useRouter();
  async function keluar() {
    await fetch("/api/admin/keluar", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <div className="p-nav">
      <Link href="/admin" className="brand"><i />Ruang Tanya</Link>
      <div className="r">
        {crumb && <span className="label">{crumb}</span>}
        <button className="linkish" onClick={keluar}>Keluar</button>
      </div>
    </div>
  );
}
