type Shape = "circle" | "squircle" | "blob" | "ghost";
type Eyes = "dot" | "big" | "sleepy" | "glasses" | "wink" | "star" | "angry" | "three" | "cat";
type Mouth = "smile" | "open" | "o" | "flat" | "grin" | "mustache" | "cat";
type Acc = "none" | "antenna" | "antenna2" | "cap" | "headphone" | "kerudung" | "kerudung2" | "peci" | "crown" | "ears";

export interface AvatarDef { name: string; bg: string; shape: Shape; eyes: Eyes; mouth: Mouth; acc: Acc }

export const AVATARS: AvatarDef[] = [
  { name: "Si Kepo", bg: "#FFC93C", shape: "circle", eyes: "big", mouth: "o", acc: "antenna" },
  { name: "Kak Ambis", bg: "#5B9DFF", shape: "squircle", eyes: "glasses", mouth: "smile", acc: "none" },
  { name: "Mas Ngantuk", bg: "#A7E07A", shape: "blob", eyes: "sleepy", mouth: "flat", acc: "cap" },
  { name: "Bang Santuy", bg: "#3DD6B0", shape: "circle", eyes: "wink", mouth: "grin", acc: "headphone" },
  { name: "Neng Ceria", bg: "#FFD6B0", shape: "circle", eyes: "star", mouth: "open", acc: "kerudung" },
  { name: "Si Paling Kritis", bg: "#FF5B3A", shape: "squircle", eyes: "angry", mouth: "flat", acc: "none" },
  { name: "Profesor Mini", bg: "#F4F1E8", shape: "circle", eyes: "glasses", mouth: "mustache", acc: "peci" },
  { name: "Alien Nyasar", bg: "#A7E07A", shape: "blob", eyes: "three", mouth: "smile", acc: "antenna2" },
  { name: "Hantu Absen", bg: "#FFFFFF", shape: "ghost", eyes: "dot", mouth: "o", acc: "none" },
  { name: "Raja Nanya", bg: "#FF9ECF", shape: "squircle", eyes: "dot", mouth: "grin", acc: "crown" },
  { name: "Kucing Oren", bg: "#FF9A3C", shape: "circle", eyes: "cat", mouth: "cat", acc: "ears" },
  { name: "Si Kalem", bg: "#B8D8FF", shape: "blob", eyes: "sleepy", mouth: "smile", acc: "kerudung2" },
];

const S = 'stroke="#121212" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';

export function avatarSvg(i: number): string {
  const a = AVATARS[i] ?? AVATARS[0];
  let back = "", body = "", top = "", eyes = "", mouth = "";
  if (a.acc === "ears") back = `<path d="M12 26 L14 6 L28 16z" fill="${a.bg}" ${S}/><path d="M52 26 L50 6 L36 16z" fill="${a.bg}" ${S}/>`;
  if (a.acc === "kerudung") back = `<path d="M5 62 C3 30, 12 6, 32 6 C52 6, 61 30, 59 62z" fill="#3D5AFE" ${S}/>`;
  if (a.acc === "kerudung2") back = `<path d="M5 62 C3 30, 12 6, 32 6 C52 6, 61 30, 59 62z" fill="#2E2E2E" ${S}/>`;
  if (a.acc === "headphone") back = `<path d="M9 34 C9 6, 55 6, 55 34" fill="none" stroke="#121212" stroke-width="4"/>`;
  const kr = a.acc === "kerudung" || a.acc === "kerudung2";
  if (a.shape === "circle") body = `<circle cx="32" cy="${kr ? 37 : 35}" r="${kr ? 19 : 24}" fill="${a.bg}" ${S}/>`;
  if (a.shape === "squircle") body = `<rect x="9" y="11" width="46" height="46" rx="16" fill="${a.bg}" ${S}/>`;
  if (a.shape === "blob") body = kr ? `<ellipse cx="32" cy="37" rx="19" ry="20" fill="${a.bg}" ${S}/>` : `<path d="M32 10c15 0 24 9 23 24s-9 23-23 23S8 49 9 33 17 10 32 10z" fill="${a.bg}" ${S}/>`;
  if (a.shape === "ghost") body = `<path d="M11 32c0-13 9-22 21-22s21 9 21 22v24l-5-4-5 4-5-4-6 4-5-4-5 4-5-4-6 4z" fill="${a.bg}" ${S}/>`;
  const ey = 32;
  const star = (x: number, y: number) => `<path d="M${x} ${y - 4.5}L${x + 1.6} ${y - 1.6}L${x + 4.5} ${y}L${x + 1.6} ${y + 1.6}L${x} ${y + 4.5}L${x - 1.6} ${y + 1.6}L${x - 4.5} ${y}L${x - 1.6} ${y - 1.6}z" fill="#121212"/>`;
  switch (a.eyes) {
    case "dot": eyes = `<circle cx="24" cy="${ey}" r="3" fill="#121212"/><circle cx="40" cy="${ey}" r="3" fill="#121212"/>`; break;
    case "big": eyes = `<circle cx="23" cy="${ey - 1}" r="7" fill="#fff" ${S}/><circle cx="41" cy="${ey - 1}" r="7" fill="#fff" ${S}/><circle cx="25" cy="${ey}" r="3.2" fill="#121212"/><circle cx="43" cy="${ey}" r="3.2" fill="#121212"/>`; break;
    case "sleepy": eyes = `<path d="M19 ${ey} q5 4 10 0" fill="none" ${S}/><path d="M35 ${ey} q5 4 10 0" fill="none" ${S}/>`; break;
    case "glasses": eyes = `<circle cx="23" cy="${ey}" r="6.5" fill="#fff" ${S}/><circle cx="41" cy="${ey}" r="6.5" fill="#fff" ${S}/><path d="M29.5 ${ey} h5" ${S}/><circle cx="23" cy="${ey}" r="2.3" fill="#121212"/><circle cx="41" cy="${ey}" r="2.3" fill="#121212"/>`; break;
    case "wink": eyes = `<circle cx="24" cy="${ey}" r="3" fill="#121212"/><path d="M36 ${ey + 1} q4 -5 8 0" fill="none" ${S}/>`; break;
    case "star": eyes = star(24, ey) + star(40, ey); break;
    case "angry": eyes = `<circle cx="24" cy="${ey + 1}" r="3" fill="#121212"/><circle cx="40" cy="${ey + 1}" r="3" fill="#121212"/><path d="M18 ${ey - 7} L28 ${ey - 4}" ${S}/><path d="M46 ${ey - 7} L36 ${ey - 4}" ${S}/>`; break;
    case "three": eyes = `<circle cx="20" cy="${ey}" r="3.6" fill="#fff" ${S}/><circle cx="32" cy="${ey - 4}" r="4.4" fill="#fff" ${S}/><circle cx="44" cy="${ey}" r="3.6" fill="#fff" ${S}/><circle cx="20" cy="${ey}" r="1.5" fill="#121212"/><circle cx="32" cy="${ey - 4}" r="1.8" fill="#121212"/><circle cx="44" cy="${ey}" r="1.5" fill="#121212"/>`; break;
    case "cat": eyes = `<ellipse cx="24" cy="${ey}" rx="2.4" ry="4" fill="#121212"/><ellipse cx="40" cy="${ey}" rx="2.4" ry="4" fill="#121212"/>`; break;
  }
  const my = 44;
  switch (a.mouth) {
    case "smile": mouth = `<path d="M24 ${my - 2} q8 8 16 0" fill="none" ${S}/>`; break;
    case "open": mouth = `<path d="M25 ${my - 3} h14 q0 9 -7 9 q-7 0 -7 -9z" fill="#121212" ${S}/><path d="M28 ${my + 3} q4 -3 8 0" fill="#FF7A9C"/>`; break;
    case "o": mouth = `<circle cx="32" cy="${my}" r="3.4" fill="#121212"/>`; break;
    case "flat": mouth = `<path d="M26 ${my} h12" ${S}/>`; break;
    case "grin": mouth = `<path d="M22 ${my - 3} h20 q0 10 -10 10 q-10 0 -10 -10z" fill="#fff" ${S}/><path d="M32 ${my - 3} v6" stroke="#121212" stroke-width="1.5"/>`; break;
    case "mustache": mouth = `<path d="M21 ${my - 1} q5 -6 11 -1 q6 -5 11 1 q-5 4 -11 1 q-6 3 -11 -1z" fill="#121212"/>`; break;
    case "cat": mouth = `<path d="M26 ${my - 2} q3 4 6 0 q3 4 6 0" fill="none" ${S}/><path d="M30 ${my - 6} h4 l-2 2z" fill="#121212"/>`; break;
  }
  const blush = a.shape === "ghost" ? "" : `<circle cx="16.5" cy="40" r="3.4" fill="#FF7A9C" opacity=".45"/><circle cx="47.5" cy="40" r="3.4" fill="#FF7A9C" opacity=".45"/>`;
  switch (a.acc) {
    case "antenna": top = `<path d="M32 11 V3" ${S}/><circle cx="32" cy="3" r="3.4" fill="#FF5B3A" ${S}/>`; break;
    case "antenna2": top = `<path d="M24 11 L20 2" ${S}/><path d="M40 11 L44 2" ${S}/><circle cx="20" cy="2" r="3" fill="#FF9ECF" ${S}/><circle cx="44" cy="2" r="3" fill="#FF9ECF" ${S}/>`; break;
    case "peci": top = `<path d="M17 18 L19 6 H45 L47 18 Q32 14 17 18z" fill="#121212" ${S}/>`; break;
    case "cap": top = `<path d="M13 22 C13 6, 51 6, 51 22z" fill="#FF5B3A" ${S}/><path d="M30 20 h28 a3 3 0 0 1 0 5 h-28z" fill="#FF5B3A" ${S}/>`; break;
    case "crown": top = `<path d="M18 16 L20 2 L27 10 L32 0 L37 10 L44 2 L46 16z" fill="#FFC93C" ${S}/>`; break;
    case "headphone": top = `<rect x="4" y="27" width="9" height="16" rx="4" fill="#FF5B3A" ${S}/><rect x="51" y="27" width="9" height="16" rx="4" fill="#FF5B3A" ${S}/>`; break;
  }
  return `<svg viewBox="-2 -4 68 68" aria-hidden="true">${back}${body}${blush}${eyes}${mouth}${top}</svg>`;
}
