import { getLocationForDate, type Location } from "./locations";
import { admin } from "./supabase-admin";
import { addDays, berlinDateStr, berlinToUtc, toMin, weekdayOf } from "./tz";

export type Slot = { time: string; iso: string };

/**
 * Free start times (Berlin local "HH:MM") for a service on a date, plus the location
 * that day belongs to. If `onlyLocationSlug` is set and the day is at another location,
 * no slots are returned.
 */
export async function getSlots(
  serviceId: string,
  date: string,
  ignoreBookingId?: string,
  onlyLocationSlug?: string,
): Promise<{ slots: Slot[]; location: Location | null }> {
  const db = admin();
  const [{ data: svc }, { data: s }, { data: wh }, { data: off }, location] = await Promise.all([
    db.from("services").select("duration_min").eq("id", serviceId).eq("active", true).maybeSingle(),
    db.from("settings").select("*").eq("id", 1).single(),
    db.from("working_hours").select("*").eq("weekday", weekdayOf(date)).maybeSingle(),
    db.from("time_off").select("id").lte("start_date", date).gte("end_date", date),
    getLocationForDate(date),
  ]);
  const none = { slots: [] as Slot[], location };
  if (!svc || !s || !wh || !wh.is_open || (off && off.length)) return none;
  if (onlyLocationSlug && location?.slug !== onlyLocationSlug) return none;

  const now = new Date();
  const earliest = new Date(now.getTime() + s.min_notice_hours * 3600_000);
  if (date > addDays(berlinDateStr(now), s.max_days_ahead)) return none;

  const open = toMin(wh.open_time)!;
  const close = toMin(wh.close_time)!;
  const bs = toMin(wh.break_start);
  const be = toMin(wh.break_end);
  const dayStart = berlinToUtc(date, 0);
  const dayEnd = berlinToUtc(addDays(date, 1), 0);

  let q = db
    .from("bookings")
    .select("id,starts_at,ends_at")
    .eq("status", "confirmed")
    .lt("starts_at", dayEnd.toISOString())
    .gt("ends_at", dayStart.toISOString());
  if (ignoreBookingId) q = q.neq("id", ignoreBookingId);
  const { data: booked } = await q;
  const busy = (booked ?? []).map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()]);

  const out: Slot[] = [];
  for (let m = open; m + svc.duration_min <= close; m += s.slot_interval_min) {
    const end = m + svc.duration_min;
    if (bs != null && be != null && m < be && end > bs) continue; // overlaps the break
    const start = berlinToUtc(date, m);
    const stop = berlinToUtc(date, end);
    if (start < earliest) continue;
    if (busy.some(([a, b]) => start.getTime() < b && stop.getTime() > a)) continue;
    out.push({
      time: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
      iso: start.toISOString(),
    });
  }
  return { slots: out, location };
}
