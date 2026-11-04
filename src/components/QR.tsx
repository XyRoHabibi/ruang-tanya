"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QR({ text, className }: { text: string; className?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#121212", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [text]);
  return <div className={className} aria-label={`Kode QR untuk ${text}`} role="img" dangerouslySetInnerHTML={{ __html: svg }} />;
}
