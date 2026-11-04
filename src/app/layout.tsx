import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500", "700"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const deskripsi = "Tanya jawab presentasi kelas jadi seru: pilih avatar, kirim pertanyaan, dukung pertanyaan teman, dan kirim reaksi ke layar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ruang Tanya",
  description: deskripsi,
  applicationName: "Ruang Tanya",
  openGraph: { type: "website", siteName: "Ruang Tanya", locale: "id_ID", title: "Ruang Tanya", description: deskripsi },
  twitter: { card: "summary_large_image", title: "Ruang Tanya", description: deskripsi },
};

export const viewport: Viewport = { themeColor: "#FFFBF2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
