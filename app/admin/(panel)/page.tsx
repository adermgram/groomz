import Link from "next/link";
import BookingCard, { type BookingRow } from "../../../components/BookingCard";
import HistoryRow from "../../../components/HistoryRow";
import ManualBooking from "../../../components/ManualBooking";
import { allLocations } from "../../../lib/locations";
import { admin } from "../../../lib/supabase-admin";
import { addDays, berlinDateStr, berlinToUtc } from "../../../lib/tz";

export const dynamic = "force-dynamic";

const UPCOMING = 8; // the dashboard shows only the next few; everything else lives in Calendar
const RECENT = 5; // ...and the latest few past ones; the full list lives in History

export default async function Bookings({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  const newDate = /^\d{4}-\d{2}-\d{2}$/.test(sp.new ?? "") ? sp.new : undefined; // from the calendar's "+" button
  const db = admin();
  const today = berlinDateStr(new Date());
  const dayStart = berlinToUtc(today, 0).toISOString();
  const tomorrow = berlinToUtc(addDays(today, 1), 0).toISOString();
  const nowIso = new Date().toISOString();
  const sel = "*, services(name)";

  const [t, up, upCount, past, unmarked, svc, week, locs] = await Promise.all([
    db.from("bookings").select(sel).gte("starts_at", dayStart).lt("starts_at", tomorrow).order("starts_at"),
    db.from("bookings").select(sel).gte("starts_at", tomorrow).eq("status", "confirmed").order("starts_at").limit(UPCOMING),
    db.from("bookings").select("id", { count: "exact", head: true }).gte("starts_at", tomorrow).eq("status", "confirmed"),
    db.from("bookings").select(sel).lt("starts_at", nowIso).order("starts_at", { ascending: false }).limit(RECENT),
    db.from("bookings").select("id", { count: "exact", head: true }).lt("starts_at", nowIso).eq("status", "confirmed"),
    db.from("services").select("id,name").eq("active", true).order("sort"),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("starts_at", dayStart).lt("starts_at", berlinToUtc(addDays(today, 7), 0).toISOString()),
    allLocations(),
  ]);
  const rows = (d: unknown) => (d ?? []) as unknown as BookingRow[];
  const todays = rows(t.data);
  const hiddenUpcoming = Math.max(0, (upCount.count ?? 0) - UPCOMING);

  return (
    <>
      <div className="ad-stats">
        <div className="ad-card ad-stat"><span className="ad-sub">Today</span><b>{todays.filter((x) => x.status !== "cancelled").length}</b></div>
        <div className="ad-card ad-stat"><span className="ad-sub">Next 7 days</span><b>{week.count ?? 0}</b></div>
      </div>

      {(unmarked.count ?? 0) > 0 && (
        <Link href="/admin/history?status=confirmed" className="ad-card hist-alert">
          <b>{unmarked.count} past booking{unmarked.count === 1 ? "" : "s"} not marked yet</b>
          <span className="ad-sub">Mark them as done or no-show to keep the history accurate →</span>
        </Link>
      )}

      <h2 className="ad-h">Today</h2>
      {todays.length ? todays.map((b) => <BookingCard key={b.id} b={b} locs={locs} />) : <p className="ad-sub">Nothing booked today.</p>}

      <h2 className="ad-h" id="add">Add booking</h2>
      <ManualBooking services={svc.data ?? []} defaultDate={newDate} />

      <div className="ad-row" style={{ alignItems: "baseline" }}>
        <h2 className="ad-h">Upcoming</h2>
        <Link className="ad-sub cal-link" href="/admin/calendar">Open calendar →</Link>
      </div>
      {rows(up.data).map((b) => <BookingCard key={b.id} b={b} locs={locs} />)}
      {!up.data?.length && <p className="ad-sub">No upcoming bookings.</p>}
      {hiddenUpcoming > 0 && (
        <Link className="ad-btn" href="/admin/calendar?view=month">+ {hiddenUpcoming} more in the calendar</Link>
      )}

      <div className="ad-row" style={{ alignItems: "baseline" }}>
        <h2 className="ad-h">Recent history</h2>
        <Link className="ad-sub cal-link" href="/admin/history">Full history →</Link>
      </div>
      <div className="hist-list">
        {rows(past.data).map((b) => <HistoryRow key={b.id} b={b} locs={locs} />)}
      </div>
      {!past.data?.length && <p className="ad-sub">No past bookings yet.</p>}
    </>
  );
}
