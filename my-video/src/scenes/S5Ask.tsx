import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoInOut, expoOut, glide, pop, press, quintOut, tw } from "../anim";
import { Avatar, Chip, Eyebrow, Kinetic, Ripple, Sfx, Spark, StepBadge, TypeSfx } from "../components/ui";
import { AVATARS } from "../lib/avatars";

const PICK = 10; // Kucing Oren
// Disinkronkan dengan VO: "Pilih avatar, | tulis pertanyaan, | kirim. | Yang malu bisa pakai nama avatar, | dan NIM nggak pernah terlihat teman."
const SEL0 = 10, SEL1 = 40;
const T_SEG = 44;
const Q = "Apa beda zakat fitrah dan zakat mal?";
const T_TYPE = 50, CPS = 36;
const T_SEND = 88;
const T_DONE = 94;
const T_BADGE = 120;
const T_SUB = 112;
const T_NIM = 180;

const selAt = (f: number) => Math.round(tw(f, SEL0, SEL1, 0, PICK, quintOut));
const SW = 64, GAP = 10;

export const S5Ask: React.FC = () => {
  const f = useCurrentFrame();
  const phone = glide(f, 0);
  const sel = selAt(f);
  // kapan terakhir indeks berganti → efek "boing" pada avatar besar
  let lastChange = SEL0;
  for (let k = SEL0; k <= f && k <= SEL1; k++) if (selAt(k) !== selAt(k - 1)) lastChange = k;
  const boing = 1 + 0.14 * Math.max(0, 1 - (f - lastChange) / 6);
  const ticks: number[] = [];
  for (let k = SEL0 + 1; k <= SEL1; k++) if (selAt(k) !== selAt(k - 1)) ticks.push(k);

  const avatarMode = f >= T_SEG;
  const segX = tw(f, T_SEG, T_SEG + 10, 0, 1, expoOut);
  const qN = Math.max(0, Math.min(Q.length, Math.floor(((f - T_TYPE) / 30) * CPS)));
  const done = tw(f, T_DONE, T_DONE + 18, 0, 1, expoInOut);
  const badge = pop(f, T_BADGE);
  const nim = pop(f, T_NIM);
  const stripX = -Math.max(0, sel * (SW + GAP) - 150);
  const stripXs = -Math.max(0, tw(f, SEL0, SEL1, 0, PICK, quintOut) * (SW + GAP) - 150);

  return (
    <AbsoluteFill>
      <Sfx at={0} s="swish" v={0.4} />
      {ticks.map((t) => <Sfx key={t} at={t} s="tick" v={0.3} />)}
      <Sfx at={SEL1} s="pop" v={0.5} />
      <Sfx at={T_SEG} s="click" v={0.7} />
      <TypeSfx text={Q} start={T_TYPE} cps={CPS} every={2} v={0.3} />
      <Sfx at={T_SEND} s="click" v={0.8} />
      <Sfx at={T_DONE + 4} s="success" v={0.65} />
      <Sfx at={T_BADGE} s="stamp" v={0.7} />
      <Sfx at={T_NIM} s="pop" v={0.5} />

      <div style={{ position: "absolute", left: 140, top: 210, width: 900 }}>
        <StepBadge n={2} start={4} bg={C.bubble} />
        <div style={{ height: 40 }} />
        <Eyebrow text="Langkah 2 · Teman sekelas" start={8} />
        <div style={{ height: 22 }} />
        <Kinetic lines={["Pilih avatar,", "lalu kirim", "pertanyaan."]} start={12} size={96} hl={{ avatar: C.bubble }} />
        <div style={{ marginTop: 34, font: `600 32px/1.45 ${F.sans}`, color: C.ink2, opacity: tw(f, T_SUB, T_SUB + 16), transform: `translateY(${tw(f, T_SUB, T_SUB + 20, 24, 0)}px)` }}>
          Malu? Tampil pakai nama avatar.<br />NIM tidak pernah terlihat teman.
        </div>
      </div>

      {/* HP */}
      <div style={{ position: "absolute", left: 1210, top: 84, width: 450, height: 912, transform: `translateY(${(1 - phone) * 900}px) rotate(${-3 + 9 * (1 - phone)}deg)` }}>
        <div style={{ position: "absolute", inset: 0, background: C.ink, borderRadius: 66, boxShadow: sh(14, "rgba(18,18,18,.22)") }} />
        <div style={{ position: "absolute", inset: 13, background: C.bg, borderRadius: 54, overflow: "hidden" }}>
          {/* status bar */}
          <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", font: `700 17px ${F.sans}` }}>
            <span>09.41</span><span style={{ width: 110, height: 30, borderRadius: 99, background: C.ink }} /><span>100%</span>
          </div>
          {/* header */}
          <div style={{ margin: "4px 16px 0", padding: "16px 18px", background: C.sun, border: B(3), borderRadius: 22, boxShadow: sh(4) }}>
            <Chip size={15} bg={C.card}>PAI · Kelompok 3</Chip>
            <div style={{ font: `800 31px/1.05 ${F.display}`, letterSpacing: "-.02em", marginTop: 10 }}>Zakat dalam Islam</div>
          </div>
          {/* avatar box */}
          <div style={{ margin: "16px 16px 0", padding: "14px 14px 8px", background: C.card, border: B(3), borderRadius: 22, boxShadow: sh(3) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ transform: `scale(${boing})` }}><Avatar i={sel} size={74} /></div>
              <div>
                <div style={{ font: `700 13px ${F.mono}`, letterSpacing: ".08em", color: C.ink2 }}>AVATARMU</div>
                <div style={{ font: `800 25px/1.15 ${F.display}` }}>{AVATARS[sel].name}</div>
              </div>
            </div>
            <div style={{ overflow: "hidden", marginTop: 10 }}>
              <div style={{ display: "flex", gap: GAP, padding: "6px 2px 8px", transform: `translateX(${f < SEL1 ? stripXs : stripX}px)` }}>
                {AVATARS.map((_, i) => (
                  <div key={i} style={{ flex: "none", width: SW, height: SW, padding: 5, borderRadius: 16, border: B(2.5), background: i === sel ? C.ink : C.card, boxShadow: i === sel ? sh(3, C.tomato) : "none" }}>
                    <Avatar i={i} size={SW - 15} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* segmented */}
          <div style={{ margin: "14px 16px 0", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", border: B(3), borderRadius: 16, overflow: "hidden", background: C.bg, height: 54 }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, width: "50%", left: `${segX * 50}%`, background: C.ink }} />
            {["Nama asli", "Nama avatar"].map((t, i) => (
              <div key={t} style={{ position: "relative", display: "grid", placeItems: "center", font: `700 18px ${F.sans}`, color: (i === 1) === avatarMode ? "#fff" : C.ink }}>{t}</div>
            ))}
          </div>
          <div style={{ margin: "8px 20px 0", font: `600 15px ${F.sans}`, color: C.ink3 }}>
            Teman melihatmu sebagai <b style={{ color: C.ink }}>{avatarMode ? AVATARS[PICK].name : "Rani Putri"}</b>
          </div>
          {/* textarea */}
          <div style={{ margin: "14px 16px 0", padding: "14px 16px", height: 168, background: C.card, border: B(3), borderRadius: 20, boxShadow: f > T_TYPE - 4 && f < T_SEND ? sh(4, C.sky) : "none" }}>
            <div style={{ font: `700 16px ${F.sans}`, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>Pertanyaanmu <span style={{ color: C.ink3, font: `500 14px ${F.mono}` }}>{qN}/300</span></div>
            <div style={{ font: `600 23px/1.35 ${F.sans}` }}>
              {qN === 0 ? <span style={{ color: C.ink3 }}>Tulis pertanyaanmu…</span> : Q.slice(0, qN)}
              {f >= T_TYPE && f < T_SEND && <span style={{ display: "inline-block", width: 3, height: 26, background: C.tomato, verticalAlign: "-5px", marginLeft: 2, opacity: Math.floor(f / 7) % 2 || qN < Q.length ? 1 : 0 }} />}
            </div>
          </div>
          {/* tombol kirim */}
          <div style={{ margin: "20px 16px 0", height: 76, borderRadius: 20, border: B(3), background: C.tomato, color: "#fff", display: "grid", placeItems: "center", font: `700 25px ${F.sans}`, boxShadow: sh(5), transform: `scale(${press(f, T_SEND)})` }}>
            Kirim pertanyaan →
          </div>
          <Ripple x={212} y={812} at={T_SEND} color={C.ink} />
          <Ripple x={318} y={392} at={T_SEG} color={C.tomato} size={70} />

          {/* layar sukses */}
          <div style={{ position: "absolute", inset: 0, background: C.bg, transform: `translateY(${(1 - done) * 105}%)`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150 }}>
            <div style={{ position: "relative", width: 250, height: 250 }}>
              <svg width="250" height="250" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, transform: `rotate(${f * 1.6}deg)` }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <path key={i} d="M50 50 L46 2 L54 2 Z" fill={i % 2 ? C.sun : C.bubble} transform={`rotate(${i * 30} 50 50)`} />
                ))}
              </svg>
              <div style={{ position: "absolute", inset: 45, transform: `scale(${pop(f, T_DONE + 6)})` }}><Avatar i={PICK} size={160} /></div>
            </div>
            <div style={{ font: `800 50px/1 ${F.display}`, letterSpacing: "-.03em", marginTop: 18 }}>Terkirim!</div>
            <div style={{ font: `600 20px/1.4 ${F.sans}`, color: C.ink2, marginTop: 10, textAlign: "center", padding: "0 40px" }}>Pertanyaanmu sudah muncul<br />di layar kelas.</div>
            <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: C.mint, border: B(3), borderRadius: 20, boxShadow: sh(5), transform: `scale(${badge}) rotate(${-3 * badge}deg)`, opacity: f >= T_BADGE ? 1 : 0 }}>
              <Spark size={44} color={C.sun} />
              <div>
                <div style={{ font: `800 23px/1.1 ${F.display}` }}>Berani Bertanya</div>
                <div style={{ font: `600 15px ${F.sans}` }}>Lencana pertanyaan pertama</div>
              </div>
            </div>
            {/* privasi: NIM tidak terlihat teman */}
            <div style={{ marginTop: 22, width: 340, padding: "12px 16px", background: C.card, border: B(3), borderRadius: 18, boxShadow: sh(3), font: `600 17px/1.5 ${F.sans}`, transform: `scale(${nim}) rotate(${2 * nim}deg)`, opacity: f >= T_NIM ? 1 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.ink3 }}>Teman melihat</span><b>Kucing Oren</b></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.ink3 }}>NIM</span><b>🔒 disembunyikan</b></div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
