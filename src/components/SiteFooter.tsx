import Link from "next/link";

export const REPO_URL = "https://github.com/XyRoHabibi/ruang-tanya";

/** Footer kecil: hak cipta, lisensi MIT, dan tautan kode sumber. */
export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`site-footer ${className}`}>
      <span>© 2026 Naufal Habibi</span>
      <span aria-hidden="true">·</span>
      <Link href="/lisensi">MIT License</Link>
      <span aria-hidden="true">·</span>
      <a href={REPO_URL} target="_blank" rel="noreferrer">Kode sumber</a>
    </footer>
  );
}
