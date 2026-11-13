import { NextResponse } from "next/server";
import { admin } from "../../../lib/supabase-admin";
import { getSlots } from "../../../lib/slots";
import { sendConfirmation } from "../../../lib/mail";
import { berlinDateStr } from "../../../lib/tz";
import { baseUrlFrom } from "../../../lib/site";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const service_id = String(b?.service_id ?? "");
  const iso = String(b?.starts_at ?? "");
  const client_name = String(b?.name ?? "").trim().slice(0, 120);
  const client_email = String(b?.email ?? "").trim().toLowerCase().slice(0, 200);
  const client_phone = String(b?.phone ?? "").trim().slice(0, 40) || null;
  const notes = String(b?.notes ?? "").trim().slice(0, 500) || null;
  const start = new Date(iso);

  if (!/^[0-9a-f-]{36}$/.test(service_id) || isNaN(+start) || !client_name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client_email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Re-validate against computed slots so clients can't book outside opening hours.
  // The location is always derived here from the date, never taken from the client.
  const { slots, location } = await getSlots(service_id, berlinDateStr(start));
  if (!slots.some((s) => s.iso === start.toISOString())) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  const db = admin();
  const { data: svc } = await db.from("services").select("name,duration_min").eq("id", service_id).single();
  if (!svc) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const end = new Date(start.getTime() + svc.duration_min * 60_000);

  const { data, error } = await db
    .from("bookings")
    .insert({
      service_id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      client_name,
      client_email,
      client_phone,
      notes,
      location_id: location?.id ?? null,
    })
    .select("manage_token")
    .single();

  if (error) {
    // 23P01 = exclusion violation: someone else took the slot a moment ago
    return NextResponse.json({ error: error.code === "23P01" ? "slot_unavailable" : "db" }, { status: error.code === "23P01" ? 409 : 500 });
  }

  await sendConfirmation(
    {
      client_name,
      client_email,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      manage_token: data.manage_token,
      service_name: svc.name,
      location,
    },
    false,
    baseUrlFrom(req.headers),
  );
  return NextResponse.json({ ok: true, token: data.manage_token, location });
}
