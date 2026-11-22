import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../brand";
import { expoInOut, expoOut, pop, tw } from "../anim";
import { Avatar, Kinetic, Logo, Sfx } from "../components/ui";

const WORD = "Ruang Tanya";

export const S3Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 0);
  const lift = tw(f, 2, 16, 0, 1, expoOut);
  const draw = tw(f, 6, 26, 0, 1, expoOut);
  const slide = tw(f, 26, 48, 0, 1, expoInOut);
  const logoX = 960 + (560 - 960) * slide;
  const logoS = (0.5 + 0.5 * p) * (1 - 0.3 * slide);
  const ring = tw(f, 0, 22, 0, 1, expoOut);

  return (
    <AbsoluteFill>
      <Sfx at={0} s="impact" v={0.95} />
      {Array.from({ length: 6 }).map((_, i) => <Sfx key={i} at={12 + i * 4} s={i % 2 ? "pop" : "pop-high"} v={0.35} />)}
      <Sfx at={30} s="swish" v={0.45} />

      {/* gelombang kejut */}
      <div
        style={{
          position: "absolute", left: 960 - 300, top: 540 - 300, width: 600, height: 600, borderRadius: "50%",
          border: `${10 * (1 - ring) + 1}px solid ${C.tomato}`, transform: `scale(${0.3 + ring * 1.6})`, opacity: 1 - ring,
        }}
      />

      {/* avatar mengelilingi */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + 0.26;
        const x = 960 + Math.cos(a) * 800, y = 540 + Math.sin(a) * 405;
        const s = pop(f, 12 + i * 2);
        const bob = Math.sin((f + i * 9) / 14) * 8;
        return (
          <div key={i} style={{ position: "absolute", left: x - 62, top: y - 62 + bob, transform: `scale(${s}) rotate(${(i % 2 ? 1 : -1) * 8 * (1 - s)}deg)` }}>
            <Avatar i={i} size={124} />
          </div>
        );
      })}

      <div style={{ position: "absolute", left: logoX - 150, top: 500 - 150, transform: `scale(${logoS})` }}>
        <Logo size={300} lift={lift} draw={draw} />
      </div>

      {/* wordmark per huruf */}
      <div style={{ position: "absolute", left: 735, top: 500 - 96, display: "flex", font: `800 168px/1.1 ${F.display}`, letterSpacing: "-0.045em", color: C.ink }}>
        {WORD.split("").map((ch, i) => {
          const d = 32 + i * 1.6;
          const y = tw(f, d, d + 18, 110, 0, expoOut);
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0 0.02em 0.1em", whiteSpace: "pre" }}>
              <span style={{ display: "inline-block", transform: `translateY(${y}%)` }}>{ch}</span>
            </span>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 690 }}>
        <Kinetic lines={["Tanya jawab kelas, cukup satu link."]} start={74} size={54} align="center" stagger={2.5} hl={{ link: C.sun }} />
      </div>
    </AbsoluteFill>
  );
};
