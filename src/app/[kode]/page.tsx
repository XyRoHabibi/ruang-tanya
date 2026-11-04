import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sesiByKode, sesiPublik } from "@/lib/data";
import FormClient from "./FormClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[kode]">): Promise<Metadata> {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  return { title: s ? `Tanya: ${s.topik} · Ruang Tanya` : "Ruang Tanya" };
}

export default async function Page({ params }: PageProps<"/[kode]">) {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  if (!s) notFound();
  return <FormClient sesiAwal={sesiPublik(s)} />;
}
