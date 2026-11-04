import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sesiByKode, sesiPublik } from "@/lib/data";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[kode]/teman">): Promise<Metadata> {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  return { title: s ? `Pertanyaan teman: ${s.topik} · Ruang Tanya` : "Ruang Tanya" };
}

export default async function Page({ params }: PageProps<"/[kode]/teman">) {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  if (!s) notFound();
  return <FeedClient sesiAwal={sesiPublik(s)} />;
}
