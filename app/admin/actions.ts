"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { admin } from "../../lib/supabase-admin";
import { requireAdmin, sessionClient } from "../../lib/supabase-server";
import { sendCancellation, sendConfirmation } from "../../lib/mail";
import { allLocations, getLocationForDate } from "../../lib/locations";
import { berlinDateStr, berlinToUtc } from "../../lib/tz";
import { baseUrlFrom } from "../../lib/site";
import { headers } from "next/headers";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const n = (f: FormData, k: string) => Number(f.get(k));

export async function signIn(_: unknown, f: FormData) {
  const sb = await sessionClient();
  const { error } = await sb.auth.signInWithPassword({ email: s(f, "email"), password: s(f, "password") });
  if (error) return { error: "Wrong email or password." };
  redirect("/admin");
}

export async function signOut() {
  const sb = await sessionClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function setStatus(f: FormData) {
  await requireAdmin();
  const id = s(f, "id");
  const status = s(f, "status");
  if (!["confirmed", "cancelled", "completed", "no_show"].includes(status)) return;
  const db = admin();
  const { data } = await db
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("*, services(name)")
    .single();
  if (data && status === "cancelled") {
    const b = data as any;
    const locs = await allLocations();
    const location = locs.find((l) => l.id === b.location_id) ?? (await getLocationForDate(berlinDateStr(new Date(b.starts_at))));
    await sendCancellation({ ...b, service_name: b.services.name, location }, false, baseUrlFrom(await headers()));
  }
  revalidatePath("/admin");
}

export async function createManualBooking(_: unknown, f: FormData) {
  await requireAdmin();
  const db = admin();
  const service_id = s(f, "service_id");
  const date = s(f, "date");
  const time = s(f, "time");
  const { data: svc } = await db.from("services").select("name,duration_min").eq("id", service_id).single();
  if (!svc || !date || !time || !s(f, "name")) return { error: "Fill service, date, time and name." };
  const start = berlinToUtc(date, Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)));
  const end = new Date(start.getTime() + svc.duration_min * 60_000);
  const email = s(f, "email") || "walk-in@grooms.local";
  const location = await getLocationForDate(date);
  const { data, error } = await db
    .from("bookings")
    .insert({
      service_id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      client_name: s(f, "name"),
      client_email: email,
      client_phone: s(f, "phone") || null,
      location_id: location?.id ?? null,
    })
    .select("manage_token")
    .single();
  if (error) return { error: error.code === "23P01" ? "That time overlaps another booking." : "Could not save." };
  if (s(f, "email")) {
    await sendConfirmation({ client_name: s(f, "name"), client_email: email, starts_at: start.toISOString(), ends_at: end.toISOString(), manage_token: data.manage_token, service_name: svc.name, location }, false, baseUrlFrom(await headers()));
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveService(f: FormData) {
  await requireAdmin();
  const id = s(f, "id");
  const price = s(f, "price");
  const row = {
    name: s(f, "name"),
    description: s(f, "description") || null,
    duration_min: n(f, "duration_min"),
    price_cents: price === "" ? null : Math.round(Number(price) * 100),
    sort: n(f, "sort") || 0,
    active: f.get("active") === "on",
  };
  if (!row.name || !(row.duration_min >= 5)) return;
  const db = admin();
  if (id) await db.from("services").update(row).eq("id", id);
  else await db.from("services").insert(row);
  revalidatePath("/admin/services");
}

export async function deleteService(f: FormData) {
  await requireAdmin();
  // Services with bookings can't be deleted (FK); deactivate instead.
  const { error } = await admin().from("services").delete().eq("id", s(f, "id"));
  if (error) await admin().from("services").update({ active: false }).eq("id", s(f, "id"));
  revalidatePath("/admin/services");
}

export async function saveHours(f: FormData) {
  await requireAdmin();
  const db = admin();
  for (let d = 0; d < 7; d++) {
    const loc = s(f, `loc_${d}`);
    await db.from("working_hours").upsert({
      weekday: d,
      is_open: f.get(`open_${d}`) === "on",
      open_time: s(f, `from_${d}`) || "10:00",
      close_time: s(f, `to_${d}`) || "19:00",
      break_start: s(f, `bs_${d}`) || null,
      break_end: s(f, `be_${d}`) || null,
      ...(loc ? { location_id: loc } : {}),
    });
  }
  await db.from("settings").update({
    slot_interval_min: n(f, "slot_interval_min") || 15,
    min_notice_hours: n(f, "min_notice_hours") || 0,
    max_days_ahead: n(f, "max_days_ahead") || 60,
    cancel_cutoff_hours: n(f, "cancel_cutoff_hours") || 0,
  }).eq("id", 1);
  revalidatePath("/admin/hours");
}

export async function addTimeOff(f: FormData) {
  await requireAdmin();
  const a = s(f, "start_date");
  const b = s(f, "end_date") || a;
  if (!a || b < a) return;
  await admin().from("time_off").insert({ start_date: a, end_date: b, reason: s(f, "reason") || null });
  revalidatePath("/admin/hours");
}

export async function deleteTimeOff(f: FormData) {
  await requireAdmin();
  await admin().from("time_off").delete().eq("id", s(f, "id"));
  revalidatePath("/admin/hours");
}

/** One-off swap: use another location on a single date. */
export async function addLocationOverride(f: FormData) {
  await requireAdmin();
  const date = s(f, "date");
  const location_id = s(f, "location_id");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !location_id) return;
  await admin().from("location_overrides").upsert({ date, location_id });
  revalidatePath("/admin/hours");
  revalidatePath("/admin/calendar");
}

export async function deleteLocationOverride(f: FormData) {
  await requireAdmin();
  await admin().from("location_overrides").delete().eq("date", s(f, "date"));
  revalidatePath("/admin/hours");
  revalidatePath("/admin/calendar");
}

export async function saveLocation(f: FormData) {
  await requireAdmin();
  const row = {
    name: s(f, "name"),
    address: s(f, "address"),
    postcode_city: s(f, "postcode_city"),
    maps_url: /^https?:\/\//.test(s(f, "maps_url")) ? s(f, "maps_url") : null,
  };
  if (!row.name || !row.address || !row.postcode_city) return;
  await admin().from("locations").update(row).eq("id", s(f, "id"));
  revalidatePath("/admin/hours");
}

/** Change the signed-in admin's password (verifies the current one first). */
export async function changePassword(_: unknown, f: FormData) {
  const email = await requireAdmin();
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  const again = String(f.get("again") ?? "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  if (next !== again) return { error: "The two new passwords don't match." };
  if (next === current) return { error: "Choose a password different from the current one." };
  const sb = await sessionClient();
  const check = await sb.auth.signInWithPassword({ email, password: current });
  if (check.error) return { error: "Current password is wrong." };
  const { error } = await sb.auth.updateUser({ password: next });
  if (error) return { error: error.message || "Could not change the password." };
  return { ok: true };
}
