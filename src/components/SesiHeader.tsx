import type { SesiPublik } from "@/lib/types";
import { tanggalIndo } from "@/lib/client";

export function SesiHeader({ sesi }: { sesi: SesiPublik }) {
  return (
    <header className="f-head">
      <svg className="confetti" viewBox="0 0 120 120" aria-hidden="true">
        <g stroke="#121212" strokeWidth="2">
          <circle cx="86" cy="30" r="10" fill="#FF5B3A" />
          <rect x="40" y="18" width="14" height="14" rx="3" fill="#5B9DFF" transform="rotate(20 47 25)" />
          <path d="M70 64 l10 -16 l10 16z" fill="#3DD6B0" />
          <circle cx="104" cy="74" r="6" fill="#FF9ECF" />
        </g>
      </svg>
      <span className="label">{sesi.matkul}</span>
      <h1>{sesi.topik}</h1>
      <div className="row">
        <span className="who">{sesi.kelompok_penyaji} · {tanggalIndo(sesi.tanggal, true)}</span>
        {sesi.status === "dibuka" ? <span className="chip live">Live</span>
          : sesi.status === "ditutup" ? <span className="chip muted">Ditutup</span>
          : <span className="chip muted">Belum dibuka</span>}
      </div>
    </header>
  );
}
