import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { sesiById, stateAdmin } from "@/lib/data";
import PanelClient from "./PanelClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel sesi · Ruang Tanya" };

export default async function Page({ params }: PageProps<"/admin/sesi/[id]">) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { id } = await params;
  const s = await sesiById(id);
  if (!s) notFound();
  return <PanelClient awal={await stateAdmin(s)} />;
}
