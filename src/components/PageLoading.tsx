import { Avatar } from "./Avatar";

/** Layar loading saat pindah halaman: empat avatar yang memantul bergantian. */
export function PageLoading({ teks = "Memuat…", gelap = false }: { teks?: string; gelap?: boolean }) {
  return (
    <div className={`page-loading ${gelap ? "dark" : ""}`} role="status" aria-live="polite">
      <div className="hop" aria-hidden="true">
        {[0, 3, 4, 9].map((i, k) => (
          <span key={i} style={{ animationDelay: `${k * 0.12}s` }}><Avatar i={i} size={44} /></span>
        ))}
      </div>
      <p style={{ margin: 0 }}>{teks}</p>
    </div>
  );
}
