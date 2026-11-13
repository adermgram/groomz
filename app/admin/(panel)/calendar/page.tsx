import Link from "next/link";
import BookingCard, { type BookingRow } from "../../../../components/BookingCard";
import DateJump from "../../../../components/DateJump";
import { allLocations, getDayMap } from "../../../../lib/locations";
import { admin } from "../../../../lib/supabase-admin";
import { addDays, berlinDateStr, berlinMinutes, berlinToUtc, weekdayOf } from "../../../../lib/tz";

export const dynamic = "force-dynamic";

type View = "day" | "week" | "month";
type SP = { view?: string; date?: string; loc?: string; cancelled?: string; b?: string };

const PX = 0.9; // pixels per minute in the time grid (54px per hour)
const isDate = (s?: string) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "");
const mondayOf = (d: string) => addDays(d, -((weekdayOf(d) + 6) % 7));
const firstOfMonth = (d: string) => d.slice(0, 8) + "01";
const addMonths = (d: string, n: number) => {
  const [y, m] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
};
const diffDays = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const fmtDay = (d: string, o: Intl.DateTimeFormatOptions) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function CalendarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const today = berlinDateStr(new Date());
  const view: View = sp.view === "day" || sp.view === "month" ? sp.view : "week";
  const date = isDate(sp.date) ? sp.date! : today;
  const showCancelled = sp.cancelled === "1";

  const locs = await allLocations();
  const locSlug = locs.some((l) => l.slug === sp.loc) ? sp.loc! : "all";

  // Visible range (month view also shows the leading/trailing days of neighbouring months).
  let rangeStart = date;
  let nDays = 1;
  if (view === "week") {
    rangeStart = mondayOf(date);
    nDays = 7;
  } else if (view === "month") {
    const first = firstOfMonth(date);
    rangeStart = mondayOf(first);
    const last = addDays(addMonths(first, 1), -1);
    nDays = diffDays(rangeStart, addDays(mondayOf(last), 7));
  }
  const days = Array.from({ length: nDays }, (_, i) => addDays(rangeStart, i));

  const prev = view === "day" ? addDays(date, -1) : view === "week" ? addDays(date, -7) : addMonths(firstOfMonth(date), -1);
  const next = view === "day" ? addDays(date, 1) : view === "week" ? addDays(date, 7) : addMonths(firstOfMonth(date), 1);
  const title =
    view === "day"
      ? fmtDay(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? `${fmtDay(days[0], { day: "numeric", month: "short" })} – ${fmtDay(days[6], { day: "numeric", month: "short", year: "numeric" })}`
        : fmtDay(date, { month: "long", year: "numeric" });

  const db = admin();
  let q = db
    .from("bookings")
    .select("*, services(name)")
    .gte("starts_at", berlinToUtc(rangeStart, 0).toISOString())
    .lt("starts_at", berlinToUtc(addDays(rangeStart, nDays), 0).toISOString())
    .order("starts_at");
  if (!showCancelled) q = q.neq("status", "cancelled");
  const [{ data }, map, { data: wh }] = await Promise.all([q, getDayMap(rangeStart, nDays), db.from("working_hours").select("is_open,open_time,close_time")]);

  const locOfDay = (d: string) => locs.find((l) => l.slug === map.days[d]?.location);
  const dateOf = (b: BookingRow) => berlinDateStr(new Date(b.starts_at));
  const placeOf = (b: BookingRow) => locs.find((l) => l.id === b.location_id) ?? locOfDay(dateOf(b));
  const all = ((data ?? []) as unknown as BookingRow[]).filter((b) => locSlug === "all" || placeOf(b)?.slug === locSlug);
  const byDay = (d: string) => all.filter((b) => dateOf(b) === d);
  const live = (b: BookingRow) => b.status !== "cancelled";

  // Links that keep the current view/filters.
  const href = (o: { view?: View; date?: string; loc?: string; cancelled?: boolean; b?: string }) => {
    const p = new URLSearchParams();
    p.set("view", o.view ?? view);
    p.set("date", o.date ?? date);
    const l = o.loc ?? locSlug;
    if (l !== "all") p.set("loc", l);
    if (o.cancelled ?? showCancelled) p.set("cancelled", "1");
    if (o.b) p.set("b", o.b);
    return `/admin/calendar?${p}`;
  };
  const jumpBase = href({}).replace(/&date=[^&]*/, "");

  const selected = all.find((b) => b.id === sp.b);
  const counts = {
    total: all.filter(live).length,
    perLoc: locs.map((l) => ({ l, n: all.filter((b) => live(b) && placeOf(b)?.slug === l.slug).length })),
  };

  // Time-grid hours (day/week): cover opening hours and any booking outside them.
  let gStart = 9 * 60;
  let gEnd = 19 * 60;
  const opens = (wh ?? []).filter((w) => w.is_open);
  if (opens.length) {
    gStart = Math.min(...opens.map((w) => Number(w.open_time.slice(0, 2)) * 60 + Number(w.open_time.slice(3, 5))));
    gEnd = Math.max(...opens.map((w) => Number(w.close_time.slice(0, 2)) * 60 + Number(w.close_time.slice(3, 5))));
  }
  for (const b of all) {
    gStart = Math.min(gStart, berlinMinutes(new Date(b.starts_at)));
    gEnd = Math.max(gEnd, berlinMinutes(new Date(b.ends_at)) || 24 * 60);
  }
  gStart = Math.floor(gStart / 60) * 60;
  gEnd = Math.ceil(gEnd / 60) * 60;
  const hours = Array.from({ length: (gEnd - gStart) / 60 }, (_, i) => gStart / 60 + i);
  const height = (gEnd - gStart) * PX;
  const nowMin = berlinMinutes(new Date());

  return (
    <>
      {/* Navigation: previous / today / next (steps by the current view) + title */}
      <div className="cal-bar">
        <Link className="ad-btn" href={href({ date: prev })} aria-label={`Previous ${view}`}>←</Link>
        <Link className="ad-btn" href={href({ date: today })}>Today</Link>
        <Link className="ad-btn" href={href({ date: next })} aria-label={`Next ${view}`}>→</Link>
        <b className="cal-range">{title}</b>
      </div>

      {/* View switch, jump to any date, filters */}
      <div className="cal-tools">
        <div className="lang-seg" role="group" aria-label="View">
          {(["day", "week", "month"] as const).map((v) => (
            <Link key={v} href={href({ view: v })} className={view === v ? "on" : ""} aria-current={view === v ? "page" : undefined}>
              {v[0].toUpperCase() + v.slice(1)}
            </Link>
          ))}
        </div>
        <DateJump value={date} hrefBase={jumpBase} />
        <div className="cal-filters" role="group" aria-label="Filters">
          {locs.length > 1 && (
            <>
              <Link href={href({ loc: "all" })} className={"chip" + (locSlug === "all" ? " on" : "")}>All places</Link>
              {locs.map((l) => (
                <Link key={l.id} href={href({ loc: l.slug })} className={"chip" + (locSlug === l.slug ? " on" : "")}>
                  <span className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.address.replace(/ \d+.*$/, "")}
                </Link>
              ))}
            </>
          )}
          <Link href={href({ cancelled: !showCancelled })} className={"chip" + (showCancelled ? " on" : "")}>
            {showCancelled ? "✓ " : ""}Show cancelled
          </Link>
        </div>
      </div>

      <p className="cal-summary">
        <b>{counts.total}</b> booking{counts.total === 1 ? "" : "s"}
        {locs.length > 1 && counts.perLoc.map(({ l, n }) => (
          <span key={l.id}> · <span className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {n}</span>
        ))}
        <span className="ad-sub"> in this {view}</span>
      </p>

      {view === "month" ? (
        <div className="cal-month">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((n) => <div key={n} className="cal-mh">{n}</div>)}
          {days.map((d) => {
            const list = byDay(d).filter(live);
            const l = locOfDay(d);
            const open = map.days[d]?.open;
            const out = d.slice(0, 7) !== date.slice(0, 7);
            return (
              <Link
                key={d}
                href={href({ view: "day", date: d })}
                className={"cal-cell" + (d === today ? " today" : "") + (out ? " out" : "") + (open ? "" : " off")}
                aria-label={`${fmtDay(d, { weekday: "long", day: "numeric", month: "long" })}, ${list.length} bookings`}
              >
                <span className="cal-dn">{Number(d.slice(8))}</span>
                {open && l && <i className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" />}
                {list.length > 0 && <span className="cal-count">{list.length}</span>}
                <span className="cal-first">{list[0] ? `${hhmm(list[0].starts_at)} ${list[0].client_name.split(" ")[0]}` : ""}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <>
          {/* Desktop: time grid (1 or 7 columns) */}
          <div className="cal-grid" style={{ ["--cal-h" as string]: `${height}px`, ["--cols" as string]: nDays }}>
            <div className="cal-corner" />
            {days.map((d) => {
              const l = locOfDay(d);
              return (
                <div key={d} className={"cal-head" + (d === today ? " today" : "")}>
                  <div className="cal-head-top">
                    {view === "week" ? (
                      <Link href={href({ view: "day", date: d })}><b>{fmtDay(d, { weekday: "short", day: "numeric" })}</b></Link>
                    ) : (
                      <b>{fmtDay(d, { weekday: "long", day: "numeric", month: "short" })}</b>
                    )}
                    {map.days[d]?.open && <Link className="cal-add" href={`/admin?new=${d}#add`} title="Add a booking on this day" aria-label="Add a booking on this day">+</Link>}
                  </div>
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
                {d === today && nowMin >= gStart && nowMin <= gEnd && <div className="cal-now" style={{ top: (nowMin - gStart) * PX }} aria-hidden="true" />}
                {byDay(d).map((b) => {
                  const s = berlinMinutes(new Date(b.starts_at));
                  const e = Math.max(berlinMinutes(new Date(b.ends_at)) || 24 * 60, s + 15);
                  const place = placeOf(b);
                  return (
                    <Link
                      key={b.id}
                      href={href({ b: b.id })}
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

          {/* Phone: agenda */}
          <div className="cal-agenda">
            {days.map((d) => {
              const list = byDay(d);
              const l = locOfDay(d);
              return (
                <section key={d} className={"ad-card" + (d === today ? " hl" : "")}>
                  <div className="ad-row">
                    <b>{fmtDay(d, { weekday: "long", day: "numeric", month: "short" })}</b>
                    {map.days[d]?.open ? (
                      l && <span className="ad-sub"><i className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.name}</span>
                    ) : (
                      <span className="cal-closed">Closed</span>
                    )}
                  </div>
                  {list.length === 0 && map.days[d]?.open && <p className="ad-sub">No bookings.</p>}
                  {list.map((b) => (
                    <Link key={b.id} href={href({ b: b.id })} className={"cal-row " + b.status + (b.id === sp.b ? " sel" : "")} data-loc={placeOf(b)?.sort}>
                      <span className="ad-time">{hhmm(b.starts_at)}–{hhmm(b.ends_at)}</span>
                      <span><b>{b.client_name}</b> · {b.services?.name}</span>
                    </Link>
                  ))}
                  {map.days[d]?.open && <Link className="ad-btn cal-addrow" href={`/admin?new=${d}#add`}>+ Add booking</Link>}
                </section>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <>
          <h2 className="ad-h">Selected booking</h2>
          <BookingCard b={selected} locs={locs} highlight />
        </>
      )}
    </>
  );
}
