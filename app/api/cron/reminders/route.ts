import { NextResponse } from "next/server";
import { admin } from "../../../../lib/supabase-admin";
import { sendReminder } from "../../../../lib/mail";

export const dynamic = "force-dynamic";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = admin();
  const from = new Date();
  const to = new Date(from.getTime() + 30 * 3600_000); // everything in the next ~30h not yet reminded
  const { data } = await db
    .from("bookings")
    .select("id,client_name,client_email,starts_at,ends_at,manage_token,services(name)")
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .gt("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString());

  let sent = 0;
  for (const b of (data ?? []) as any[]) {
    await sendReminder({ ...b, service_name: b.services.name });
    await db.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
    sent++;
  }
  return NextResponse.json({ sent });
}
