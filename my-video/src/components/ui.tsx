import React from "react";
import { Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoIn, expoOut, pop, tw } from "../anim";
import { avatarSvg } from "../lib/avatars";

// ---------- Audio ----------
export type SfxName =
  | "pop" | "pop-low" | "pop-high" | "blip" | "click" | "tick" | "type1" | "type2" | "type3"
  | "whoosh" | "swish" | "impact" | "stamp" | "riser" | "ding" | "success";

const SFX_LEN: Record<SfxName, number> = {
  pop: 6, "pop-low": 6, "pop-high": 5, blip: 7, click: 4, tick: 3, type1: 4, type2: 4, type3: 4,
  whoosh: 17, swish: 10, impact: 44, stamp: 11, riser: 62, ding: 38, success: 38,
};
/** Master volume SFX. Turunkan bila voice over terasa tertutup. */
export const SFX_GAIN = 0.85;

export const Sfx: React.FC<{ at: number; s: SfxName; v?: number }> = ({ at, s, v = 0.6 }) => (
  <Sequence from={Math.round(at)} durationInFrames={SFX_LEN[s] + 2} layout="none" name={`sfx:${s}`}>
    <Html5Audio src={staticFile(`sfx/${s}.wav`)} volume={v * SFX_GAIN} />
  </Sequence>
);

/** Ketikan dengan bunyi tuts per karakter (dijarangkan agar tidak ramai). */
export const TypeSfx: React.FC<{ text: string; start: number; cps?: number; every?: number; v?: number }> = ({
  text, start, cps = 22, every = 2, v = 0.32,
}) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < text.length; i += every) {
    if (text[i] === " ") continue;
    const at = start + (i / cps) * 30;
    out.push(<Sfx key={i} at={at} s={(["type1", "type2", "type3"] as const)[i % 3]} v={v} />);
  }
  return <>{out}</>;
};

// ---------- Visual ----------
export const Avatar: React.FC<{ i: number; size: number; style?: React.CSSProperties }> = ({ i, size, style }) => (
  <div
    style={{ width: size, height: size, flex: "none", ...style }}
    dangerouslySetInnerHTML={{
      __html: avatarSvg(i).replace("<svg ", '<svg width="100%" height="100%" style="display:block;overflow:visible" '),
    }}
  />
);

export const Sticker: React.FC<{
  children?: React.ReactNode; bg?: string; r?: number; s?: number; w?: number; style?: React.CSSProperties; shadow?: string;
}> = ({ children, bg = C.card, r = 24, s = 6, w = 3, style, shadow }) => (
  <div style={{ background: bg, border: B(w), borderRadius: r, boxShadow: shadow ?? sh(s), position: "relative", ...style }}>
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children, bg = C.card, color = C.ink, size = 22, style,
}) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.28}px ${size * 0.6}px`,
      border: B(Math.max(2, size / 9)), borderRadius: 999, background: bg, color,
      font: `700 ${size}px/1.15 ${F.sans}`, whiteSpace: "nowrap", ...style,
    }}
  >
    {children}
  </div>
);

export const LiveDot: React.FC<{ size?: number }> = ({ size = 12 }) => {
  const f = useCurrentFrame();
  return <span style={{ width: size, height: size, borderRadius: "50%", background: "#fff", opacity: 0.35 + 0.65 * Math.abs(Math.cos(f / 12)) }} />;
};

/** Judul kinetik: tiap kata naik dari balik masker, kata kunci diberi blok stabilo. */
export const Kinetic: React.FC<{
  lines: string[]; start: number; size: number; stagger?: number; color?: string;
  hl?: Record<string, string>; hlText?: Record<string, string>; exit?: number; align?: "left" | "center";
  lh?: number; font?: string; tracking?: string;
}> = ({ lines, start, size, stagger = 3, color = C.ink, hl = {}, hlText = {}, exit, align = "left", lh = 1.02, font = F.display, tracking = "-0.035em" }) => {
  const f = useCurrentFrame();
  let k = 0;
  return (
    <div style={{ font: `800 ${size}px/${lh} ${font}`, letterSpacing: tracking, color, textAlign: align }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: "0.24em" }}>
          {line.split(" ").map((w, wi) => {
            const idx = k++;
            const d = start + idx * stagger;
            const inY = tw(f, d, d + 20, 112, 0, expoOut);
            const outY = exit !== undefined ? tw(f, exit + idx * 1.5, exit + idx * 1.5 + 12, 0, -112, expoIn) : 0;
            const key = w.replace(/[.,!?:]/g, "");
            const hc = hl[key];
            const hp = tw(f, d + 10, d + 26, 0, 1, expoOut);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.1em 0.12em", margin: "-0.06em -0.1em -0.12em" }}>
                <span style={{ display: "inline-block", position: "relative", transform: `translateY(${inY + outY}%)` }}>
                  {hc && (
                    <span
                      style={{
                        position: "absolute", left: "-0.08em", right: "-0.08em", top: "0.1em", bottom: "0.02em",
                        background: hc, borderRadius: size * 0.12, transform: `scaleX(${hp}) rotate(-1.5deg)`,
                        transformOrigin: "left center", border: B(Math.max(2, size / 34)),
                      }}
                    />
                  )}
                  <span style={{ position: "relative", color: hlText[key] ?? color }}>{w}</span>
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Label kecil mono yang muncul dengan efek ketik. */
export const Eyebrow: React.FC<{ text: string; start: number; color?: string; size?: number }> = ({ text, start, color = C.ink2, size = 22 }) => {
  const f = useCurrentFrame();
  const n = Math.floor(tw(f, start, start + 16, 0, text.length, (x) => x));
  return (
    <div style={{ font: `700 ${size}px/1 ${F.mono}`, letterSpacing: "0.12em", textTransform: "uppercase", color, opacity: f >= start ? 1 : 0 }}>
      {text.slice(0, n)}
      <span style={{ opacity: n < text.length ? 1 : 0 }}>▍</span>
    </div>
  );
};

/** Nomor langkah: stiker kuning miring. */
export const StepBadge: React.FC<{ n: number; start: number; bg?: string }> = ({ n, start, bg = C.sun }) => {
  const f = useCurrentFrame();
  const p = pop(f, start);
  return (
    <div
      style={{
        width: 104, height: 104, borderRadius: 26, border: B(4), background: bg, boxShadow: sh(7),
        display: "grid", placeItems: "center", font: `800 54px/1 ${F.display}`, letterSpacing: "-0.04em",
        transform: `scale(${p}) rotate(${-8 + 4 * p}deg)`,
      }}
    >
      0{n}
    </div>
  );
};

export const Cursor: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({ x, y, scale = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - 4, top: y - 4, transform: `scale(${scale})`, transformOrigin: "4px 4px", opacity, zIndex: 50, filter: "drop-shadow(3px 4px 0 rgba(18,18,18,.25))" }}>
    <svg width="50" height="56" viewBox="0 0 23 26">
      <path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.6 15.2 L17 15 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Riak lingkaran saat klik/tap. */
export const Ripple: React.FC<{ x: number; y: number; at: number; color?: string; size?: number }> = ({ x, y, at, color = C.tomato, size = 90 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 18) return null;
  const p = tw(f, at, at + 18, 0, 1, expoOut);
  return (
    <div
      style={{
        position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
        border: `${4 * (1 - p) + 1}px solid ${color}`, transform: `scale(${0.2 + p})`, opacity: 1 - p, zIndex: 49,
      }}
    />
  );
};

/** Logo Ruang Tanya (bubble tomat + tanda tanya) dari src/app/icon.svg. */
export const Logo: React.FC<{ size: number; lift?: number; draw?: number }> = ({ size, lift = 1, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", display: "block" }}>
    <path
      d="M22 9 H46 A14 14 0 0 1 60 23 V46 A14 14 0 0 1 46 60 H12 A4 4 0 0 1 8 56 V23 A14 14 0 0 1 22 9 Z"
      fill={C.ink}
      transform={`translate(${(lift - 1) * 4} ${(lift - 1) * 4})`}
    />
    <path d="M18 4 H42 A14 14 0 0 1 56 18 V41 A14 14 0 0 1 42 55 H8 A4 4 0 0 1 4 51 V18 A14 14 0 0 1 18 4 Z" fill={C.tomato} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
    <path
      d="M22.5 22.5 A7.5 7.5 0 1 1 33 29.4 C31 30.4 30 31.8 30 34 V35.5"
      fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
    />
    <circle cx="30" cy="44.5" r={3.6 * Math.min(1, Math.max(0, (draw - 0.7) / 0.3))} fill="#fff" />
  </svg>
);

/** Bintang/kilau dekoratif bergaya stiker. */
export const Spark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = C.sun, style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: "visible", ...style }}>
    <path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill={color} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
