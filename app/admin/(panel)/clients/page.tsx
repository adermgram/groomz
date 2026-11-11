import { admin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function Clients() {
  const db = admin();
  const [{ data: bk }, { data: wl }] = await Promise.all([
    db.from("bookings").select("client_name,client_email,client_phone,starts_at,status").order("starts_at", { ascending: false }),
    db.from("waitlist").select("*").order("created_at", { ascending: false }),
  ]);

  const map = new Map<string, { name: string; email: string; phone: string | null; visits: number; last: string }>();
  for (const b of bk ?? []) {
    if (b.client_email.endsWith("@grooms.local") || b.status === "cancelled") continue;
    const c = map.get(b.client_email) ?? { name: b.client_name, email: b.client_email, phone: b.client_phone, visits: 0, last: b.starts_at };
    c.visits += 1;
    map.set(b.client_email, c);
  }

  return (
    <>
      <h2 className="ad-h">Clients ({map.size})</h2>
      {[...map.values()].map((c) => (
        <div className="ad-card" key={c.email}>
          <div className="ad-row"><b>{c.name}</b><span className="ad-pill">{c.visits} booking{c.visits > 1 ? "s" : ""}</span></div>
          <p className="ad-sub"><a href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <> · {c.phone}</>}</p>
        </div>
      ))}

      <div className="ad-row" style={{ alignItems: "center" }}>
        <h2 className="ad-h">Hair Profile waitlist ({wl?.length ?? 0})</h2>
        <a className="ad-btn" href="/admin/waitlist.csv">Export CSV</a>
      </div>
      {(wl ?? []).map((w) => (
        <div className="ad-card" key={w.id}>
          <b>{w.full_name}</b>
          <p className="ad-sub">{w.email} · {w.location}</p>
        </div>
      ))}
    </>
  );
}
