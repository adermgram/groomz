import { admin } from "./supabase-admin";
import { addDays, weekdayOf } from "./tz";

import type { Location } from "./locations-shared";
export { fullAddress, mapsUrl, type Location } from "./locations-shared";

export async function allLocations(): Promise<Location[]> {
  const { data } = await admin().from("locations").select("*").order("sort");
  return (data ?? []) as Location[];
}

/** The location for a Berlin calendar date: a one-off override wins, else the weekday's location. */
export async function getLocationForDate(date: string): Promise<Location | null> {
  const db = admin();
  const [{ data: ov }, { data: wh }, locs] = await Promise.all([
    db.from("location_overrides").select("location_id").eq("date", date).maybeSingle(),
    db.from("working_hours").select("location_id").eq("weekday", weekdayOf(date)).maybeSingle(),
    allLocations(),
  ]);
  const id = ov?.location_id ?? wh?.location_id;
  return locs.find((l) => l.id === id) ?? null;
}

export type DayInfo = { open: boolean; location: string | null }; // location = slug

/** Open/closed + location slug for the next `count` days starting at `from` (Berlin dates). */
export async function getDayMap(from: string, count: number) {
  const db = admin();
  const to = addDays(from, count - 1);
  const [{ data: wh }, { data: ov }, { data: off }, locs] = await Promise.all([
    db.from("working_hours").select("*"), // "*" keeps working even before the location column exists
    db.from("location_overrides").select("date,location_id").gte("date", from).lte("date", to),
    db.from("time_off").select("start_date,end_date").lte("start_date", to).gte("end_date", from),
    allLocations(),
  ]);
  const slugOf = (id: string | null | undefined) => locs.find((l) => l.id === id)?.slug ?? null;
  const days: Record<string, DayInfo> = {};
  for (let i = 0; i < count; i++) {
    const d = addDays(from, i);
    const w = (wh ?? []).find((x) => x.weekday === weekdayOf(d));
    const o = (ov ?? []).find((x) => x.date === d);
    const away = (off ?? []).some((t) => t.start_date <= d && t.end_date >= d);
    days[d] = { open: !!w?.is_open && !away, location: slugOf(o?.location_id ?? w?.location_id) };
  }
  return { locations: locs, days };
}
