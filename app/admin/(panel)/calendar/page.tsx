import Link from "next/link";
import BookingCard, { type BookingRow } from "../../../../components/BookingCard";
import { allLocations, getDayMap } from "../../../../lib/locations";
import { admin } from "../../../../lib/supabase-admin";
import { addDays, berlinDateStr, berlinMinutes, berlinToUtc, weekdayOf } from "../../../../lib/tz";

export const dynamic = "force-dynamic";

const PX = 0.9; // pixels per minute in the week grid (54px per hour)
const mondayOf = (d: string) => addDays(d, -((weekdayOf(d) + 6) % 7));
const dayLabel = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ week?: string; b?: string }> }) {
  const sp = await searchParams;
  const today = berlinDateStr(new Date());
  const given = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : today;
  const start = mondayOf(given);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const db = admin();
  const from = berlinToUtc(start, 0).toISOString();
  const to = berlinToUtc(addDays(start, 7), 0).toISOString();
  const [{ data }, locs, map, { data: wh }] = await Promise.all([
    db.from("bookings").select("*, services(name)").gte("starts_at", from).lt("starts_at", to).neq("status", "cancelled").order("starts_at"),
    allLocations(),
    getDayMap(start, 7),
    db.from("working_hours").select("is_open,open_time,close_time"),
  ]);
  const rows = (data ?? []) as unknown as BookingRow[];

  // Grid hours: cover opening hours and any booking outside them.
  let gStart = 9 * 60;
  let gEnd = 19 * 60;
  const opens = (wh ?? []).filter((w) => w.is_open);
  if (opens.length) {
    gStart = Math.min(...opens.map((w) => Number(w.open_time.slice(0, 2)) * 60 + Number(w.open_time.slice(3, 5))));
    gEnd = Math.max(...opens.map((w) => Number(w.close_time.slice(0, 2)) * 60 + Number(w.close_time.slice(3, 5))));
  }
  for (const b of rows) {
    gStart = Math.min(gStart, berlinMinutes(new Date(b.starts_at)));
    gEnd = Math.max(gEnd, berlinMinutes(new Date(b.ends_at)) || 24 * 60);
  }
  gStart = Math.floor(gStart / 60) * 60;
  gEnd = Math.ceil(gEnd / 60) * 60;
  const hours = Array.from({ length: (gEnd - gStart) / 60 }, (_, i) => gStart / 60 + i);
  const height = (gEnd - gStart) * PX;

  const byDay = (d: string) => rows.filter((b) => berlinDateStr(new Date(b.starts_at)) === d);
  const locOf = (d: string) => locs.find((l) => l.slug === map.days[d]?.location);
  const link = (week: string, b?: string) => `/admin/calendar?week=${week}${b ? `&b=${b}` : ""}`;
  const selected = rows.find((b) => b.id === sp.b);
  const range = `${dayLabel(days[0], { day: "numeric", month: "short" })} – ${dayLabel(days[6], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <div className="cal-bar">
        <Link className="ad-btn" href={link(addDays(start, -7))} aria-label="Previous week">←</Link>
        <Link className="ad-btn" href={link(mondayOf(today))}>Today</Link>
        <Link className="ad-btn" href={link(addDays(start, 7))} aria-label="Next week">→</Link>
        <b className="cal-range">{range}</b>
      </div>

      {locs.length > 1 && (
        <ul className="bk-legend" aria-label="Locations">
          {locs.map((l) => (
            <li key={l.id}><span className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.name}</li>
          ))}
        </ul>
      )}

      {/* Desktop: week grid */}
      <div className="cal-grid" style={{ ["--cal-h" as string]: `${height}px` }}>
        <div className="cal-corner" />
        {days.map((d) => {
          const l = locOf(d);
          return (
            <div key={d} className={"cal-head" + (d === today ? " today" : "")}>
              <b>{dayLabel(d, { weekday: "short", day: "numeric" })}</b>
              {map.days[d]?.open ? (
                l && <span><i className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.address}</span>
              ) : (
                <span className="cal-closed">Closed</span>
              )}
            </div>
          );
        })}
        <div className="cal-times">
          {hours.map((h) => <span key={h} style={{ top: (h * 60 - gStart) * PX }}>{String(h).padStart(2, "0")}:00</span>)}
        </div>
        {days.map((d) => (
          <div key={d} className={"cal-col" + (map.days[d]?.open ? "" : " off")} style={{ height }}>
            {byDay(d).map((b) => {
              const s = berlinMinutes(new Date(b.starts_at));
              const e = Math.max(berlinMinutes(new Date(b.ends_at)) || 24 * 60, s + 15);
              const place = locs.find((l) => l.id === b.location_id) ?? locOf(d);
              return (
                <Link
                  key={b.id}
                  href={link(start, b.id)}
                  className={"cal-ev " + b.status + (b.id === sp.b ? " sel" : "")}
                  data-loc={place?.sort}
                  style={{ top: (s - gStart) * PX, height: Math.max((e - s) * PX - 2, 18) }}
                >
                  <b>{hhmm(b.starts_at)}</b> {b.client_name}
                  <small>{b.services?.name}</small>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Phone: day-by-day agenda */}
      <div className="cal-agenda">
        {days.map((d) => {
          const list = byDay(d);
          const l = locOf(d);
          return (
            <section key={d} className={"ad-card" + (d === today ? " hl" : "")}>
              <div className="ad-row">
                <b>{dayLabel(d, { weekday: "long", day: "numeric", month: "short" })}</b>
                {map.days[d]?.open ? (
                  l && <span className="ad-sub"><i className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.name}</span>
                ) : (
                  <span className="cal-closed">Closed</span>
                )}
              </div>
              {list.length === 0 && map.days[d]?.open && <p className="ad-sub">No bookings.</p>}
              {list.map((b) => {
                const place = locs.find((x) => x.id === b.location_id) ?? l;
                return (
                  <Link key={b.id} href={link(start, b.id)} className={"cal-row " + b.status + (b.id === sp.b ? " sel" : "")} data-loc={place?.sort}>
                    <span className="ad-time">{hhmm(b.starts_at)}–{hhmm(b.ends_at)}</span>
                    <span><b>{b.client_name}</b> · {b.services?.name}</span>
                  </Link>
                );
              })}
            </section>
          );
        })}
      </div>

      {selected && (
        <>
          <h2 className="ad-h">Selected booking</h2>
          <BookingCard b={selected} locs={locs} highlight />
        </>
      )}
    </>
  );
}
