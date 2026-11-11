import { admin } from "../../../lib/supabase-admin";
import { berlinDateStr, berlinToUtc, addDays, fmtDateTime } from "../../../lib/tz";
import ManualBooking from "../../../components/ManualBooking";
import { setStatus } from "../actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string; starts_at: string; ends_at: string; client_name: string; client_email: string;
  client_phone: string | null; notes: string | null; status: string; services: { name: string } | null;
};

const hm = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function Card({ b }: { b: Row }) {
  return (
    <div className="ad-card">
      <div className="ad-row">
        <span className="ad-time">{fmtDateTime(b.starts_at)} – {hm(b.ends_at)}</span>
        <span className={"ad-pill " + b.status}>{b.status.replace("_", " ")}</span>
      </div>
      <b>{b.client_name} · {b.services?.name}</b>
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

export default async function Bookings() {
  const db = admin();
  const today = berlinDateStr(new Date());
  const dayStart = berlinToUtc(today, 0).toISOString();
  const tomorrow = berlinToUtc(addDays(today, 1), 0).toISOString();
  const sel = "id,starts_at,ends_at,client_name,client_email,client_phone,notes,status,services(name)";

  const [t, up, past, svc, week] = await Promise.all([
    db.from("bookings").select(sel).gte("starts_at", dayStart).lt("starts_at", tomorrow).order("starts_at"),
    db.from("bookings").select(sel).gte("starts_at", tomorrow).eq("status", "confirmed").order("starts_at").limit(60),
    db.from("bookings").select(sel).lt("starts_at", dayStart).order("starts_at", { ascending: false }).limit(15),
    db.from("services").select("id,name").eq("active", true).order("sort"),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("starts_at", dayStart).lt("starts_at", berlinToUtc(addDays(today, 7), 0).toISOString()),
  ]);
  const todays = (t.data ?? []) as unknown as Row[];

  return (
    <>
      <div className="ad-stats">
        <div className="ad-card ad-stat"><span className="ad-sub">Today</span><b>{todays.filter((x) => x.status !== "cancelled").length}</b></div>
        <div className="ad-card ad-stat"><span className="ad-sub">Next 7 days</span><b>{week.count ?? 0}</b></div>
      </div>

      <h2 className="ad-h">Today</h2>
      {todays.length ? todays.map((b) => <Card key={b.id} b={b} />) : <p className="ad-sub">Nothing booked today.</p>}

      <h2 className="ad-h">Add booking</h2>
      <ManualBooking services={svc.data ?? []} />

      <h2 className="ad-h">Upcoming</h2>
      {((up.data ?? []) as unknown as Row[]).map((b) => <Card key={b.id} b={b} />)}
      {!up.data?.length && <p className="ad-sub">No upcoming bookings.</p>}

      <h2 className="ad-h">Recent</h2>
      {((past.data ?? []) as unknown as Row[]).map((b) => <Card key={b.id} b={b} />)}
      {!past.data?.length && <p className="ad-sub">No past bookings yet.</p>}
    </>
  );
}
