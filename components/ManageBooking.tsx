"use client";
import { useEffect, useState } from "react";
import { fill, useT } from "../lib/booking-i18n";
import type { Location } from "../lib/locations-shared";
import LocationBlock from "./LocationBlock";
import SlotPicker from "./SlotPicker";

type B = { location: Location | null; id: string; service_id: string; service_name: string; starts_at: string; status: string; client_name: string; canChange: boolean; cutoff: number };

export default function ManageBooking({ token }: { token: string }) {
  const { t, loc } = useT();
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(loc, { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  const [b, setB] = useState<B | null>(null);
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState<"view" | "move">("view");
  const [slot, setSlot] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch(`/api/bookings/${token}`).then(async (r) => (r.ok ? setB(await r.json()) : setMissing(true)));
  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(body: object) {
    setBusy(true);
    setMsg("");
    const r = await fetch(`/api/bookings/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMode("view"); setSlot(null); setMsg(t.done); load(); }
    else if (j.error === "slot_unavailable") setMsg(t.taken);
    else if (j.error === "locked") setMsg(fill(t.lockedMsg, { n: j.cutoff }));
    else setMsg(t.wrong);
  }

  if (missing) return <><h1 className="h2">{t.notFound}</h1><p className="bk-muted">{t.badLink}</p></>;
  if (!b) return <p className="bk-muted">{t.loading}</p>;

  return (
    <div className="bk">
      <h1 className="h2">{b.status === "cancelled" ? t.cancelled : fill(t.hi, { name: b.client_name.split(" ")[0] })}</h1>
      <p><b>{b.service_name}</b><br />{fmt(b.starts_at)} {t.berlinTime}<br /><span className="bk-muted">{fill(t.status, { status: t.statuses[b.status] ?? b.status })}</span></p>
      <LocationBlock location={b.location} />
      {msg && <p className="bk-ok" role="status">{msg}</p>}

      {b.status === "confirmed" && mode === "view" && (
        b.canChange ? (
          <div className="bk-actions">
            <button className="btn-accent" onClick={() => setMode("move")}>{t.reschedule}</button>
            <button className="bk-ghost" disabled={busy} onClick={() => confirm(t.cancelAsk) && act({ action: "cancel" })}>{t.cancelBooking}</button>
          </div>
        ) : <p className="bk-muted">{fill(t.lockedInfo, { n: b.cutoff })}</p>
      )}

      {mode === "move" && (
        <>
          <SlotPicker serviceId={b.service_id} ignore={b.id} value={slot} onPick={setSlot} />
          <div className="bk-actions">
            <button className="btn-accent" disabled={!slot || busy} onClick={() => act({ action: "reschedule", starts_at: slot })}>{t.confirmNew}</button>
            <button className="bk-ghost" onClick={() => setMode("view")}>{t.back}</button>
          </div>
        </>
      )}
      {b.status !== "confirmed" && <a className="btn-accent" href="/book">{t.bookAgain}</a>}
    </div>
  );
}
