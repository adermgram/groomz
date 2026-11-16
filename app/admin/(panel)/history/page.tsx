import Link from "next/link";
import type { BookingRow } from "../../../../components/BookingCard";
import HistoryRow, { STATUS_LABEL } from "../../../../components/HistoryRow";
import { allLocations } from "../../../../lib/locations";
import { admin } from "../../../../lib/supabase-admin";
import { berlinDateStr, berlinToUtc } from "../../../../lib/tz";

export const dynamic = "force-dynamic";

const PAGE = 30;
type SP = { q?: string; status?: string; loc?: string; month?: string; page?: string };

export default async function History({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 60).trim();
  const status = ["completed", "no_show", "cancelled", "confirmed"].includes(sp.status ?? "") ? sp.status! : "all";
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? sp.month! : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const locs = await allLocations();
  const loc = locs.find((l) => l.slug === sp.loc);

  let qb = admin()
    .from("bookings")
    .select("*, services(name)", { count: "exact" })
    .lt("starts_at", new Date().toISOString()) // history = appointments that have already happened
    .order("starts_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (status !== "all") qb = qb.eq("status", status);
  if (loc) qb = qb.eq("location_id", loc.id);
  if (month) {
    const [y, m] = month.split("-").map(Number);
    qb = qb
      .gte("starts_at", berlinToUtc(`${month}-01`, 0).toISOString())
      .lt("starts_at", berlinToUtc(new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10), 0).toISOString());
  }
  const safe = q.replace(/[,()%*\\]/g, " ").trim();
  if (safe) qb = qb.or(`client_name.ilike.%${safe}%,client_email.ilike.%${safe}%,client_phone.ilike.%${safe}%`);

  const { data, count } = await qb;
  const rows = (data ?? []) as unknown as BookingRow[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  const link = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status !== "all") u.set("status", status);
    if (loc) u.set("loc", loc.slug);
    if (month) u.set("month", month);
    if (p > 1) u.set("page", String(p));
    return `/admin/history${u.size ? `?${u}` : ""}`;
  };
  const filtered = !!(q || status !== "all" || loc || month);

  // Group the (already newest-first) rows under month headings.
  const groups: { key: string; label: string; items: BookingRow[] }[] = [];
  for (const b of rows) {
    const key = berlinDateStr(new Date(b.starts_at)).slice(0, 7);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, label: new Date(key + "-01T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }), items: [] };
      groups.push(g);
    }
    g.items.push(b);
  }

  return (
    <>
      <h2 className="ad-h">Service history</h2>
      <form method="get" className="ad-card hist-filters">
        <div className="ad-form">
          <label>Search client<input type="search" name="q" defaultValue={q} placeholder="Name, email or phone" /></label>
          <label>Status
            <select name="status" defaultValue={status}>
              <option value="all">All</option>
              {(["completed", "no_show", "cancelled", "confirmed"] as const).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          {locs.length > 1 && (
            <label>Location
              <select name="loc" defaultValue={loc?.slug ?? ""}>
                <option value="">All places</option>
                {locs.map((l) => <option key={l.id} value={l.slug}>{l.name}</option>)}
              </select>
            </label>
          )}
          <label>Month<input type="month" name="month" defaultValue={month} /></label>
        </div>
        <div className="ad-btns">
          <button className="ad-btn primary">Apply</button>
          {filtered && <Link className="ad-btn" href="/admin/history">Reset</Link>}
        </div>
      </form>

      <p className="cal-summary">
        <b>{total}</b> past booking{total === 1 ? "" : "s"}
        {filtered && <span className="ad-sub"> matching your filters</span>}
        {pages > 1 && <span className="ad-sub"> · page {page} of {pages}</span>}
      </p>

      {rows.length === 0 && <p className="ad-sub">{filtered ? "No bookings match these filters." : "No past bookings yet."}</p>}

      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="hist-month">{g.label} <span>{g.items.length}</span></h3>
          <div className="hist-list">
            {g.items.map((b) => <HistoryRow key={b.id} b={b} locs={locs} />)}
          </div>
        </section>
      ))}

      {pages > 1 && (
        <nav className="hist-pager" aria-label="Pages">
          {page > 1 ? <Link className="ad-btn" href={link(page - 1)}>← Newer</Link> : <span />}
          <span className="ad-sub">Page {page} / {pages}</span>
          {page < pages ? <Link className="ad-btn" href={link(page + 1)}>Older →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
