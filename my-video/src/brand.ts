import { continueRender, delayRender, staticFile } from "remotion";

// Token warna & huruf diambil langsung dari web Ruang Tanya (src/app/globals.css)
export const C = {
  bg: "#FFFBF2",
  card: "#FFFFFF",
  ink: "#121212",
  ink2: "#4A4740",
  ink3: "#8D887C",
  soft: "#EFE9DB",
  tomato: "#FF5B3A",
  sun: "#FFC93C",
  mint: "#3DD6B0",
  sky: "#5B9DFF",
  bubble: "#FF9ECF",
  lime: "#A7E07A",
  cream2: "#FFF3C4",
};

export const F = {
  display: "Bricolage, system-ui, sans-serif",
  sans: "Jakarta, system-ui, sans-serif",
  mono: '"JetBrains Mono", Consolas, monospace',
  serif: '"Times New Roman", Times, serif',
};

export const sh = (n = 6, c: string = C.ink) => `${n}px ${n}px 0 ${c}`;
export const B = (w = 3) => `${w}px solid ${C.ink}`;

// Muat font lokal sebelum frame pertama dirender
const handle = delayRender("Memuat font brand");
Promise.all([
  new FontFace("Bricolage", `url(${staticFile("fonts/Bricolage-ExtraBold.ttf")})`, { weight: "100 900" }).load(),
  new FontFace("Jakarta", `url(${staticFile("fonts/PlusJakarta-SemiBold.ttf")})`, { weight: "100 900" }).load(),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
