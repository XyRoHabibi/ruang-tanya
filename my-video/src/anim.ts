import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;

// Kurva gerak: expo untuk perpindahan (cepat lalu halus), back hanya untuk "pop" stiker.
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const expoIn = Easing.bezier(0.7, 0, 0.84, 0);
export const expoInOut = Easing.bezier(0.87, 0, 0.13, 1);
export const quintOut = Easing.bezier(0.22, 1, 0.36, 1);

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Nilai dari `from` ke `to` antara frame a..b (di-clamp). */
export const tw = (f: number, a: number, b: number, from = 0, to = 1, easing = expoOut) =>
  interpolate(f, [a, b], [from, to], { ...CL, easing });

/** Pegas tanpa memantul untuk gerak UI. */
export const glide = (f: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: f - delay, fps: FPS, config: { damping: 200, stiffness: 120 }, durationInFrames });

/** Pegas dengan sedikit overshoot untuk stiker yang "ditempel". */
export const pop = (f: number, delay = 0) =>
  spring({ frame: f - delay, fps: FPS, config: { damping: 11, stiffness: 190, mass: 0.7 } });

/** Ketikan: jumlah karakter yang terlihat. */
export const typed = (text: string, f: number, start: number, cps = 22) =>
  text.slice(0, Math.max(0, Math.floor(((f - start) / FPS) * cps)));

/** Posisi berdasarkan keyframe [{f,x,y}], antar-keyframe pakai expoInOut. */
export type Key = { f: number; x: number; y: number };
export const path = (f: number, keys: Key[]) => {
  if (f <= keys[0].f) return { x: keys[0].x, y: keys[0].y };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (f <= b.f) {
      const p = tw(f, a.f, b.f, 0, 1, expoInOut);
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l.x, y: l.y };
};

/** Tekanan klik: 1 → 0.85 → 1 di sekitar frame `at`. */
export const press = (f: number, at: number) =>
  interpolate(f, [at - 3, at, at + 6], [1, 0.84, 1], CL);
