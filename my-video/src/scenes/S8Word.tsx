import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, C, F, sh } from "../brand";
import { expoInOut, expoOut, glide, path, pop, press, tw } from "../anim";
import { Chip, Cursor, Eyebrow, Kinetic, Ripple, Sfx, StepBadge } from "../components/ui";

const ROWS = [
  ["1", "Rani Putri", "2310511042", "3", "Apa beda zakat fitrah dan zakat mal?", "Zakat fitrah wajib bagi setiap muslim, dibayar sebelum salat Id…"],
  ["2", "Dimas Arya", "2310511017", "1", "Siapa saja yang berhak menerima zakat?", "Ada delapan golongan (asnaf) sesuai QS. At-Taubah: 60…"],
  ["3", "Salsa Nabila", "2310511088", "2", "Apakah zakat profesi termasuk zakat mal?", "Mayoritas ulama kontemporer memasukkannya ke zakat mal…"],
  ["4", "Fikri Hakim", "2310511063", "4", "Boleh bayar zakat fitrah pakai uang?", "Menurut mazhab Hanafi boleh, dan banyak lembaga zakat…"],
  ["5", "Nadia Safitri", "2310511029", "3", "Kalau lupa bayar zakat fitrah gimana?", "Tetap wajib dibayar (qadha) meski waktunya sudah lewat…"],
];
const COLW = [44, 140, 128, 52, 250, 0];
const HEAD = ["No", "Nama", "NIM", "Kel.", "Pertanyaan", "Jawaban"];
const T_ROW = 18;
const T_CLICK = 78;
const T_SAVED = 130; // "siap dikirim ke dosen"
const DOC = { x: 110, y: 170, w: 980, h: 693 };
const BTN = { x: 870, y: 950 };

export const S8Word: React.FC = () => {
  const f = useCurrentFrame();
  const doc = glide(f, 0);
  const tilt = tw(f, 0, 180, 1, 0, (x) => x);
  const file = tw(f, T_CLICK + 4, T_CLICK + 26, 0, 1, expoInOut);
  const saved = pop(f, T_SAVED);
  const cur = path(f, [
    { f: 46, x: 1300, y: 1180 },
    { f: 72, x: BTN.x + 10, y: BTN.y + 6 },
    { f: 96, x: BTN.x + 30, y: BTN.y + 24 },
    { f: 124, x: 1200, y: 1220 },
  ]);

  return (
    <AbsoluteFill>
      <Sfx at={0} s="whoosh" v={0.4} />
      {ROWS.map((_, i) => <Sfx key={i} at={T_ROW + i * 10} s="tick" v={0.3} />)}
      <Sfx at={T_CLICK} s="click" v={0.8} />
      <Sfx at={T_CLICK + 4} s="swish" v={0.4} />
      <Sfx at={T_CLICK + 24} s="pop-low" v={0.5} />
      <Sfx at={T_SAVED} s="success" v={0.6} />

      {/* dokumen */}
      <div style={{ position: "absolute", left: DOC.x, top: DOC.y, width: DOC.w, height: DOC.h, transformOrigin: "60% 50%", transform: `perspective(2200px) translateX(${(1 - doc) * -700}px) rotateY(${14 * tilt + (1 - doc) * 20}deg) rotateX(${5 * tilt}deg)` }}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", border: B(4), borderRadius: 10, boxShadow: sh(12), padding: "38px 40px", fontFamily: F.serif, color: "#111" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 24, letterSpacing: ".04em" }}>REKAP TANYA JAWAB</div>
          <div style={{ textAlign: "center", fontSize: 16, marginTop: 4, color: "#333" }}>Pendidikan Agama Islam · Kelompok 3 · Zakat dalam Islam</div>
          <div style={{ marginTop: 26, border: "1.5px solid #111" }}>
            <div style={{ display: "flex", background: "#E9E9E9", fontWeight: 700, fontSize: 15, borderBottom: "1.5px solid #111" }}>
              {HEAD.map((h, i) => <div key={h} style={{ width: COLW[i] || undefined, flex: COLW[i] ? "none" : 1, padding: "8px 8px", borderLeft: i ? "1px solid #111" : "none" }}>{h}</div>)}
            </div>
            {ROWS.map((r, ri) => {
              const p = tw(f, T_ROW + ri * 10, T_ROW + ri * 10 + 14, 0, 1, expoOut);
              return (
                <div key={ri} style={{ display: "flex", fontSize: 14.5, lineHeight: 1.3, borderTop: ri ? "1px solid #111" : "none", height: 92, background: ri === 0 && f > T_ROW + 6 ? `rgba(255,201,60,${0.35 * (1 - tw(f, 60, 90))})` : "transparent" }}>
                  {r.map((c, ci) => (
                    <div key={ci} style={{ width: COLW[ci] || undefined, flex: COLW[ci] ? "none" : 1, padding: "8px 8px", borderLeft: ci ? "1px solid #111" : "none", overflow: "hidden" }}>
                      <div style={{ opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>{c}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", bottom: 22, right: 40, fontSize: 13, color: "#666" }}>Dibuat otomatis oleh Ruang Tanya</div>
        </div>
      </div>

      {/* toolbar unduh */}
      <div style={{ position: "absolute", left: DOC.x, top: 900, width: DOC.w, height: 104, background: C.card, border: B(3), borderRadius: 24, boxShadow: sh(5), display: "flex", alignItems: "center", gap: 16, padding: "0 16px 0 22px", opacity: tw(f, 34, 48), transform: `translateY(${tw(f, 34, 54, 40, 0)}px)` }}>
        <div style={{ width: 54, height: 64, borderRadius: 8, border: B(3), background: C.sky, color: "#fff", display: "grid", placeItems: "center", font: `800 16px ${F.display}` }}>.docx</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 24px ${F.mono}` }}>rekap-PAI3B.docx</div>
          <div style={{ font: `600 17px ${F.sans}`, color: C.ink3 }}>5 pertanyaan · A4 landscape · Times New Roman</div>
        </div>
        <div style={{ padding: "20px 30px", borderRadius: 18, border: B(3), background: C.tomato, color: "#fff", font: `700 25px ${F.sans}`, boxShadow: sh(4), transform: `scale(${press(f, T_CLICK)})` }}>
          Unduh Word ↓
        </div>
      </div>

      {/* file terbang */}
      {f > T_CLICK + 3 && (
        <div style={{ position: "absolute", left: BTN.x - 50 + file * 360, top: BTN.y - 70 - Math.sin(Math.PI * file) * 220 + file * -10, transform: `scale(${0.6 + 0.6 * Math.sin(Math.PI * Math.min(file, 0.5))}) rotate(${file * 20}deg)`, opacity: 1 - tw(f, T_CLICK + 22, T_CLICK + 28) }}>
          <div style={{ width: 90, height: 110, borderRadius: 12, border: B(4), background: C.sky, color: "#fff", display: "grid", placeItems: "center", font: `800 24px ${F.display}`, boxShadow: sh(5) }}>.docx</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 1170, top: 935, transform: `scale(${saved}) rotate(${-3 * saved}deg)`, opacity: f >= T_SAVED ? 1 : 0 }}>
        <Chip bg={C.mint} size={26} style={{ boxShadow: sh(4), padding: "12px 20px" }}>✓ Tersimpan, siap dikirim ke dosen</Chip>
      </div>

      {/* judul */}
      <div style={{ position: "absolute", left: 1190, top: 200, width: 640 }}>
        <StepBadge n={5} start={4} bg={C.lime} />
        <div style={{ height: 40 }} />
        <Eyebrow text="Langkah 5 · Setelah sesi" start={8} />
        <div style={{ height: 22 }} />
        <Kinetic lines={["Rekap Word,", "siap dikirim", "ke dosen."]} start={12} size={90} hl={{ Word: C.sky }} hlText={{ Word: "#fff" }} />
        <div style={{ marginTop: 30, font: `600 30px/1.45 ${F.sans}`, color: C.ink2, opacity: tw(f, 48, 62), transform: `translateY(${tw(f, 48, 66, 24, 0)}px)` }}>
          Nama, NIM, pertanyaan, dan jawaban<br />tersusun rapi. Tanpa salin-tempel.
        </div>
      </div>

      <Ripple x={BTN.x + 10} y={BTN.y + 6} at={T_CLICK} color={C.ink} />
      <Cursor x={cur.x} y={cur.y} scale={press(f, T_CLICK)} />
    </AbsoluteFill>
  );
};
