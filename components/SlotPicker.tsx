"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { fill, useT } from "../lib/booking-i18n";
import type { Location } from "../lib/locations-shared";
import LocationBlock from "./LocationBlock";

type Slot = { time: string; iso: string };
type DayInfo = { open: boolean; location: string | null };
type DayMap = { locations: Location[]; days: Record<string, DayInfo> };

function todayBerlin() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
}
function addDays(d: string, n: number) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day + n)).toISOString().slice(0, 10);
}

export default function SlotPicker({
  serviceId,
  ignore,
  days = 45,
  value,
  onPick,
  locationSlug,
}: {
  serviceId: string;
  ignore?: string;
  days?: number;
  value: string | null;
  onPick: (iso: string, location: Location | null) => void;
  /** Only offer days at this location (used by the per-location booking links). */
  locationSlug?: string;
}) {
  const { t, loc } = useT();
  const start = useMemo(todayBerlin, []);
  const list = useMemo(() => Array.from({ length: days }, (_, i) => addDays(start, i)), [start, days]);
  const [date, setDate] = useState(start);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [map, setMap] = useState<DayMap | null>(null);
  const [touched, setTouched] = useState(false); // user picked a day manually
  const strip = useRef<HTMLDivElement>(null);

  const longDay = (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  const locBySlug = (slug: string | null | undefined) => map?.locations.find((l) => l.slug === slug) ?? null;
  // A day can be chosen if it's open (and, on a location link, at that location). Without map data, allow all.
  const usable = (d: string) => {
    const info = map?.days[d];
    if (!info) return true;
    return info.open && (!locationSlug || info.location === locationSlug);
  };
  const dayLoc = (d: string) => locBySlug(map?.days[d]?.location);

  const url = (d: string) => {
    const q = new URLSearchParams({ service: serviceId, date: d });
    if (ignore) q.set("ignore", ignore);
    if (locationSlug) q.set("location", locationSlug);
    return `/api/slots?${q}`;
  };

  // Load which days are open and where (once).
  useEffect(() => {
    let alive = true;
    fetch(`/api/days?days=${days}`)
      .then((r) => r.json())
      .then((j) => alive && j?.days && setMap(j))
      .catch(() => alive && setMap({ locations: [], days: {} }));
    return () => {
      alive = false;
    };
  }, [days]);

  // On first load, jump to the next usable day that actually has free times.
  useEffect(() => {
    if (touched || !map) return;
    let alive = true;
    (async () => {
      for (let i = 0; i < Math.min(days, 30); i++) {
        const d = list[i];
        if (!usable(d)) continue;
        const j = await fetch(url(d)).then((r) => r.json()).catch(() => ({ slots: [] }));
        if (!alive) return;
        if (j.slots?.length) {
          setDate(d);
          setSlots(j.slots);
          return;
        }
      }
      if (alive) setSlots([]);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, ignore, locationSlug, map]);

  // Load slots when the user picks a day by hand.
  useEffect(() => {
    if (!touched) return;
    let alive = true;
    setSlots(null);
    fetch(url(date))
      .then((r) => r.json())
      .then((j) => alive && setSlots(j.slots ?? []))
      .catch(() => alive && setSlots([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, touched]);

  // Keep the selected day visible in the horizontal strip.
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [date]);

  const here = dayLoc(date);
  const only = locationSlug ? locBySlug(locationSlug) : null;

  return (
    <div className="bk-picker">
      {only && (
        <p className="bk-muted">
          {fill(t.onlyAt, { name: only.name })}{" "}
          <a className="bk-link" href="/book">{t.allLocations}</a>
        </p>
      )}
      {map && map.locations.length > 1 && (
        <ul className="bk-legend" aria-label={t.location}>
          {map.locations.map((l) => (
            <li key={l.id}>
              <span className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" /> {l.address}
            </li>
          ))}
        </ul>
      )}
      <div className="bk-days" ref={strip} role="group" aria-label={t.chooseDay}>
        {list.map((d) => {
          const dt = new Date(d + "T12:00:00Z");
          const l = dayLoc(d);
          const ok = usable(d);
          return (
            <button
              key={d}
              type="button"
              disabled={!ok}
              aria-pressed={d === date}
              aria-label={`${longDay(d)}${l ? `, ${l.name}` : ""}${ok ? "" : `, ${t.closed}`}`}
              className={"bk-day" + (d === date ? " on" : "") + (ok ? "" : " off")}
              onClick={() => {
                setTouched(true);
                setDate(d);
              }}
            >
              <span>{dt.toLocaleDateString(loc, { weekday: "short", timeZone: "UTC" })}</span>
              <b>{dt.getUTCDate()}</b>
              <span>{dt.toLocaleDateString(loc, { month: "short", timeZone: "UTC" })}</span>
              {l && ok && <i className="bk-loc-dot" data-loc={l.sort} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="bk-dayhead">{longDay(date)}</p>
      <LocationBlock location={here} />
      <div className="bk-slots" aria-live="polite">
        {slots === null && <p className="bk-muted">{t.finding}</p>}
        {slots && slots.length === 0 && <p className="bk-muted">{t.noTimes}</p>}
        {slots?.map((s) => (
          <button key={s.iso} type="button" aria-pressed={value === s.iso} className={"bk-slot" + (value === s.iso ? " on" : "")} onClick={() => onPick(s.iso, here)}>
            {s.time}
          </button>
        ))}
      </div>
      <p className="bk-muted bk-tz">{t.allBerlin}</p>
    </div>
  );
}
