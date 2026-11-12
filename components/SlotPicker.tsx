"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "../lib/booking-i18n";

type Slot = { time: string; iso: string };

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
}: {
  serviceId: string;
  ignore?: string;
  days?: number;
  value: string | null;
  onPick: (iso: string) => void;
}) {
  const { t, loc } = useT();
  const start = useMemo(todayBerlin, []);
  const list = useMemo(() => Array.from({ length: days }, (_, i) => addDays(start, i)), [start, days]);
  const [date, setDate] = useState(start);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [touched, setTouched] = useState(false); // user picked a day manually
  const strip = useRef<HTMLDivElement>(null);

  const longDay = (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  const url = (d: string) => {
    const q = new URLSearchParams({ service: serviceId, date: d });
    if (ignore) q.set("ignore", ignore);
    return `/api/slots?${q}`;
  };

  // On first load, jump to the next day that actually has free times.
  useEffect(() => {
    if (touched) return;
    let alive = true;
    (async () => {
      for (let i = 0; i < Math.min(days, 21); i++) {
        const d = list[i];
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
  }, [serviceId, ignore]);

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

  return (
    <div className="bk-picker">
      <div className="bk-days" ref={strip} role="group" aria-label={t.chooseDay}>
        {list.map((d) => {
          const dt = new Date(d + "T12:00:00Z");
          return (
            <button
              key={d}
              type="button"
              aria-pressed={d === date}
              aria-label={longDay(d)}
              className={"bk-day" + (d === date ? " on" : "")}
              onClick={() => {
                setTouched(true);
                setDate(d);
              }}
            >
              <span>{dt.toLocaleDateString(loc, { weekday: "short", timeZone: "UTC" })}</span>
              <b>{dt.getUTCDate()}</b>
              <span>{dt.toLocaleDateString(loc, { month: "short", timeZone: "UTC" })}</span>
            </button>
          );
        })}
      </div>
      <p className="bk-dayhead">{longDay(date)}</p>
      <div className="bk-slots" aria-live="polite">
        {slots === null && <p className="bk-muted">{t.finding}</p>}
        {slots && slots.length === 0 && <p className="bk-muted">{t.noTimes}</p>}
        {slots?.map((s) => (
          <button key={s.iso} type="button" aria-pressed={value === s.iso} className={"bk-slot" + (value === s.iso ? " on" : "")} onClick={() => onPick(s.iso)}>
            {s.time}
          </button>
        ))}
      </div>
      <p className="bk-muted bk-tz">{t.allBerlin}</p>
    </div>
  );
}
