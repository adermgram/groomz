import BookingCard, { type BookingRow } from "../../../components/BookingCard";
import ManualBooking from "../../../components/ManualBooking";
import { allLocations } from "../../../lib/locations";
import { admin } from "../../../lib/supabase-admin";
import { addDays, berlinDateStr, berlinToUtc } from "../../../lib/tz";

export const dynamic = "force-dynamic";

export default async function Bookings({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  const newDate = /^\d{4}-\d{2}-\d{2}$/.test(sp.new ?? "") ? sp.new : undefined; // from the calendar's "+" button
  const db = admin();
  const today = berlinDateStr(new Date());
  const dayStart = berlinToUtc(today, 0).toISOString();
  const tomorrow = berlinToUtc(addDays(today, 1), 0).toISOString();
  const sel = "*, services(name)";

  const [t, up, past, svc, week, locs] = await Promise.all([
    db.from("bookings").select(sel).gte("starts_at", dayStart).lt("starts_at", tomorrow).order("starts_at"),
    db.from("bookings").select(sel).gte("starts_at", tomorrow).eq("status", "confirmed").order("starts_at").limit(60),
    db.from("bookings").select(sel).lt("starts_at", dayStart).order("starts_at", { ascending: false }).limit(15),
    db.from("services").select("id,name").eq("active", true).order("sort"),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("starts_at", dayStart).lt("starts_at", berlinToUtc(addDays(today, 7), 0).toISOString()),
    allLocations(),
  ]);
  const rows = (d: unknown) => (d ?? []) as unknown as BookingRow[];
  const todays = rows(t.data);

  return (
    <>
      <div className="ad-stats">
        <div className="ad-card ad-stat"><span className="ad-sub">Today</span><b>{todays.filter((x) => x.status !== "cancelled").length}</b></div>
        <div className="ad-card ad-stat"><span className="ad-sub">Next 7 days</span><b>{week.count ?? 0}</b></div>
      </div>

      <h2 className="ad-h">Today</h2>
      {todays.length ? todays.map((b) => <BookingCard key={b.id} b={b} locs={locs} />) : <p className="ad-sub">Nothing booked today.</p>}

      <h2 className="ad-h" id="add">Add booking</h2>
      <ManualBooking services={svc.data ?? []} defaultDate={newDate} />

      <h2 className="ad-h">Upcoming</h2>
      {rows(up.data).map((b) => <BookingCard key={b.id} b={b} locs={locs} />)}
      {!up.data?.length && <p className="ad-sub">No upcoming bookings.</p>}

      <h2 className="ad-h">Recent</h2>
      {rows(past.data).map((b) => <BookingCard key={b.id} b={b} locs={locs} />)}
      {!past.data?.length && <p className="ad-sub">No past bookings yet.</p>}
    </>
  );
}
