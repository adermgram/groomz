import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "./supabase-admin";

/** Cookie-aware Supabase client acting as the logged-in user (used only for auth checks). */
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component; middleware refreshes the session */
        }
      },
    },
  });
}

// Optional bootstrap/fallback list from the env (comma separated).
const envAdmins = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Throws a redirect unless the logged-in user is in the Supabase `admins` table (or ADMIN_EMAILS). */
export async function requireAdmin() {
  const sb = await sessionClient();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  const email = user?.email?.toLowerCase();
  // Only trust verified emails so nobody can sign up with an admin's address.
  if (!user || !email || !user.email_confirmed_at) redirect("/admin/login");

  let isAdmin = envAdmins().includes(email);
  if (!isAdmin) {
    const { data: row } = await admin().from("admins").select("email").eq("email", email).maybeSingle();
    isAdmin = !!row;
  }
  if (!isAdmin) redirect("/admin/login");
  return email;
}
