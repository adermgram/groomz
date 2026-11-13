import SubmitButton from "../../../../components/SubmitButton";
import { allLocations } from "../../../../lib/locations";
import { admin } from "../../../../lib/supabase-admin";
import { addLocationOverride, addTimeOff, deleteLocationOverride, deleteTimeOff, saveHours, saveLocation } from "../../actions";

export const dynamic = "force-dynamic";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const t = (v: string | null) => (v ? v.slice(0, 5) : "");

export default async function Hours() {
  const db = admin();
  const [{ data: wh }, { data: st }, { data: off }, { data: ovr }, locs] = await Promise.all([
    db.from("working_hours").select("*").order("weekday"),
    db.from("settings").select("*").eq("id", 1).single(),
    db.from("time_off").select("*").order("start_date"),
    db.from("location_overrides").select("*").gte("date", new Date().toISOString().slice(0, 10)).order("date"),
    allLocations(),
  ]);
  const byDay = new Map((wh ?? []).map((w) => [w.weekday, w]));
  const nameOf = (id: string) => locs.find((l) => l.id === id)?.name ?? "?";

  return (
    <>
      {locs.length > 0 && (
        <>
          <h2 className="ad-h">Locations</h2>
          {locs.map((l) => (
            <form key={l.id} action={saveLocation} className="ad-card">
              <input type="hidden" name="id" value={l.id} />
              <div className="ad-form">
                <label>Name<input name="name" defaultValue={l.name} required /></label>
                <label>Street<input name="address" defaultValue={l.address} required /></label>
                <label>Postcode &amp; city<input name="postcode_city" defaultValue={l.postcode_city} required /></label>
                <label>Maps link (optional)<input name="maps_url" type="url" defaultValue={l.maps_url ?? ""} placeholder="https://maps.app.goo.gl/…" /></label>
              </div>
              <div><SubmitButton>Save location</SubmitButton></div>
            </form>
          ))}
        </>
      )}

      <h2 className="ad-h">Opening hours</h2>
      <form action={saveHours}>
        {DAYS.map((name, d) => {
          const w = byDay.get(d);
          return (
            <div className="ad-card" key={d}>
              <label style={{ flexDirection: "row", alignItems: "center", gap: ".5rem", fontSize: ".9rem", color: "var(--ink)" }}>
                <input type="checkbox" name={`open_${d}`} defaultChecked={w?.is_open} /> {name}
              </label>
              <div className="ad-form">
                {locs.length > 0 && (
                  <label>Location
                    <select name={`loc_${d}`} defaultValue={w?.location_id ?? ""}>
                      {!w?.location_id && <option value="">Choose…</option>}
                      {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </label>
                )}
                <label>Open<input type="time" name={`from_${d}`} defaultValue={t(w?.open_time) || "10:00"} /></label>
                <label>Close<input type="time" name={`to_${d}`} defaultValue={t(w?.close_time) || "19:00"} /></label>
                <label>Break from<input type="time" name={`bs_${d}`} defaultValue={t(w?.break_start)} /></label>
                <label>Break to<input type="time" name={`be_${d}`} defaultValue={t(w?.break_end)} /></label>
              </div>
            </div>
          );
        })}
        <h2 className="ad-h">Booking rules</h2>
        <div className="ad-card ad-form">
          <label>Slot step (min)<input type="number" name="slot_interval_min" min={5} step={5} defaultValue={st?.slot_interval_min ?? 15} /></label>
          <label>Min notice (h)<input type="number" name="min_notice_hours" min={0} defaultValue={st?.min_notice_hours ?? 2} /></label>
          <label>Max days ahead<input type="number" name="max_days_ahead" min={1} defaultValue={st?.max_days_ahead ?? 60} /></label>
          <label>Cancel cutoff (h)<input type="number" name="cancel_cutoff_hours" min={0} defaultValue={st?.cancel_cutoff_hours ?? 12} /></label>
        </div>
        <SubmitButton>Save hours &amp; rules</SubmitButton>
      </form>

      {locs.length > 0 && (
        <>
          <h2 className="ad-h">One-off location changes</h2>
          <p className="ad-sub" style={{ marginBottom: ".6rem" }}>Use another location on a single date, without changing the weekly schedule.</p>
          {(ovr ?? []).map((o) => (
            <div className="ad-card ad-row" key={o.date}>
              <span>{o.date} <span className="ad-sub">· {nameOf(o.location_id)}</span></span>
              <form action={deleteLocationOverride}><input type="hidden" name="date" value={o.date} /><button className="ad-btn">Remove</button></form>
            </div>
          ))}
          <form action={addLocationOverride} className="ad-card">
            <div className="ad-form">
              <label>Date<input type="date" name="date" required /></label>
              <label>Location
                <select name="location_id" required>
                  {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
            </div>
            <div><SubmitButton pending="Adding…">Add change</SubmitButton></div>
          </form>
        </>
      )}

      <h2 className="ad-h">Time off</h2>
      {(off ?? []).map((o) => (
        <div className="ad-card ad-row" key={o.id}>
          <span>{o.start_date}{o.end_date !== o.start_date && ` → ${o.end_date}`} {o.reason && <span className="ad-sub">· {o.reason}</span>}</span>
          <form action={deleteTimeOff}><input type="hidden" name="id" value={o.id} /><button className="ad-btn">Remove</button></form>
        </div>
      ))}
      <form action={addTimeOff} className="ad-card">
        <div className="ad-form">
          <label>From<input type="date" name="start_date" required /></label>
          <label>To<input type="date" name="end_date" /></label>
          <label>Reason<input name="reason" /></label>
        </div>
        <div><SubmitButton pending="Adding…">Add time off</SubmitButton></div>
      </form>
    </>
  );
}
