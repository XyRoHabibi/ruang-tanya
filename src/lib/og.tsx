import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { avatarSvg } from "./avatars";

export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Bricolage-ExtraBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/PlusJakarta-SemiBold.ttf")),
]);

const avatarUri = (i: number) => `data:image/svg+xml;base64,${Buffer.from(avatarSvg(i).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')).toString("base64")}`;

const INK = "#121212";

function ukuranJudul(t: string) {
  if (t.length <= 24) return 84;
  if (t.length <= 44) return 70;
  if (t.length <= 70) return 58;
  return 48;
}

export async function ogImage(o: { kicker: string; judul: string; sub: string; cta: string; url: string; avatars?: number[]; badge?: string }) {
  const [display, sans] = await fonts;
  const judul = o.judul.length > 110 ? `${o.judul.slice(0, 107).trimEnd()}…` : o.judul;
  const avatars = o.avatars ?? [0, 3, 4, 9, 10, 6];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#FFFBF2", padding: "44px 56px", fontFamily: "Jakarta" }}>
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: "#FF5B3A", border: `4px solid ${INK}`, borderRadius: "16px 16px 16px 4px", boxShadow: `4px 4px 0 ${INK}` }} />
          <div style={{ fontFamily: "Bricolage", fontSize: 34, color: INK, letterSpacing: -1 }}>Ruang Tanya</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, background: "#FF5B3A", color: "#fff", border: `3px solid ${INK}`, borderRadius: 999, padding: "6px 18px", fontSize: 22 }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#fff" }} />
            {o.badge ?? "Tanya jawab live"}
          </div>
        </div>

        {/* kartu utama */}
        <div style={{ marginTop: 30, flex: 1, display: "flex", flexDirection: "column", background: "#FFC93C", border: `5px solid ${INK}`, borderRadius: 36, boxShadow: `12px 12px 0 ${INK}`, padding: "34px 44px" }}>
          <div style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: "#3a3426" }}>{o.kicker}</div>
          <div style={{ fontFamily: "Bricolage", fontSize: ukuranJudul(judul), lineHeight: 1.02, letterSpacing: -2, color: INK, marginTop: 14, maxWidth: 1000 }}>{judul}</div>
          <div style={{ fontSize: 28, color: INK, marginTop: "auto" }}>{o.sub}</div>
        </div>

        {/* bawah */}
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ display: "flex" }}>
            {avatars.map((a, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={avatarUri(a)} width={68} height={68} alt="" style={{ marginLeft: i ? -14 : 0 }} />
            ))}
          </div>
          <div style={{ display: "flex", background: INK, color: "#fff", borderRadius: 18, padding: "14px 26px", fontSize: 28, boxShadow: "4px 4px 0 #FF5B3A" }}>{o.cta}</div>
          <div style={{ marginLeft: "auto", fontSize: 24, color: "#4A4740" }}>{o.url}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Jakarta", data: sans, weight: 600, style: "normal" },
      ],
    },
  );
}

/** Domain situs untuk ditampilkan di gambar (tanpa https://). */
export function hostTampil() {
  const u = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
