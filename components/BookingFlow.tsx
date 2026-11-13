"use client";
import { useCallback, useEffect, useState } from "react";
import { fill, useT } from "../lib/booking-i18n";
import type { Location } from "../lib/locations-shared";
import LocationBlock from "./LocationBlock";
import SlotPicker from "./SlotPicker";

export type Service = { id: string; name: string; description: string | null; duration_min: number; price_cents: number | null };

const price = (c: number | null) => (c == null ? "" : `€${(c / 100).toFixed(c % 100 ? 2 : 0)}`);

export default function BookingFlow({ services, locationSlug }: { services: Service[]; locationSlug?: string }) {
  const { t, loc } = useT();
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(loc, { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState<Service | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [place, setPlace] = useState<Location | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<"" | "taken" | "wrong">("");
  const [token, setToken] = useState("");

  // Browser/phone Back steps back through the booking instead of leaving the site.
  const go = useCallback((n: number, replace = false) => {
    try {
      if (replace) history.replaceState({ bk: n }, "");
      else if (n > 0) history.pushState({ bk: n }, "");
    } catch {}
    setStep(n);
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const n = typeof e.state?.bk === "number" ? e.state.bk : 0;
      setStep((cur) => {
        if (cur === 3) {
          // Back from the confirmation: start fresh (never re-submit a finished booking).
          setSvc(null);
          setSlot(null);
          setPlace(null);
          return 0;
        }
        return Math.min(n, cur);
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
      if (j.location) setPlace(j.location); // the server's answer is the truth
      go(3, true);
    } else if (j.error === "slot_unavailable") {
      setErr("taken");
      setSlot(null);
      history.back(); // back to the time step through the normal history entry
    } else setErr("wrong");
  }

  const errText = err === "taken" ? t.taken : err === "wrong" ? t.wrong : "";

  return (
    <div className="bk">
      {step < 3 && (
        <ol className="bk-steps" aria-label="Progress">
          {t.steps.map((s, i) => (
            <li key={i} className={i === step ? "on" : i < step ? "done" : ""}>
              <span>{i + 1}</span> {s}
            </li>
          ))}
        </ol>
      )}

      {step === 0 && (
        <div className="bk-list">
          {services.map((s) => (
            <button key={s.id} type="button" className="bk-svc" onClick={() => { setSvc(s); setSlot(null); go(1); }}>
              <span>
                <b>{s.name}</b>
                {s.description && <small>{s.description}</small>}
              </span>
              <em>
                {s.duration_min} {t.min}{s.price_cents != null && ` · ${price(s.price_cents)}`}
              </em>
            </button>
          ))}
          {services.length === 0 && <p className="bk-muted">{t.noServices}</p>}
        </div>
      )}

      {step === 1 && svc && (
        <>
          <p className="bk-sel">{svc.name} · {svc.duration_min} {t.min} <button type="button" className="bk-link" onClick={() => history.back()}>{t.change}</button></p>
          {errText && <p className="bk-err" role="alert">{errText}</p>}
          <SlotPicker serviceId={svc.id} value={slot} locationSlug={locationSlug} onPick={(iso, l) => { setSlot(iso); setPlace(l); setErr(""); }} />
          <div className="bk-actions">
            <button type="button" className="btn-accent" disabled={!slot} onClick={() => go(2)}>{t.continue}</button>
          </div>
        </>
      )}

      {step === 2 && svc && slot && (
        <form onSubmit={submit} className="bk-form">
          <p className="bk-sel">{svc.name} · {fmt(slot)} <button type="button" className="bk-link" onClick={() => history.back()}>{t.change}</button></p>
          <LocationBlock location={place} />
          <label className="field"><span className="field-label">{t.fullName}</span><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></label>
          <label className="field"><span className="field-label">{t.email}</span><input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label className="field"><span className="field-label">{t.phone}</span><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></label>
          <label className="field"><span className="field-label">{t.notes}</span><textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder={t.notesPh} /></label>
          {errText && <p className="bk-err" role="alert">{errText}</p>}
          <p className="bk-muted">{t.consent}</p>
          <button type="submit" className="btn-accent btn-accent-full" disabled={busy}>{busy ? t.booking : t.confirm}</button>
        </form>
      )}

      {step === 3 && svc && slot && (
        <div className="bk-done">
          <span className="kicker">{t.confirmed}</span>
          <h2 className="h2">{t.booked}</h2>
          <p>{svc.name}<br />{fmt(slot)} {t.berlinTime}</p>
          <LocationBlock location={place} />
          <p className="bk-muted">{fill(t.sentTo, { email: f.email })}</p>
          <a className="btn-accent" href={`/booking/${token}`}>{t.manage}</a>
        </div>
      )}
    </div>
  );
}
