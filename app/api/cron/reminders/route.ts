import { NextResponse } from "next/server";
import { admin } from "../../../../lib/supabase-admin";
import { allLocations, getLocationForDate } from "../../../../lib/locations";
import { sendReminder } from "../../../../lib/mail";
import { baseUrlFrom } from "../../../../lib/site";
import { berlinDateStr } from "../../../../lib/tz";

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
    .select("*, services(name)")
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .gt("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString());

  const locs = await allLocations();
  let sent = 0;
  for (const b of (data ?? []) as any[]) {
    const location = locs.find((l) => l.id === b.location_id) ?? (await getLocationForDate(berlinDateStr(new Date(b.starts_at))));
    await sendReminder({ ...b, service_name: b.services.name, location }, baseUrlFrom(req.headers));
    await db.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
    sent++;
  }
  return NextResponse.json({ sent });
}
