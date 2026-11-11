import SubmitButton from "../../../../components/SubmitButton";
import { admin } from "../../../../lib/supabase-admin";
import { addTimeOff, deleteTimeOff, saveHours } from "../../actions";

export const dynamic = "force-dynamic";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const t = (v: string | null) => (v ? v.slice(0, 5) : "");

export default async function Hours() {
  const db = admin();
  const [{ data: wh }, { data: st }, { data: off }] = await Promise.all([
    db.from("working_hours").select("*").order("weekday"),
    db.from("settings").select("*").eq("id", 1).single(),
    db.from("time_off").select("*").order("start_date"),
  ]);
  const byDay = new Map((wh ?? []).map((w) => [w.weekday, w]));

  return (
    <>
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
