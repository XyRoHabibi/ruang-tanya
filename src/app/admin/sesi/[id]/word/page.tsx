import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { sesiById, stateAdmin } from "@/lib/data";
import WordClient from "./WordClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pratinjau Word · Ruang Tanya" };

export default async function Page({ params }: PageProps<"/admin/sesi/[id]/word">) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { id } = await params;
  const s = await sesiById(id);
  if (!s) notFound();
  return <WordClient state={await stateAdmin(s)} />;
}
