import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { glide, path, pop, press, tw } from "../anim";
import { Avatar, Chip, Cursor, Kinetic, Ripple, Sfx, Spark, StepBadge, TypeSfx } from "../components/ui";

const AI =
  "Zakat fitrah wajib bagi setiap muslim dan dibayar sebelum salat Idulfitri untuk menyucikan diri. Zakat mal dikeluarkan dari harta yang sudah mencapai nisab dan haul.";
const T_STREAM = 50, CPS = 70;
const T_CLICK = 178;
const COLS = [
  { title: "Jawaban AI", bg: C.sky, color: "#fff" },
  { title: "Versi penanya", bg: C.bubble, color: C.ink },
  { title: "Versi sendiri", bg: C.sun, color: C.ink },
];
const CW = 530, CX0 = 120, CGAP = 45, CTOP = 400, CH = 560;

export const S7AI: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(AI.length, Math.floor(((f - T_STREAM) / 30) * CPS)));
  const shown = AI.slice(0, n);
  const chosen = f >= T_CLICK + 1;
  const ch = pop(f, T_CLICK + 1);
  const btn = { x: CX0 + CW / 2, y: CTOP + CH - 62 };
  const cur = path(f, [
    { f: 146, x: 1500, y: 1180 },
    { f: 172, x: btn.x + 40, y: btn.y + 8 },
    { f: 194, x: btn.x + 60, y: btn.y + 20 },
    { f: 212, x: 700, y: 1260 },
  ]);

  return (
    <AbsoluteFill>
      <Sfx at={6} s="swish" v={0.4} />
      <Sfx at={20} s="pop-low" v={0.35} />
      <TypeSfx text={AI} start={T_STREAM} cps={CPS} every={6} v={0.14} />
      <Sfx at={T_STREAM + (AI.length / CPS) * 30} s="ding" v={0.35} />
      <Sfx at={T_CLICK} s="click" v={0.8} />
      <Sfx at={T_CLICK + 2} s="stamp" v={0.7} />

      <div style={{ position: "absolute", left: 120, top: 64, display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ transform: "scale(.78)", transformOrigin: "left center" }}><StepBadge n={4} start={4} bg={C.sky} /></div>
        <Kinetic lines={["AI menyiapkan jawabannya."]} start={8} size={74} stagger={2.5} hl={{ AI: C.sky }} hlText={{ AI: "#fff" }} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 186, font: `600 30px ${F.sans}`, color: C.ink2, opacity: tw(f, 26, 40), transform: `translateY(${tw(f, 26, 44, 16, 0)}px)` }}>
        Pakai konteks materimu, dan tidak mengarang dalil.
      </div>

      {/* pertanyaan */}
      <div style={{ position: "absolute", left: 120, top: 262, width: 1680, height: 100, background: C.card, border: B(3), borderRadius: 22, boxShadow: sh(4), display: "flex", alignItems: "center", gap: 18, padding: "0 22px", opacity: tw(f, 4, 16), transform: `translateY(${tw(f, 4, 22, 30, 0)}px)` }}>
        <Avatar i={10} size={62} />
        <span style={{ font: `700 18px ${F.mono}`, color: C.ink3, letterSpacing: ".06em" }}>KUCING OREN</span>
        <span style={{ font: `600 28px ${F.sans}` }}>Apa beda zakat fitrah dan zakat mal?</span>
      </div>

      {COLS.map((c, i) => {
        const g = glide(f, 10 + i * 6);
        const isAI = i === 0;
        const lifted = isAI && chosen;
        return (
          <div key={i} style={{
            position: "absolute", left: CX0 + i * (CW + CGAP), top: CTOP, width: CW, height: CH, background: C.card, border: B(lifted ? 4 : 3), borderRadius: 28,
            boxShadow: lifted ? sh(10 + 4 * (1 - ch), C.tomato) : sh(6), padding: 26, display: "flex", flexDirection: "column",
            opacity: g, transform: `translateY(${(1 - g) * 140 - (lifted ? 6 * ch : 0)}px) rotate(${(1 - g) * (i - 1) * 4}deg)`,
          }}>
            <Chip bg={c.bg} color={c.color} size={20} style={{ alignSelf: "flex-start" }}>{isAI && <Spark size={20} color={C.sun} />}{c.title}</Chip>
            <div style={{ flex: 1, marginTop: 22, font: `600 27px/1.42 ${F.sans}` }}>
              {isAI && n === 0 && f > 16 && (
                <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
                  {[0.95, 0.8, 0.9, 0.6].map((w, k) => (
                    <div key={k} style={{ height: 22, width: `${w * 100}%`, borderRadius: 11, background: `linear-gradient(90deg, ${C.soft} 0%, #fff 50%, ${C.soft} 100%)`, backgroundSize: "200% 100%", backgroundPosition: `${-((f * 6 + k * 20) % 200)}% 0` }} />
                  ))}
                </div>
              )}
              {isAI && shown}
              {isAI && n > 0 && n < AI.length && <span style={{ display: "inline-block", width: 12, height: 26, background: C.sky, marginLeft: 4, verticalAlign: "-4px", borderRadius: 3 }} />}
              {i === 1 && <span style={{ opacity: tw(f, 34, 48), color: C.ink }}>"Fitrah itu pas mau Lebaran, kalau mal dari harta yang sudah banyak."</span>}
              {i === 2 && (
                <div style={{ height: 250, border: `3px dashed ${C.ink3}`, borderRadius: 18, padding: 18, color: C.ink3 }}>
                  Tulis versimu sendiri…<span style={{ display: "inline-block", width: 3, height: 26, background: C.ink, verticalAlign: "-5px", marginLeft: 3, opacity: Math.floor(f / 8) % 2 }} />
                </div>
              )}
            </div>
            {isAI && (
              <div style={{ height: 70, borderRadius: 18, border: B(3), display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: chosen ? C.tomato : C.card, color: chosen ? "#fff" : C.ink, font: `700 25px ${F.sans}`, transform: `scale(${press(f, T_CLICK)})`, boxShadow: sh(3) }}>
                {chosen ? "✓ Masuk Word" : "Pilih versi ini"}
              </div>
            )}
            {i === 1 && <div style={{ font: `600 19px ${F.sans}`, color: C.ink3 }}>dari Kucing Oren</div>}
            {i === 2 && <div style={{ font: `600 19px ${F.sans}`, color: C.ink3 }}>opsional, oleh penyaji</div>}
          </div>
        );
      })}

      {/* stempel */}
      <div style={{ position: "absolute", left: CX0 + CW - 120, top: CTOP - 34, transform: `scale(${ch}) rotate(${12 - 4 * ch}deg)`, opacity: chosen ? 1 : 0, padding: "10px 18px", background: C.mint, border: B(4), borderRadius: 16, boxShadow: sh(5), font: `800 28px ${F.display}` }}>
        Dipilih!
      </div>

      <Ripple x={btn.x + 40} y={btn.y + 8} at={T_CLICK} color={C.tomato} />
      <Cursor x={cur.x} y={cur.y} scale={press(f, T_CLICK)} opacity={tw(f, 146, 150)} />
    </AbsoluteFill>
  );
};
