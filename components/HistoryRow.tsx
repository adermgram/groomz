import BookingCard, { type BookingRow } from "./BookingCard";
import type { Location } from "../lib/locations-shared";

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });

export const STATUS_LABEL: Record<string, string> = {
  confirmed: "Not marked",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/** One compact line per past booking; expands to the full card (contact, notes, actions). */
export default function HistoryRow({ b, locs }: { b: BookingRow; locs: Location[] }) {
  const place = locs.find((l) => l.id === b.location_id);
  const d = new Date(b.starts_at);
  return (
    <details className="hist">
      <summary>
        <span className="hist-when">
          {dateFmt.format(d)}
          <small>{timeFmt.format(d)}</small>
        </span>
        <span className="hist-main">
          <b>{b.client_name}</b>
          <small>
            {b.services?.name}
            {place && <> · <span className="bk-loc-dot" data-loc={place.sort} aria-hidden="true" /> {place.address.replace(/ \d+.*$/, "")}</>}
          </small>
        </span>
        <span className={"ad-pill " + b.status}>{STATUS_LABEL[b.status] ?? b.status}</span>
      </summary>
      <div className="hist-body">
        <BookingCard b={b} locs={locs} />
      </div>
    </details>
  );
}
