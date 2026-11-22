import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoOut, pop, tw } from "../anim";
import { Eyebrow, Kinetic, Sfx } from "../components/ui";

type Msg = { t: number; who?: string; c?: string; text: string; q?: boolean; me?: boolean; h: number };

const M = (t: number, who: string, c: string, text: string, h = 92): Msg => ({ t, who, c, text, h });

const MSGS: Msg[] = [
  M(14, "Dimas", C.sky, "slide-nya udah dikirim belum?"),
  M(26, "Salsa", C.bubble, "belum 😭"),
  { t: 38, who: "Rani", c: C.mint, text: "Kak, mau tanya. Apa beda zakat fitrah dan zakat mal?", q: true, h: 152 },
  M(54, "Fikri", C.sun, "wkwkwk"),
  M(62, "Dimas", C.sky, "yang bawa proyektor siapa"),
  { t: 69, me: true, text: "aku", h: 74 },
  M(75, "Bayu", C.lime, "absen dulu gaes"),
  M(80, "Salsa", C.bubble, "🙏🙏🙏"),
  M(85, "Nadia", C.tomato, "kelas offline kan?"),
  M(89, "Fikri", C.sun, "P"),
  M(93, "Bayu", C.lime, "siap"),
  M(96, "Dimas", C.sky, "link absennya mana"),
  M(99, "Nadia", C.tomato, "udah mulai belum?"),
  M(102, "Salsa", C.bubble, "😂😂"),
  M(105, "Fikri", C.sun, "P"),
  M(108, "Bayu", C.lime, "otw 5 menit"),
  M(111, "Dimas", C.sky, "titip absen ya"),
  M(114, "Nadia", C.tomato, "wkwk"),
  M(117, "Fikri", C.sun, "🔥"),
  M(120, "Salsa", C.bubble, "materinya dari bab berapa"),
];

const Bubble: React.FC<{ m: Msg }> = ({ m }) => {
  const f = useCurrentFrame();
  const grow = tw(f, m.t, m.t + 9, 0, 1, expoOut);
  const s = pop(f, m.t);
  if (f < m.t) return null;
  return (
    <div style={{ height: m.h * grow, flex: "none", display: "flex", justifyContent: m.me ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
      <div
        style={{
          maxWidth: 470, padding: "10px 16px 12px", marginBottom: 12, borderRadius: 18,
          borderBottomLeftRadius: m.me ? 18 : 4, borderBottomRightRadius: m.me ? 4 : 18,
          background: m.me ? C.lime : m.q ? C.cream2 : C.card, border: B(m.q ? 3 : 2.5),
          boxShadow: m.q ? sh(5, C.tomato) : sh(3),
          transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: m.me ? "bottom right" : "bottom left",
        }}
      >
        {m.who && <div style={{ font: `700 17px/1.2 ${F.sans}`, color: C.ink2, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: m.c, border: B(2) }} />{m.who}
          {m.q && <span style={{ font: `700 13px ${F.mono}`, background: C.tomato, color: "#fff", padding: "2px 8px", borderRadius: 99, letterSpacing: ".06em" }}>PERTANYAAN</span>}
        </div>}
        <div style={{ font: `600 ${m.q ? 25 : 23}px/1.3 ${F.sans}`, color: C.ink }}>{m.text}</div>
      </div>
    </div>
  );
};

export const S1Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const win = tw(f, 0, 26, 0, 1, expoOut);
  const unread = MSGS.filter((m) => f >= m.t).length;
  const labelP = pop(f, 128);
  const lastT = MSGS.filter((m) => f >= m.t).reduce((a, m) => Math.max(a, m.t), -99);
  const bump = 1 + 0.15 * Math.max(0, 1 - (f - lastT) / 6);
  return (
    <AbsoluteFill>
      {MSGS.map((m, i) => (
        <Sfx key={i} at={m.t} s={i % 3 === 0 ? "blip" : "pop-high"} v={i < 4 ? 0.55 : 0.22 + (i % 4) * 0.05} />
      ))}
      <Sfx at={128} s="stamp" v={0.9} />

      <div style={{ position: "absolute", left: 140, top: 330, width: 860 }}>
        <Eyebrow text="Sesi tanya jawab, biasanya…" start={4} />
        <div style={{ height: 26 }} />
        <div style={{ position: "relative", height: 260 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Kinetic lines={["Pertanyaan", "dikirim ke grup."]} start={8} size={108} exit={90} />
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <Kinetic lines={["Lalu tenggelam", "di antara obrolan."]} start={100} size={108} hl={{ tenggelam: C.tomato }} hlText={{ tenggelam: "#fff" }} />
          </div>
        </div>
      </div>

      {/* jendela chat */}
      <div
        style={{
          position: "absolute", left: 1100, top: 110, width: 660, height: 860,
          transform: `translateY(${(1 - win) * 260}px) rotate(${3 - 4 * win}deg)`, opacity: win,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: C.card, border: B(4), borderRadius: 34, boxShadow: sh(10), overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 104, flex: "none", display: "flex", alignItems: "center", gap: 18, padding: "0 26px", borderBottom: B(3), background: C.bg }}>
            <div style={{ width: 62, height: 62, borderRadius: 18, border: B(3), background: C.lime, display: "grid", placeItems: "center", font: `800 22px ${F.display}` }}>PAI</div>
            <div style={{ flex: 1 }}>
              <div style={{ font: `800 28px/1.1 ${F.display}`, letterSpacing: "-.02em" }}>Grup Kelas PAI 3B</div>
              <div style={{ font: `600 18px ${F.sans}`, color: C.ink3 }}>38 anggota · {Math.max(3, unread)} sedang mengetik…</div>
            </div>
            <div style={{ minWidth: 64, height: 44, padding: "0 12px", borderRadius: 99, background: C.tomato, color: "#fff", border: B(3), display: "grid", placeItems: "center", font: `700 20px ${F.mono}`, transform: `scale(${bump})` }}>
              {unread > 15 ? "99+" : unread * 7}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 24px 6px", overflow: "hidden", background: "#F6F0E2" }}>
            {MSGS.map((m, i) => <Bubble key={i} m={m} />)}
          </div>
        </div>
        {/* label tertimbun */}
        <div
          style={{
            position: "absolute", left: -120, top: 120, padding: "18px 26px", background: C.tomato, color: "#fff",
            border: B(4), borderRadius: 20, boxShadow: sh(7), font: `800 34px/1.1 ${F.display}`, letterSpacing: "-.02em",
            transform: `scale(${labelP}) rotate(${-7 * labelP}deg)`, opacity: f >= 128 ? 1 : 0, whiteSpace: "nowrap",
          }}
        >
          1 pertanyaan, tertimbun 17 chat ↑
        </div>
      </div>
    </AbsoluteFill>
  );
};
