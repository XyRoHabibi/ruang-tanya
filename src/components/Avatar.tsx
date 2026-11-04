import { avatarSvg } from "@/lib/avatars";

export function Avatar({ i, size, className = "" }: { i: number; size?: number; className?: string }) {
  return (
    <span
      className={`av ${className}`}
      style={size ? { width: size, height: size } : undefined}
      // SVG dibuat dari data statis di kode, bukan dari masukan pengguna.
      dangerouslySetInnerHTML={{ __html: avatarSvg(i) }}
    />
  );
}
