import { admin } from "../../../lib/supabase-admin";
import { requireAdmin } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

// Quote every field and neutralise spreadsheet formulas (CSV injection).
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;

export async function GET() {
  await requireAdmin();
  const { data } = await admin().from("waitlist").select("full_name,email,location,created_at").order("created_at");
  const rows = [["name", "email", "location", "signed_up"], ...(data ?? []).map((w) => [w.full_name, w.email, w.location, w.created_at])];
  return new Response(rows.map((r) => r.map((v) => cell(String(v))).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="waitlist.csv"' },
  });
}
