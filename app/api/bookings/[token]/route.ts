import { NextResponse } from "next/server";
import { admin } from "../../../../lib/supabase-admin";
import { getSlots } from "../../../../lib/slots";
import { allLocations, getLocationForDate, type Location } from "../../../../lib/locations";
import { sendCancellation, sendConfirmation } from "../../../../lib/mail";
import { berlinDateStr } from "../../../../lib/tz";
import { baseUrlFrom } from "../../../../lib/site";

type Ctx = { params: Promise<{ token: string }> };

async function load(token: string) {
  if (!/^[0-9a-f]{48}$/.test(token)) return null;
  const db = admin();
  const { data } = await db.from("bookings").select("*, services(name,duration_min)").eq("manage_token", token).maybeSingle();
  if (!data) return null;
  const { data: s } = await db.from("settings").select("cancel_cutoff_hours").eq("id", 1).single();
  const b = data as any;
  // Location saved with the booking; older bookings fall back to what the schedule says for that day.
  const locs = await allLocations();
  const location: Location | null =
    locs.find((l) => l.id === b.location_id) ?? (await getLocationForDate(berlinDateStr(new Date(b.starts_at))));
  return { b, location, cutoff: s?.cancel_cutoff_hours ?? 12 };
}

export async function GET(_: Request, { params }: Ctx) {
  const r = await load((await params).token);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { b, cutoff, location } = r;
  const canChange = b.status === "confirmed" && new Date(b.starts_at).getTime() - Date.now() > cutoff * 3600_000;
  return NextResponse.json({
    id: b.id,
    service_id: b.service_id,
    service_name: b.services.name,
    starts_at: b.starts_at,
    status: b.status,
    client_name: b.client_name,
    location,
    canChange,
    cutoff,
  });
}

// body: { action: "cancel" } | { action: "reschedule", starts_at }
export async function POST(req: Request, { params }: Ctx) {
  const r = await load((await params).token);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { b, cutoff, location } = r;
  if (b.status !== "confirmed" || new Date(b.starts_at).getTime() - Date.now() <= cutoff * 3600_000) {
    return NextResponse.json({ error: "locked", cutoff }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const db = admin();
  const mb = { client_name: b.client_name, client_email: b.client_email, manage_token: b.manage_token, service_name: b.services.name };

  if (body?.action === "cancel") {
    await db.from("bookings").update({ status: "cancelled" }).eq("id", b.id);
    await sendCancellation({ ...mb, starts_at: b.starts_at, ends_at: b.ends_at, location }, true, baseUrlFrom(req.headers));
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "reschedule") {
    const start = new Date(String(body.starts_at));
    if (isNaN(+start)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    // A different day can mean a different location; always derived server-side.
    const { slots, location: newLoc } = await getSlots(b.service_id, berlinDateStr(start), b.id);
    if (!slots.some((s) => s.iso === start.toISOString())) return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
    const end = new Date(start.getTime() + b.services.duration_min * 60_000);
    const { error } = await db
      .from("bookings")
      .update({ starts_at: start.toISOString(), ends_at: end.toISOString(), reminder_sent: false, location_id: newLoc?.id ?? null })
      .eq("id", b.id);
    if (error) return NextResponse.json({ error: error.code === "23P01" ? "slot_unavailable" : "db" }, { status: 409 });
    await sendConfirmation({ ...mb, starts_at: start.toISOString(), ends_at: end.toISOString(), location: newLoc }, true, baseUrlFrom(req.headers));
    return NextResponse.json({ ok: true, location: newLoc });
  }
  return NextResponse.json({ error: "invalid" }, { status: 400 });
}
