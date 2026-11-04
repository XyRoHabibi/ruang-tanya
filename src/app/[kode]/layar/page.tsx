import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sesiByKode, sesiPublik } from "@/lib/data";
import { metaSesi } from "@/lib/meta";
import { getAdmin } from "@/lib/auth";
import LayarClient from "./LayarClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[kode]/layar">): Promise<Metadata> {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  return metaSesi(s, "layar");
}

export default async function Page({ params }: PageProps<"/[kode]/layar">) {
  const { kode } = await params;
  const s = await sesiByKode(kode);
  if (!s) notFound();
  const admin = !!(await getAdmin());
  return <LayarClient sesiAwal={sesiPublik(s)} isAdmin={admin} />;
}
