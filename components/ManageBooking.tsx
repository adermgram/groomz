"use client";
import { useEffect, useState } from "react";
import SlotPicker from "./SlotPicker";

type B = { id: string; service_id: string; service_name: string; starts_at: string; status: string; client_name: string; canChange: boolean; cutoff: number };
const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function ManageBooking({ token }: { token: string }) {
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
    if (r.ok) { setMode("view"); setSlot(null); setMsg("Done. We emailed you the update."); load(); }
    else if (j.error === "slot_unavailable") setMsg("That time was just taken. Pick another.");
    else if (j.error === "locked") setMsg(`Changes are only possible up to ${j.cutoff}h before the appointment. Please message us on Instagram.`);
    else setMsg("Something went wrong.");
  }

  if (missing) return <><h1 className="h2">Booking not found.</h1><p className="bk-muted">This link is invalid.</p></>;
  if (!b) return <p className="bk-muted">Loading…</p>;

  return (
    <div className="bk">
      <h1 className="h2">{b.status === "cancelled" ? "Cancelled." : `Hi ${b.client_name.split(" ")[0]}.`}</h1>
      <p><b>{b.service_name}</b><br />{fmt(b.starts_at)} (Berlin time)<br /><span className="bk-muted">Status: {b.status}</span></p>
      {msg && <p className="bk-ok" role="status">{msg}</p>}

      {b.status === "confirmed" && mode === "view" && (
        b.canChange ? (
          <div className="bk-actions">
            <button className="btn-accent" onClick={() => setMode("move")}>Reschedule</button>
            <button className="bk-ghost" disabled={busy} onClick={() => confirm("Cancel this booking?") && act({ action: "cancel" })}>Cancel booking</button>
          </div>
        ) : <p className="bk-muted">Changes are possible up to {b.cutoff}h before your appointment. Message us on Instagram.</p>
      )}

      {mode === "move" && (
        <>
          <SlotPicker serviceId={b.service_id} ignore={b.id} value={slot} onPick={setSlot} />
          <div className="bk-actions">
            <button className="btn-accent" disabled={!slot || busy} onClick={() => act({ action: "reschedule", starts_at: slot })}>Confirm new time</button>
            <button className="bk-ghost" onClick={() => setMode("view")}>Back</button>
          </div>
        </>
      )}
      {b.status !== "confirmed" && <a className="btn-accent" href="/book">Book again</a>}
    </div>
  );
}
