import { readFileSync } from "node:fs";
import { join } from "node:path";
import Landing from "../components/Landing";
import { mapsUrl, type Location } from "../lib/locations-shared";
import { admin } from "../lib/supabase-admin";

// Static, author-controlled markup ported from the original index.html.
const html = readFileSync(join(process.cwd(), "content", "landing.html"), "utf8");

// Refresh the address section from the database at most every 5 minutes.
export const revalidate = 300;

type Row = Location & { days: number[] };

// Used if the database can't be read (e.g. before the locations migration has been run).
const FALLBACK: Row[] = [
  { id: "f1", slug: "mehringdamm", name: "Your Place Hair Studio", address: "Mehringdamm 79", postcode_city: "10965 Berlin", maps_url: null, sort: 1, days: [2, 3, 6] },
  { id: "f2", slug: "carlsgarten", name: "Am Carlsgarten", address: "Am Carlsgarten 7", postcode_city: "10318 Berlin", maps_url: null, sort: 2, days: [1, 4, 5, 0] },
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const order = (d: number) => (d === 0 ? 7 : d); // Monday first, Sunday last

async function loadLocations(): Promise<Row[]> {
  try {
    const db = admin();
    const [{ data: locs }, { data: wh }] = await Promise.all([
      db.from("locations").select("*").order("sort"),
      db.from("working_hours").select("*"),
    ]);
    if (!locs?.length) return FALLBACK;
    return (locs as Location[]).map((l) => ({
      ...l,
      days: (wh ?? []).filter((w) => w.is_open && w.location_id === l.id).map((w) => w.weekday).sort((a, b) => order(a) - order(b)),
    }));
  } catch {
    return FALLBACK;
  }
}

function findUs(rows: Row[]) {
  const cards = rows
    .map(
      (l) => `<div class="find-card" data-reveal>
          <span class="find-dot bk-loc-dot" data-loc="${l.sort}" aria-hidden="true"></span>
          <h3 class="find-name">${esc(l.name)}</h3>
          <p class="find-addr">${esc(l.address)}<br>${esc(l.postcode_city)}</p>
          <p class="find-days" data-weekdays="${l.days.join(",")}"></p>
          <a class="find-map" href="${esc(mapsUrl(l))}" target="_blank" rel="noopener"><span data-i18n="findOpen"></span> ↗</a>
          <a class="find-book" href="/book/${esc(l.slug)}" data-i18n="btnBook"></a>
        </div>`,
    )
    .join("\n");
  return `<section id="find-us" class="section find-section">
      <div class="shell">
        <div class="find-head" data-reveal>
          <span class="kicker" data-i18n="findKicker"></span>
          <h2 class="h2" data-i18n="findTitle"></h2>
        </div>
        <div class="find-grid">${cards}</div>
        <p class="services-note" data-reveal data-i18n="findNote"></p>
      </div>
    </section>`;
}

export default async function Home() {
  const rows = await loadLocations();
  return <Landing html={html.replace("<!--FIND_US-->", findUs(rows))} />;
}
