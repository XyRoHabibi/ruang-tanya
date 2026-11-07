import "server-only";
import { authClient } from "./supabase/server";

/** Daftar email admin dari ADMIN_EMAIL. Toleran terhadap spasi, tanda kutip, dan huruf besar. */
function emailAdmin(): string[] {
  return (process.env.ADMIN_EMAIL || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().replace(/^["']+|["']+$/g, "").toLowerCase())
    .filter(Boolean);
}

export type CekAdmin =
  | { status: "admin"; email: string }
  | { status: "bukan-admin"; email: string }
  | { status: "belum-login" }
  | { status: "galat"; pesan: string };

export async function cekAdmin(): Promise<CekAdmin> {
  try {
    const sb = await authClient();
    const { data, error } = await sb.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (!email) {
      if (error && error.name !== "AuthSessionMissingError") return { status: "galat", pesan: error.message };
      return { status: "belum-login" };
    }
    const allowed = emailAdmin();
    if (allowed.length && !allowed.includes(email)) return { status: "bukan-admin", email };
    return { status: "admin", email };
  } catch (e) {
    return { status: "galat", pesan: e instanceof Error ? e.message : String(e) };
  }
}

/** Mengembalikan email admin bila yang login adalah admin, selain itu null. */
export async function getAdmin(): Promise<string | null> {
  const c = await cekAdmin();
  return c.status === "admin" ? c.email : null;
}

export function unauthorized() {
  return Response.json({ galat: "Kamu harus login sebagai admin." }, { status: 401 });
}
