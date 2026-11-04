import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { sesiById } from "@/lib/data";
import { AdminNav } from "@/components/AdminNav";
import { SesiForm } from "../../SesiForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atur sesi · Ruang Tanya" };

export default async function Page({ params }: PageProps<"/admin/sesi/[id]/atur">) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { id } = await params;
  const s = await sesiById(id);
  if (!s) notFound();
  return (
    <main className="p-wrap">
      <AdminNav crumb={`Semua sesi / ${s.kode} / Atur`} />
      <div className="p-head"><div><span className="label">Atur sesi</span><h1>{s.topik}</h1></div></div>
      <div className="form-wide"><SesiForm sesi={s} /></div>
    </main>
  );
}
