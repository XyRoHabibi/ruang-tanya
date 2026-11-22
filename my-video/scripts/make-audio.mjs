// Generator sound design untuk video Ruang Tanya.
// Semua SFX dan musik latar disintesis dari nol (tanpa sampel), jadi bebas lisensi.
// Musik mengikuti src/timeline.json: drop jatuh tepat di scene "reveal",
// dan nada akhir jatuh di logo outro. Jalankan ulang setelah timeline diubah:
//   node scripts/make-audio.mjs
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "sfx");
mkdirSync(OUT, { recursive: true });

const SR = 44100;
const TAU = Math.PI * 2;

// ---------- util ----------
let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

class Biquad {
  constructor(type, f, q = 0.707) {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.type = type;
    this.set(f, q);
  }
  set(f, q = this.q) {
    this.q = q;
    f = clamp(f, 20, SR * 0.45);
    const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0, b1, b2;
    if (this.type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; }
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
  }
  p(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

function writeWav(name, data, peak = 0.89) {
  let m = 0;
  for (const v of data) m = Math.max(m, Math.abs(v));
  const g = m > 0 ? peak / m : 1;
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + data.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    // fade 3 ms di ujung agar tidak ada klik
    const fade = Math.min(1, (data.length - i) / (SR * 0.003));
    buf.writeInt16LE(Math.round(clamp(data[i] * g * fade, -1, 1) * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT, name), buf);
  console.log("  ✓", name, (data.length / SR).toFixed(2) + "s");
}

const make = (sec, fn) => {
  const n = Math.floor(sec * SR);
  const d = new Float32Array(n);
  fn(d, n);
  return d;
};

// ---------- SFX ----------
console.log("SFX:");

// pop: stiker yang muncul
const pop = (f0, f1, len = 0.11) => make(len, (d, n) => {
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.018);
    ph += (TAU * f) / SR;
    const env = Math.min(1, t / 0.002) * Math.exp(-t / 0.03);
    d[i] = Math.sin(ph) * env + rnd() * 0.15 * Math.exp(-t / 0.002);
  }
});
writeWav("pop.wav", pop(1300, 420));
writeWav("pop-low.wav", pop(800, 260, 0.14));
writeWav("pop-high.wav", pop(1900, 700, 0.09));

// blip: notifikasi chat
writeWav("blip.wav", make(0.16, (d, n) => {
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = t < 0.055 ? 990 : 1480;
    const lt = t < 0.055 ? t : t - 0.055;
    const env = Math.min(1, lt / 0.003) * Math.exp(-lt / 0.035);
    d[i] = (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2 * t)) * env;
  }
}));

// click: tombol UI
writeWav("click.wav", make(0.06, (d, n) => {
  const hp = new Biquad("hp", 2500);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    d[i] = hp.p(rnd()) * Math.exp(-t / 0.003) * 0.8 + Math.sin(TAU * 1800 * t) * Math.exp(-t / 0.012) * 0.6
      + Math.sin(TAU * 420 * t) * Math.exp(-t / 0.01) * 0.4;
  }
}));

// tick: kayu kecil (counter, scroll avatar)
writeWav("tick.wav", make(0.04, (d, n) => {
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    d[i] = Math.sin(TAU * 2600 * t) * Math.exp(-t / 0.006) + Math.sin(TAU * 1300 * t) * Math.exp(-t / 0.008) * 0.5;
  }
}));

// ketikan keyboard (3 variasi)
for (let v = 0; v < 3; v++) {
  writeWav(`type${v + 1}.wav`, make(0.07, (d, n) => {
    const bp = new Biquad("bp", 2200 + v * 700, 1.4);
    const thock = 150 + v * 25;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      d[i] = bp.p(rnd()) * Math.exp(-t / 0.006) * 1.4 + Math.sin(TAU * thock * t) * Math.exp(-t / 0.012) * 0.55;
    }
  }));
}

// whoosh: transisi
const whoosh = (len, fLo, fHi, peakAt = 0.6) => make(len, (d, n) => {
  const bp = new Biquad("bp", fLo, 0.9);
  const lp = new Biquad("lp", 6000);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const env = x < peakAt ? Math.pow(x / peakAt, 2) : Math.pow(1 - (x - peakAt) / (1 - peakAt), 1.6);
    const f = fLo + (fHi - fLo) * Math.sin(Math.PI * Math.min(1, x / (peakAt * 1.25)) * 0.5);
    if (i % 32 === 0) bp.set(f, 0.9);
    d[i] = lp.p(bp.p(rnd())) * env;
  }
});
writeWav("whoosh.wav", whoosh(0.5, 300, 3200));
writeWav("swish.wav", whoosh(0.26, 900, 5200, 0.45));

// impact: logo jatuh
writeWav("impact.wav", make(1.4, (d, n) => {
  const lp = new Biquad("lp", 900);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 38 + 85 * Math.exp(-t / 0.07);
    ph += (TAU * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.45);
    const crack = lp.p(rnd()) * Math.exp(-t / 0.05) * 0.9;
    const click = Math.sin(TAU * 3200 * t) * Math.exp(-t / 0.003) * 0.4;
    d[i] = Math.tanh((body * 1.3 + crack + click) * 1.4);
  }
}));

// stamp: stiker ditempel
writeWav("stamp.wav", make(0.3, (d, n) => {
  const lp = new Biquad("lp", 2400);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 70 + 120 * Math.exp(-t / 0.025);
    ph += (TAU * f) / SR;
    d[i] = Math.tanh(Math.sin(ph) * Math.exp(-t / 0.07) * 1.6 + lp.p(rnd()) * Math.exp(-t / 0.018));
  }
}));

// riser: menuju reveal
writeWav("riser.wav", make(2.0, (d, n) => {
  const hp = new Biquad("hp", 300);
  let ph1 = 0, ph2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    if (i % 32 === 0) hp.set(300 + 7000 * x * x, 1.2);
    const f = 180 + 900 * x * x;
    ph1 += (TAU * f) / SR; ph2 += (TAU * f * 1.505) / SR;
    const env = Math.pow(x, 2.2);
    d[i] = (hp.p(rnd()) * 0.7 + (Math.sin(ph1) + 0.5 * Math.sin(ph2)) * 0.25) * env;
  }
}));

// ding: notifikasi pertanyaan baru
const bell = (m, len, dec) => make(len, (d, n) => {
  const f = mtof(m);
  const parts = [[1, 1, 1], [2.0, 0.35, 0.6], [2.76, 0.25, 0.35], [5.4, 0.1, 0.15]];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (const [r, a, k] of parts) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t / (dec * k));
    d[i] = s * Math.min(1, t / 0.002);
  }
});
writeWav("ding.wav", bell(84, 1.2, 0.45));

// success: dua nada naik
writeWav("success.wav", (() => {
  const a = bell(79, 0.9, 0.28), b = bell(86, 1.1, 0.4);
  const off = Math.floor(0.09 * SR);
  const d = new Float32Array(off + b.length);
  a.forEach((v, i) => (d[i] += v * 0.8));
  b.forEach((v, i) => (d[i + off] += v));
  return d;
})());

// ---------- MUSIK LATAR ----------
const tl = JSON.parse(readFileSync(join(ROOT, "src", "timeline.json"), "utf8"));
const fps = tl.fps, BEAT = 60 / tl.bpm, BAR = BEAT * 4;
let acc = 0;
const start = {};
for (const s of tl.scenes) { start[s.id] = acc / fps; acc += s.dur; }
const total = acc / fps;
const T_SHY = start.shy, T_DROP = start.reveal, T_OUT = start.outro;
// nada akhir jatuh di beat (sefase dengan drop) yang paling dekat dengan logo outro
const T_END = T_DROP + Math.round((T_OUT + tl.outroLogo / fps - T_DROP) / BEAT) * BEAT;

console.log(`Musik: ${total.toFixed(1)}s, drop @${T_DROP}s, akhir @${T_END}s`);

const N = Math.ceil((total + 0.2) * SR);
const drums = new Float32Array(N), music = new Float32Array(N), pluckBus = new Float32Array(N);

const add = (bus, t0, len, fn) => {
  const i0 = Math.floor(t0 * SR), n = Math.floor(len * SR);
  for (let i = 0; i < n && i0 + i < N; i++) bus[i0 + i] += fn(i / SR);
};

const kick = (t0, g = 1) => {
  let ph = 0;
  add(drums, t0, 0.45, (t) => {
    ph += (TAU * (45 + 110 * Math.exp(-t / 0.035))) / SR;
    return (Math.sin(ph) * Math.exp(-t / 0.16) + Math.sin(TAU * 2500 * t) * Math.exp(-t / 0.002) * 0.15) * g;
  });
};
const clap = (t0, g = 1) => {
  const bp = new Biquad("bp", 1400, 0.8);
  add(drums, t0, 0.3, (t) => {
    const e = t < 0.03 ? Math.exp(-((t % 0.01) / 0.003)) : Math.exp(-(t - 0.03) / 0.09);
    return bp.p(rnd()) * e * 0.9 * g;
  });
};
const hat = (t0, open = false, g = 1) => {
  const hp = new Biquad("hp", 7500, 0.9);
  add(drums, t0, open ? 0.25 : 0.06, (t) => hp.p(rnd()) * Math.exp(-t / (open ? 0.07 : 0.015)) * 0.35 * g);
};
const bass = (t0, m, len, g = 1) => {
  const lp = new Biquad("lp", 520, 1.1);
  const f = mtof(m);
  add(music, t0, len, (t) => {
    const saw = ((t * f) % 1) * 2 - 1;
    const sub = Math.sin(TAU * f * t);
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.22);
    lp.set(220 + 900 * Math.exp(-t / 0.05), 1.1);
    return (lp.p(saw) * 0.7 + sub * 0.6) * env * 0.55 * g;
  });
};
const pluck = (t0, m, g = 1, dark = false) => {
  const f = mtof(m);
  const lp = new Biquad("lp", dark ? 900 : 3200, 0.8);
  add(pluckBus, t0, 0.5, (t) => {
    const tri = 1 - 4 * Math.abs(((t * f + 0.25) % 1) - 0.5);
    const env = Math.min(1, t / 0.002) * Math.exp(-t / (dark ? 0.09 : 0.16));
    return lp.p(tri + 0.3 * Math.sin(TAU * f * 2 * t)) * env * 0.22 * g;
  });
};
const pad = (t0, notes, len, cutoff = 1400, g = 1) => {
  for (const m of notes) {
    const f = mtof(m);
    const lp = new Biquad("lp", cutoff, 0.6);
    const det = [0.996, 1, 1.004];
    const ph = det.map(() => Math.random());
    add(music, t0, len + 0.6, (t) => {
      let s = 0;
      det.forEach((k, j) => { s += (((t * f * k + ph[j]) % 1) * 2 - 1); });
      const a = Math.min(1, t / 0.35);
      const r = t > len ? Math.exp(-(t - len) / 0.2) : 1;
      return lp.p(s / 3) * a * r * 0.07 * g;
    });
  }
};

// Akor (I–V–vi–IV di C mayor) dan intro tegang di Am/F
const PROG = [
  { root: 36, notes: [60, 64, 67, 72], arp: [72, 76, 79, 84] },
  { root: 43, notes: [59, 62, 67, 71], arp: [71, 74, 79, 83] },
  { root: 45, notes: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  { root: 41, notes: [57, 60, 65, 69], arp: [69, 72, 77, 81] },
];
const INTRO = [PROG[2], PROG[3]];

// 1) Intro "chaos": pluck redam 8-an + hat tipis, tanpa kick
for (let t = 0, b = 0; t < T_SHY - 0.01; t += BEAT / 2, b++) {
  const ch = INTRO[Math.floor(t / BAR) % 2];
  pluck(t, ch.root + 24 + (b % 4 === 3 ? 7 : 0), 0.8, true);
  hat(t + BEAT / 4, false, 0.35);
  if (b % 2 === 0) bass(t, ch.root, BEAT * 0.45, 0.45);
}
pad(0, INTRO[0].notes, T_SHY, 700, 0.8);

// 2) "Malu": hanya pad gelap yang menggantung
for (let t = T_SHY, k = 0; t < T_DROP - 0.01; t += BAR, k++) pad(t, INTRO[k % 2].notes, Math.min(BAR, T_DROP - t), 500, 1);

// 3) Drop → groove penuh sampai nada akhir
for (let t = T_DROP, b = 0; t < T_END - 0.001; t += BEAT, b++) {
  const ch = PROG[Math.floor((t - T_DROP + 1e-6) / BAR) % 4];
  const inBar = b % 4;
  kick(t);
  if (inBar === 1 || inBar === 3) clap(t, 0.8);
  hat(t + BEAT / 2, true, 0.8);
  hat(t + BEAT / 4, false, 0.5); hat(t + (BEAT * 3) / 4, false, 0.5);
  bass(t + BEAT / 2, ch.root + 12, BEAT * 0.45);
  bass(t, ch.root, BEAT * 0.45, 0.8);
  // arpeggio 8-an
  pluck(t, ch.arp[(b * 2) % 4]);
  pluck(t + BEAT / 2, ch.arp[(b * 2 + 1) % 4], 0.7);
  if (inBar === 0) pad(t, ch.notes, BAR, 1600, 1);
}
// Nada akhir: akor C panjang + kick terakhir
kick(T_END, 1.2);
bass(T_END, 36, 2.5, 1.2);
pad(T_END, [48, 60, 64, 67, 72, 76], Math.max(0.5, total - T_END - 0.8), 2200, 1.2);
pluck(T_END, 84, 1.1); pluck(T_END + 0.12, 88, 0.8); pluck(T_END + 0.24, 91, 0.6);

// Delay dotted-8th untuk pluck
const dly = Math.floor(BEAT * 0.75 * SR);
for (let i = dly; i < N; i++) pluckBus[i] += pluckBus[i - dly] * 0.32;

// Sidechain: musik "mengempis" tiap kick setelah drop
const mix = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let duck = 1;
  if (t >= T_DROP && t < T_END + 0.5) {
    const since = (t - T_DROP) % BEAT;
    duck = 1 - 0.55 * Math.exp(-since / 0.11);
  }
  // fade-out di 1.5 detik terakhir
  const fo = Math.min(1, (total - t) / 1.5);
  mix[i] = Math.tanh((drums[i] * 0.9 + (music[i] + pluckBus[i]) * duck) * 1.1) * Math.max(0, fo);
}
writeWav("music.wav", mix, 0.8);
console.log("Selesai →", OUT);
