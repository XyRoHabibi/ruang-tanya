import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";
import { SesiForm } from "../SesiForm";

export const metadata = { title: "Sesi baru · Ruang Tanya" };

export default async function Page() {
  if (!(await getAdmin())) redirect("/admin/login");
  return (
    <main className="p-wrap">
      <AdminNav crumb="Semua sesi / Sesi baru" />
      <div className="p-head"><div><span className="label">Admin</span><h1>Sesi baru</h1></div></div>
      <div className="form-wide"><SesiForm /></div>
    </main>
  );
}
