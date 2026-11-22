import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoOut, glide, path, pop, press, tw } from "../anim";
import { Avatar, Chip, Cursor, Eyebrow, Kinetic, Logo, Ripple, Sfx, StepBadge } from "../components/ui";
import { LINK } from "../config";

const N = 25;
const finder = (r: number, c: number) => {
  const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
    if (inBox(r0, c0)) {
      const rr = r - r0, cc = c - c0;
      return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0;
    }
    if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0;
  }
  return -1;
};
const QR: number[][] = Array.from({ length: N }, (_, r) =>
  Array.from({ length: N }, (_, c) => {
    const fd = finder(r, c);
    if (fd >= 0) return fd;
    if (Math.abs(r - 12) <= 3 && Math.abs(c - 12) <= 3) return 0; // ruang logo
    return random(`qr-${r}-${c}`) > 0.52 ? 1 : 0;
  }),
);

const CLICK = 98;
const FLY = [
  { i: 0, x: -90, y: 130 }, { i: 4, x: 640, y: 40 }, { i: 10, x: 700, y: 520 }, { i: 7, x: -110, y: 600 }, { i: 1, x: 300, y: 760 },
];

export const S4Share: React.FC = () => {
  const f = useCurrentFrame();
  const card = glide(f, 2);
  const scan = tw(f, 20, 52, -1, N + 1, (x) => x);
  const copied = f >= CLICK + 2;
  const cur = path(f, [
    { f: 66, x: 1900, y: 1150 },
    { f: 92, x: 1622, y: 768 },
    { f: 130, x: 1640, y: 786 },
    { f: 150, x: 1960, y: 1120 },
  ]);
  const joined = Math.round(tw(f, 112, 156, 0, 38, expoOut));
  const chip = pop(f, 110);

  return (
    <AbsoluteFill>
      <Sfx at={2} s="swish" v={0.4} />
      {Array.from({ length: 9 }).map((_, i) => <Sfx key={i} at={20 + i * 3.5} s="tick" v={0.18} />)}
      <Sfx at={54} s="pop-low" v={0.5} />
      <Sfx at={CLICK} s="click" v={0.8} />
      <Sfx at={CLICK + 2} s="pop" v={0.45} />
      {FLY.map((_, k) => <Sfx key={k} at={116 + k * 5} s="pop-high" v={0.3} />)}
      {Array.from({ length: 10 }).map((_, i) => <Sfx key={"t" + i} at={112 + i * 4} s="tick" v={0.14} />)}

      <div style={{ position: "absolute", left: 140, top: 250, width: 820 }}>
        <StepBadge n={1} start={4} />
        <div style={{ height: 40 }} />
        <Eyebrow text="Langkah 1 · Penyaji" start={8} />
        <div style={{ height: 22 }} />
        <Kinetic lines={["Bagikan satu link", "atau kode QR."]} start={12} size={96} hl={{ QR: C.sun }} />
        <div style={{ marginTop: 34, font: `600 32px/1.45 ${F.sans}`, color: C.ink2, opacity: tw(f, 96, 112), transform: `translateY(${tw(f, 96, 116, 24, 0)}px)` }}>
          Teman sekelas cukup scan dari HP.<br />Tanpa install, tanpa daftar akun.
        </div>
      </div>

      <div style={{ position: "absolute", left: 1060, top: 140, width: 700, height: 800, transform: `translateY(${(1 - card) * 700}px) rotate(${-2 + 6 * (1 - card)}deg)` }}>
        <div style={{ position: "absolute", inset: 0, background: C.sun, border: B(4), borderRadius: 44, boxShadow: sh(12) }} />
        {/* QR */}
        <div style={{ position: "absolute", left: 120, top: 70, width: 460, height: 460, background: C.card, border: B(4), borderRadius: 30, padding: 30 }}>
          <div style={{ position: "relative", width: 400, height: 400 }}>
            {QR.map((row, r) =>
              row.map((v, c) => {
                if (!v) return null;
                const vis = tw(scan, r - 1, r + 1, 0, 1, (x) => x);
                return (
                  <div key={`${r}-${c}`} style={{ position: "absolute", left: c * 16, top: r * 16, width: 16.6, height: 16.6, background: C.ink, borderRadius: 2, transform: `scale(${vis})` }} />
                );
              }),
            )}
            {scan > 0 && scan < N && <div style={{ position: "absolute", left: -12, right: -12, top: scan * 16, height: 6, borderRadius: 3, background: C.tomato, boxShadow: `0 0 0 3px ${C.card}` }} />}
            <div style={{ position: "absolute", left: 200 - 44, top: 200 - 44, transform: `scale(${pop(f, 54)})` }}><Logo size={88} /></div>
          </div>
        </div>
        {/* link */}
        <div style={{ position: "absolute", left: 60, top: 580, width: 580, height: 100, background: C.card, border: B(4), borderRadius: 22, display: "flex", alignItems: "center", padding: "0 12px 0 26px", boxShadow: sh(5), opacity: tw(f, 30, 44), transform: `translateY(${tw(f, 30, 50, 30, 0)}px)` }}>
          <span style={{ flex: 1, font: `700 30px ${F.mono}`, color: C.ink, letterSpacing: "-.02em" }}>{LINK}</span>
          <div style={{ padding: "16px 24px", borderRadius: 16, border: B(3), background: copied ? C.mint : C.ink, color: copied ? C.ink : "#fff", font: `700 24px ${F.sans}`, transform: `scale(${press(f, CLICK)})`, boxShadow: sh(3, copied ? C.ink : C.tomato) }}>
            {copied ? "Tersalin ✓" : "Salin"}
          </div>
        </div>
        {/* avatar bergabung */}
        {FLY.map((a, k) => {
          const s = pop(f, 116 + k * 5);
          return <div key={k} style={{ position: "absolute", left: a.x, top: a.y, transform: `scale(${s}) rotate(${(k % 2 ? 10 : -10) * s}deg)` }}><Avatar i={a.i} size={112} /></div>;
        })}
        <div style={{ position: "absolute", left: 150, top: -40, transform: `scale(${chip}) rotate(${-4 * chip}deg)`, opacity: f >= 110 ? 1 : 0 }}>
          <Chip bg={C.mint} size={30} style={{ boxShadow: sh(4), padding: "12px 22px" }}>
            <span style={{ font: `800 34px ${F.display}` }}>{joined}</span> teman sudah bergabung
          </Chip>
        </div>
      </div>

      <Ripple x={1622} y={768} at={CLICK} color={C.ink} />
      <Cursor x={cur.x} y={cur.y} scale={press(f, CLICK)} />
    </AbsoluteFill>
  );
};
