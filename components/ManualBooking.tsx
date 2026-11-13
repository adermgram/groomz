"use client";
import { useActionState } from "react";
import { createManualBooking } from "../app/admin/actions";

export default function ManualBooking({ services, defaultDate }: { services: { id: string; name: string }[]; defaultDate?: string }) {
  const [st, action, pending] = useActionState(createManualBooking, null as { error?: string; ok?: boolean } | null);
  return (
    <form action={action} className="ad-card">
      <div className="ad-form">
        <label>Service<select name="service_id" required>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Date<input type="date" name="date" required defaultValue={defaultDate} /></label>
        <label>Time<input type="time" name="time" required step={300} /></label>
        <label>Name<input name="name" required /></label>
        <label>Email (optional)<input type="email" name="email" /></label>
        <label>Phone<input name="phone" /></label>
      </div>
      {st?.error && <p className="bk-err">{st.error}</p>}
      {st?.ok && <p className="bk-muted">Booking added.</p>}
      <div><button className="ad-btn primary" disabled={pending}>{pending ? "Saving…" : "Add booking"}</button></div>
    </form>
  );
}
