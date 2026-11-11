"use client";
import { useEffect, useState } from "react";
import SlotPicker from "./SlotPicker";

export type Service = { id: string; name: string; description: string | null; duration_min: number; price_cents: number | null };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const price = (c: number | null) => (c == null ? "" : `€${(c / 100).toFixed(c % 100 ? 2 : 0)}`);

export default function BookingFlow({ services }: { services: Service[] }) {
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState<Service | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [token, setToken] = useState("");

  // Start each step at the top (matters on phones after picking a long list).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!svc || !slot) return;
    setBusy(true);
    setErr("");
    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: svc.id, starts_at: slot, ...f }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) {
      setToken(j.token);
      setStep(3);
    } else if (j.error === "slot_unavailable") {
      setErr("Sorry, that time was just taken. Please pick another.");
      setSlot(null);
      setStep(1);
    } else setErr("Something went wrong. Please try again.");
  }

  const steps = ["Service", "Time", "Details"];
  return (
    <div className="bk">
      {step < 3 && (
        <ol className="bk-steps" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? "on" : i < step ? "done" : ""}>
              <span>{i + 1}</span> {s}
            </li>
          ))}
        </ol>
      )}

      {step === 0 && (
        <div className="bk-list">
          {services.map((s) => (
            <button key={s.id} type="button" className="bk-svc" onClick={() => { setSvc(s); setSlot(null); setStep(1); }}>
              <span>
                <b>{s.name}</b>
                {s.description && <small>{s.description}</small>}
              </span>
              <em>
                {s.duration_min} min{s.price_cents != null && ` · ${price(s.price_cents)}`}
              </em>
            </button>
          ))}
          {services.length === 0 && <p className="bk-muted">No services available right now. Message us on Instagram.</p>}
        </div>
      )}

      {step === 1 && svc && (
        <>
          <p className="bk-sel">{svc.name} · {svc.duration_min} min <button type="button" className="bk-link" onClick={() => setStep(0)}>Change</button></p>
          {err && <p className="bk-err" role="alert">{err}</p>}
          <SlotPicker serviceId={svc.id} value={slot} onPick={(iso) => { setSlot(iso); setErr(""); }} />
          <div className="bk-actions">
            <button type="button" className="btn-accent" disabled={!slot} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </>
      )}

      {step === 2 && svc && slot && (
        <form onSubmit={submit} className="bk-form">
          <p className="bk-sel">{svc.name} · {fmt(slot)} <button type="button" className="bk-link" onClick={() => setStep(1)}>Change</button></p>
          <label className="field"><span className="field-label">Full name</span><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></label>
          <label className="field"><span className="field-label">Email</span><input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label className="field"><span className="field-label">Phone (optional)</span><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></label>
          <label className="field"><span className="field-label">Notes (optional)</span><textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Hair type, reference style…" /></label>
          {err && <p className="bk-err" role="alert">{err}</p>}
          <p className="bk-muted">We use your details only to manage this appointment and send you a confirmation.</p>
          <button type="submit" className="btn-accent btn-accent-full" disabled={busy}>{busy ? "Booking…" : "Confirm booking →"}</button>
        </form>
      )}

      {step === 3 && svc && slot && (
        <div className="bk-done">
          <span className="kicker">Confirmed</span>
          <h2 className="h2">You&apos;re booked.</h2>
          <p>{svc.name}<br />{fmt(slot)} (Berlin time)</p>
          <p className="bk-muted">We sent a confirmation with a calendar file to {f.email}.</p>
          <a className="btn-accent" href={`/booking/${token}`}>Manage booking</a>
        </div>
      )}
    </div>
  );
}
