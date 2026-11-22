import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F, sh } from "../brand";
import { expoOut, pop, tw } from "../anim";
import { Avatar, Kinetic, Logo, Sfx } from "../components/ui";
import { SITE } from "../config";

import timeline from "../timeline.json";

// Logo jatuh tepat di kata "Ruang Tanya" pada VO, sefase dengan nada akhir musik
const T_LOGO = timeline.outroLogo;

export const S9Outro: React.FC = () => {
  const f = useCurrentFrame();
  const lp = pop(f, T_LOGO);
  const lift = tw(f, T_LOGO + 2, T_LOGO + 14, 0, 1, expoOut);
  const ring = tw(f, T_LOGO, T_LOGO + 24, 0, 1, expoOut);
  const chips = ["Gratis", "Tanpa install", "Open source · MIT"];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sfx at={4} s="swish" v={0.35} />
      <Sfx at={56} s="swish" v={0.35} />
      <Sfx at={T_LOGO} s="impact" v={0.9} />
      {chips.map((_, i) => <Sfx key={i} at={T_LOGO + 26 + i * 5} s="pop" v={0.4} />)}
      {Array.from({ length: 6 }).map((_, i) => <Sfx key={"a" + i} at={T_LOGO + 18 + i * 3} s="pop-high" v={0.18} />)}

      {/* titik grid di gelap */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.07) 2px, transparent 2.5px)", backgroundSize: "44px 44px", backgroundPosition: `${f * 0.4}px ${f * 0.2}px` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 420 }}>
        <Kinetic lines={["Semua berani bertanya."]} start={6} size={128} color="#fff" align="center" hl={{ berani: C.tomato }} exit={50} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420 }}>
        <Kinetic lines={["Semua tercatat rapi."]} start={58} size={128} color="#fff" align="center" hl={{ rapi: C.mint }} hlText={{ rapi: C.ink }} exit={90} />
      </div>

      {f >= T_LOGO - 2 && (
        <>
          <div style={{ position: "absolute", left: 960 - 330, top: 400 - 330, width: 660, height: 660, borderRadius: "50%", border: `${8 * (1 - ring) + 1}px solid ${C.sun}`, transform: `scale(${0.3 + ring * 1.4})`, opacity: 1 - ring }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
            <div style={{ transform: `scale(${lp}) rotate(${-10 * (1 - lp)}deg)` }}>
              <div>
                <LogoOnDark size={200} lift={lift} />
              </div>
            </div>
            <div style={{ display: "flex", font: `800 150px/1.1 ${F.display}`, letterSpacing: "-0.045em", color: "#fff" }}>
              {"Ruang Tanya".split("").map((ch, i) => {
                const d = T_LOGO + 4 + i * 1.4;
                return (
                  <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0 0.02em 0.1em", whiteSpace: "pre" }}>
                    <span style={{ display: "inline-block", transform: `translateY(${tw(f, d, d + 18, 110, 0, expoOut)}%)` }}>{ch}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 545, textAlign: "center", font: `600 40px ${F.sans}`, color: "rgba(255,255,255,.78)", opacity: tw(f, T_LOGO + 16, T_LOGO + 30), transform: `translateY(${tw(f, T_LOGO + 16, T_LOGO + 34, 20, 0)}px)` }}>
            Web tanya jawab interaktif untuk presentasi kelas.
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 636, display: "flex", justifyContent: "center", gap: 20 }}>
            {chips.map((c, i) => {
              const s = pop(f, T_LOGO + 26 + i * 5);
              return (
                <div key={c} style={{ padding: "14px 26px", borderRadius: 999, border: "3px solid #fff", background: [C.sun, C.mint, C.bubble][i], color: C.ink, font: `700 28px ${F.sans}`, boxShadow: sh(5, "#fff"), transform: `scale(${s}) rotate(${(i - 1) * 3 * s}deg)` }}>{c}</div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 772, textAlign: "center", font: `700 32px ${F.mono}`, color: C.sun, opacity: tw(f, T_LOGO + 44, T_LOGO + 56) }}>
            {SITE}
          </div>
          {/* barisan avatar mengintip dari bawah */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: -18, display: "flex", justifyContent: "center", gap: 18 }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const s = tw(f, T_LOGO + 18 + i * 1.5, T_LOGO + 36 + i * 1.5, 0, 1, expoOut);
              const bob = Math.sin((f + i * 11) / 12) * 6;
              return <div key={i} style={{ transform: `translateY(${(1 - s) * 160 + bob}px)` }}><Avatar i={i} size={124} /></div>;
            })}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// Versi logo untuk latar gelap: bayangan keras berwarna kuning agar tetap "terangkat".
const LogoOnDark: React.FC<{ size: number; lift: number }> = ({ size, lift }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div style={{ position: "absolute", inset: 0, transform: `translate(${lift * 10}px, ${lift * 10}px)` }}>
      <svg width={size} height={size} viewBox="0 0 64 64"><path d="M18 4 H42 A14 14 0 0 1 56 18 V41 A14 14 0 0 1 42 55 H8 A4 4 0 0 1 4 51 V18 A14 14 0 0 1 18 4 Z" fill={C.sun} /></svg>
    </div>
    <div style={{ position: "absolute", inset: 0 }}><Logo size={size} lift={0} /></div>
  </div>
);

