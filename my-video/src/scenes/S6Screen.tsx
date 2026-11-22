import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoInOut, expoOut, glide, pop, tw } from "../anim";
import { Avatar, Chip, Kinetic, LiveDot, Sfx, StepBadge } from "../components/ui";
import { LINK } from "../config";

type Q = { av: number; name: string; text: string; v0: number; v1: number };
const QUEUE: Q[] = [
  { av: 1, name: "Kak Ambis", text: "Apakah zakat profesi termasuk zakat mal?", v0: 12, v1: 12 },
  { av: 3, name: "Bang Santuy", text: "Boleh bayar zakat fitrah pakai uang?", v0: 9, v1: 10 },
  { av: 7, name: "Alien Nyasar", text: "Siapa saja yang berhak menerima zakat?", v0: 3, v1: 17 },
  { av: 4, name: "Neng Ceria", text: "Kalau lupa bayar zakat fitrah gimana?", v0: 0, v1: 2 },
];
const T_NEW = 40; // kartu ke-4 masuk
const T_VOTE0 = 98, T_VOTE1 = 176;
const T_SWAP = 188;
const ORDER0 = [0, 1, 2, 3], ORDER1 = [2, 0, 1, 3];
const EMO = ["👏", "🔥", "🤯", "😂", "🤲"];

export const S6Screen: React.FC = () => {
  const f = useCurrentFrame();
  const win = glide(f, 2);
  const swap = tw(f, T_SWAP, T_SWAP + 18, 0, 1, expoInOut);
  const toast = tw(f, T_NEW - 4, T_NEW + 10, 0, 1, expoOut) * (1 - tw(f, T_NEW + 54, T_NEW + 66, 0, 1, expoOut));
  const cam = 1 + 0.035 * tw(f, 20, 240, 0, 1, (x) => x);
  const votes = QUEUE.map((q) => Math.round(tw(f, T_VOTE0, T_VOTE1, q.v0, q.v1, (x) => x)));
  const curious = Math.round(tw(f, 30, 200, 18, 31, (x) => x));
  const reactions = Array.from({ length: 15 }, (_, i) => ({
    t: 100 + i * 8 + Math.floor(random(`rt${i}`) * 4),
    x: 1620 + random(`rx${i}`) * 200,
    e: EMO[Math.floor(random(`re${i}`) * EMO.length)],
    s: 50 + random(`rs${i}`) * 26,
  }));

  return (
    <AbsoluteFill>
      <Sfx at={2} s="whoosh" v={0.45} />
      <Sfx at={T_NEW} s="ding" v={0.6} />
      {Array.from({ length: 14 }).map((_, i) => <Sfx key={i} at={T_VOTE0 + i * 5.5} s="tick" v={0.16} />)}
      <Sfx at={T_SWAP} s="swish" v={0.5} />
      {reactions.filter((_, i) => i % 3 === 0).map((r, i) => <Sfx key={"r" + i} at={r.t} s="pop-high" v={0.2} />)}

      <div style={{ position: "absolute", left: 120, top: 64, display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ transform: "scale(.78)", transformOrigin: "left center" }}><StepBadge n={3} start={4} bg={C.mint} /></div>
        <Kinetic lines={["Langsung tampil di layar kelas."]} start={8} size={74} stagger={2.5} hl={{ layar: C.mint }} />
      </div>

      <div
        style={{
          position: "absolute", left: 120, top: 220, width: 1680, height: 800, transformOrigin: "50% 0%",
          transform: `perspective(2400px) translateY(${(1 - win) * 500}px) rotateX(${(1 - win) * 18}deg) scale(${cam})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: C.bg, border: B(4), borderRadius: 32, boxShadow: sh(12), overflow: "hidden" }}>
          {/* chrome */}
          <div style={{ height: 68, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: B(3), background: C.card }}>
            {[C.tomato, C.sun, C.mint].map((c) => <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, border: B(2.5) }} />)}
            <span style={{ flex: 1, textAlign: "center", font: `700 20px ${F.mono}`, color: C.ink2 }}>{LINK}/layar</span>
            <Chip bg={C.tomato} color="#fff" size={18}><LiveDot size={11} />LIVE · 38 online</Chip>
          </div>
          {/* sedang dibahas */}
          <div style={{ position: "absolute", left: 34, top: 102, width: 1000, height: 664, background: C.sun, border: B(4), borderRadius: 30, boxShadow: sh(8), padding: "40px 46px", display: "flex", flexDirection: "column" }}>
            <Chip bg={C.ink} color="#fff" size={20} style={{ alignSelf: "flex-start" }}><LiveDot size={11} />SEDANG DIBAHAS</Chip>
            <div style={{ flex: 1, font: `800 84px/1.04 ${F.display}`, letterSpacing: "-.035em", marginTop: 40 }}>
              Apa beda zakat fitrah dan zakat mal?
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Avatar i={10} size={84} />
              <div style={{ flex: 1 }}>
                <div style={{ font: `800 30px/1.1 ${F.display}` }}>Kucing Oren</div>
                <div style={{ font: `600 19px ${F.sans}`, color: C.ink2 }}>baru saja</div>
              </div>
              <Chip size={22} bg={C.card} style={{ boxShadow: sh(3) }}>🙋 <b style={{ font: `800 26px ${F.display}` }}>{curious}</b> juga penasaran</Chip>
            </div>
          </div>
          {/* antrean */}
          <div style={{ position: "absolute", left: 1066, top: 102, width: 580 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ font: `800 30px ${F.display}` }}>Antrean</span>
              <span style={{ font: `700 16px ${F.mono}`, color: C.ink3, letterSpacing: ".08em" }}>URUT: TERPOPULER</span>
            </div>
            <div style={{ position: "relative", height: 560 }}>
              {QUEUE.map((q, i) => {
                const y = (ORDER0.indexOf(i) * (1 - swap) + ORDER1.indexOf(i) * swap) * 138;
                const isNew = i === 3;
                const drop = isNew ? tw(f, T_NEW, T_NEW + 14, 0, 1, expoOut) : 1;
                const hot = i === 2 && f >= T_SWAP;
                const lift = i === 2 ? Math.sin(Math.PI * swap) : 0;
                return (
                  <div key={i} style={{
                    position: "absolute", left: 0, right: 0, top: y, height: 122, background: hot ? C.cream2 : C.card, border: B(3), borderRadius: 22,
                    boxShadow: hot ? sh(6, C.tomato) : sh(4), padding: "14px 16px", display: "flex", gap: 14, alignItems: "center",
                    transform: `translateY(${(1 - drop) * -40}px) scale(${1 + 0.05 * lift}) rotate(${(1 - drop) * -3}deg)`, opacity: drop, zIndex: i === 2 ? 2 : 1,
                  }}>
                    <Avatar i={q.av} size={58} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: `700 16px ${F.sans}`, color: C.ink2 }}>{q.name}</div>
                      <div style={{ font: `600 21px/1.25 ${F.sans}` }}>{q.text}</div>
                    </div>
                    <div style={{ minWidth: 60, height: 40, borderRadius: 99, background: hot ? C.tomato : C.ink, color: "#fff", display: "grid", placeItems: "center", font: `700 19px ${F.mono}`, flex: "none" }}>+{votes[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* notifikasi */}
        <div style={{ position: "absolute", right: 40, top: 90 + (1 - toast) * -30, opacity: toast, padding: "16px 22px", background: C.ink, color: "#fff", border: "3px solid #fff", borderRadius: 18, boxShadow: sh(5, C.tomato), font: `600 22px ${F.sans}`, display: "flex", alignItems: "center", gap: 12, zIndex: 5 }}>
          <Avatar i={4} size={40} /> Pertanyaan baru dari <b>Neng Ceria</b>
        </div>
      </div>

      {/* reaksi melayang */}
      {reactions.map((r, i) => {
        const l = f - r.t;
        if (l < 0 || l > 70) return null;
        const y = 1000 - tw(l, 0, 70, 0, 620, (x) => x);
        const sway = Math.sin((l + i * 7) / 9) * 22;
        const s = pop(l, 0);
        return <div key={i} style={{ position: "absolute", left: r.x + sway, top: y, fontSize: r.s, transform: `scale(${s})`, opacity: 1 - tw(l, 45, 70) }}>{r.e}</div>;
      })}
    </AbsoluteFill>
  );
};
