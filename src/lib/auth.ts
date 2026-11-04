import "server-only";
import { authClient } from "./supabase/server";

/** Mengembalikan email admin bila yang login adalah admin, selain itu null. */
export async function getAdmin(): Promise<string | null> {
  try {
    const sb = await authClient();
    const { data } = await sb.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (!email) return null;
    const allowed = (process.env.ADMIN_EMAIL || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
    if (allowed.length && !allowed.includes(email)) return null;
    return email;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ galat: "Kamu harus login sebagai admin." }, { status: 401 });
}
