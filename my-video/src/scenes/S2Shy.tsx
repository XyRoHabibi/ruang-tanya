import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoInOut, expoOut, tw } from "../anim";
import { Avatar, Eyebrow, Kinetic, Sfx, TypeSfx } from "../components/ui";

const TEXT = "Pak, saya mau tanya, kalau misalnya…";
const T0 = 8, CPS = 28;
const T_DEL = 54, DEL_CPS = 70;
const T_MORPH = 72;

export const S2Shy: React.FC = () => {
  const f = useCurrentFrame();
  const typedN = Math.max(0, Math.min(TEXT.length, Math.floor(((f - T0) / 30) * CPS)));
  const delN = Math.max(0, Math.floor(((f - T_DEL) / 30) * DEL_CPS));
  const n = Math.max(0, typedN - delN);
  const caretOn = Math.floor(f / 8) % 2 === 0 || (f > T0 && f < T_DEL + 20);

  // morph kartu input → bulatan tomat (benih logo di scene berikutnya)
  const m = tw(f, T_MORPH, T_MORPH + 22, 0, 1, expoInOut);
  const w = 1120 + (150 - 1120) * m;
  const h = 176 + (150 - 176) * m;
  const cy = 650 + (540 - 650) * m;
  const inner = 1 - tw(f, T_MORPH, T_MORPH + 6, 0, 1);
  const enter = tw(f, 0, 20, 0, 1, expoOut);

  return (
    <AbsoluteFill>
      <TypeSfx text={TEXT} start={T0} cps={CPS} v={0.38} />
      {Array.from({ length: 8 }).map((_, i) => <Sfx key={i} at={T_DEL + i * 2.2} s="type2" v={0.22} />)}
      <Sfx at={T_MORPH - 2} s="whoosh" v={0.5} />
      <Sfx at={34} s="riser" v={0.5} />

      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ opacity: 1 - tw(f, 68, 78) }}><Eyebrow text="Dan yang malu…" start={2} /></div>
        <Kinetic lines={["Akhirnya nggak", "jadi bertanya."]} start={6} size={112} align="center" hl={{ bertanya: C.sky }} hlText={{ bertanya: "#fff" }} exit={70} />
      </div>

      <div
        style={{
          position: "absolute", left: 960 - w / 2, top: cy - h / 2 + (1 - enter) * 120, width: w, height: h, opacity: enter,
          borderRadius: 26 + (75 - 26) * m, border: B(4), boxShadow: sh(8 - 2 * m),
          background: interpolateColors(m, [0, 0.6, 1], [C.card, C.tomato, C.tomato]), overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 26, padding: "0 30px", opacity: inner, width: 1120 }}>
          <Avatar i={8} size={96} />
          <div style={{ flex: 1 }}>
            <div style={{ font: `700 20px ${F.sans}`, color: C.ink3, marginBottom: 8 }}>Pertanyaanmu</div>
            <div style={{ font: `600 40px/1.2 ${F.sans}`, color: C.ink, whiteSpace: "nowrap" }}>
              {TEXT.slice(0, n)}
              <span style={{ display: "inline-block", width: 4, height: 44, background: C.tomato, verticalAlign: "-8px", marginLeft: 3, opacity: caretOn ? 1 : 0 }} />
              {n === 0 && f > T_DEL && <span style={{ color: C.ink3 }}>Tulis pertanyaan…</span>}
            </div>
          </div>
          <div style={{ padding: "20px 30px", borderRadius: 18, border: B(3), background: C.soft, color: C.ink3, font: `700 28px ${F.sans}` }}>Kirim</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
