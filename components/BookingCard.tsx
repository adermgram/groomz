import { setStatus } from "../app/admin/actions";
import type { Location } from "../lib/locations-shared";
import { fmtDateTime } from "../lib/tz";

export type BookingRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  notes: string | null;
  status: string;
  services: { name: string } | null;
  location_id?: string | null;
};

const hm = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function BookingCard({ b, locs, highlight = false }: { b: BookingRow; locs: Location[]; highlight?: boolean }) {
  const place = locs.find((l) => l.id === b.location_id);
  return (
    <div className={"ad-card" + (highlight ? " hl" : "")} id={`b-${b.id}`}>
      <div className="ad-row">
        <span className="ad-time">{fmtDateTime(b.starts_at)} – {hm(b.ends_at)}</span>
        <span className={"ad-pill " + b.status}>{b.status.replace("_", " ")}</span>
      </div>
      <b>{b.client_name} · {b.services?.name}</b>
      {place && (
        <p className="ad-sub"><span className="bk-loc-dot" data-loc={place.sort} aria-hidden="true" /> {place.name}</p>
      )}
      <p className="ad-sub">
        {b.client_email.endsWith("@grooms.local") ? "Walk-in" : <a href={`mailto:${b.client_email}`}>{b.client_email}</a>}
        {b.client_phone && <> · <a href={`tel:${b.client_phone}`}>{b.client_phone}</a></>}
      </p>
      {b.notes && <p className="ad-sub">“{b.notes}”</p>}
      {b.status === "confirmed" && (
        <div className="ad-btns">
          {(["completed", "no_show", "cancelled"] as const).map((st) => (
            <form key={st} action={setStatus}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={st} />
              <button className="ad-btn">{st === "completed" ? "Done" : st === "no_show" ? "No-show" : "Cancel"}</button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
