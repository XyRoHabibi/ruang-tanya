import { authClient } from "@/lib/supabase/server";

export async function POST() {
  const sb = await authClient();
  await sb.auth.signOut();
  return Response.json({ ok: true });
}
