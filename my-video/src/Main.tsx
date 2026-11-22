import React from "react";
import { AbsoluteFill, getStaticFiles, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { B, C } from "./brand";
import { expoInOut, tw } from "./anim";
import { Sfx } from "./components/ui";
import timeline from "./timeline.json";
import { S1Chaos } from "./scenes/S1Chaos";
import { S2Shy } from "./scenes/S2Shy";
import { S3Reveal } from "./scenes/S3Reveal";
import { S4Share } from "./scenes/S4Share";
import { S5Ask } from "./scenes/S5Ask";
import { S6Screen } from "./scenes/S6Screen";
import { S7AI } from "./scenes/S7AI";
import { S8Word } from "./scenes/S8Word";
import { S9Outro } from "./scenes/S9Outro";

const COMP: Record<string, React.FC> = {
  chaos: S1Chaos, shy: S2Shy, reveal: S3Reveal, share: S4Share, ask: S5Ask,
  screen: S6Screen, ai: S7AI, word: S8Word, outro: S9Outro,
};

// Warna panel transisi di AWAL tiap scene. Scene tanpa entri = transisi morph (tanpa panel).
const WIPE: Record<string, string[]> = {
  shy: [C.sky, C.ink],
  share: [C.sun, C.tomato],
  ask: [C.bubble, C.ink],
  screen: [C.mint, C.sun],
  ai: [C.sky, C.ink],
  word: [C.lime, C.tomato],
  outro: [C.sun, C.tomato, C.ink],
};

export const SCENES = (() => {
  let acc = 0;
  return timeline.scenes.map((s) => {
    const r = { ...s, from: acc };
    acc += s.dur;
    return r;
  });
})();
export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

// Voice over: taruh file di public/vo/<id-scene>.mp3 (mis. vo/chaos.mp3) atau satu file public/vo/full.mp3
const STATIC = new Set(getStaticFiles().map((f) => f.name));
const voFor = (id: string) => ["mp3", "wav"].map((e) => `vo/${id}.${e}`).find((n) => STATIC.has(n));
const VO_FULL = ["vo/full.mp3", "vo/full.wav"].find((n) => STATIC.has(n));
const HAS_VO = Boolean(VO_FULL) || SCENES.some((s) => voFor(s.id));
export const VO_OFFSET = 6; // jeda kecil sebelum narasi tiap scene mulai

const Wipe: React.FC<{ colors: string[] }> = ({ colors }) => {
  const f = useCurrentFrame();
  const PW = 3300;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {colors.map((c, i) => {
        const d = (colors.length - 1 - i) * 2.5;
        const p = tw(f, 0 - d, 30 - d, 0, 1, expoInOut);
        const x = (1 - 2 * p) * 2750;
        return (
          <div key={i} style={{ position: "absolute", top: -40, bottom: -40, left: (1920 - PW) / 2, width: PW, background: c, borderLeft: B(6), borderRight: B(6), transform: `translateX(${x}px) skewX(-14deg)` }} />
        );
      })}
    </AbsoluteFill>
  );
};

const Cam: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const s = 1 + 0.02 * (f / dur);
  return <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

const Grid: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(18,18,18,.085) 2px, transparent 2.5px)", backgroundSize: "44px 44px", backgroundPosition: `${f * 0.4}px ${f * 0.2}px` }} />
  );
};

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Grid />
      {SCENES.map((s) => {
        const Comp = COMP[s.id];
        const vo = voFor(s.id);
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
            <Cam dur={s.dur}><Comp /></Cam>
            {vo && (
              <Sequence from={VO_OFFSET} layout="none" name={`vo:${s.id}`}>
                <Html5Audio src={staticFile(vo)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
      {SCENES.filter((s) => WIPE[s.id]).map((s) => (
        <Sequence key={"w" + s.id} from={s.from - 15} durationInFrames={34} name={`wipe→${s.id}`}>
          <Wipe colors={WIPE[s.id]} />
          <Sfx at={4} s="whoosh" v={0.5} />
        </Sequence>
      ))}
      {VO_FULL && <Html5Audio src={staticFile(VO_FULL)} />}
      <Html5Audio
        src={staticFile("sfx/music.wav")}
        // Musik turun di bawah narasi, lalu naik lagi setelah kata terakhir VO
        volume={(f) => (HAS_VO ? interpolate(f, [timeline.voEnd - 10, timeline.voEnd + 15], [0.2, 0.42], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.5)}
      />
    </AbsoluteFill>
  );
};
