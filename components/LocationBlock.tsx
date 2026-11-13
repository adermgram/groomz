"use client";
import { fullAddress, mapsUrl, type Location } from "../lib/locations-shared";
import { useT } from "../lib/booking-i18n";

/** Name + address + "Open in Maps" link. */
export default function LocationBlock({ location }: { location: Location | null | undefined }) {
  const { t } = useT();
  if (!location) return null;
  return (
    <div className="bk-loc">
      <span className="bk-loc-dot" data-loc={location.sort} aria-hidden="true" />
      <div>
        <b>{location.name}</b>
        <span>{fullAddress(location)}</span>
        <a href={mapsUrl(location)} target="_blank" rel="noopener">{t.openMaps} ↗</a>
      </div>
    </div>
  );
}
