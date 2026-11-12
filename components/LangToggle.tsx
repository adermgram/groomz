"use client";
import { setLang, useT } from "../lib/booking-i18n";

/** EN / DE switch for the booking pages. Shares the landing page's language choice. */
export default function LangToggle() {
  const { lang, t } = useT();
  return (
    <div className="lang-seg" role="group" aria-label={t.langLabel}>
      {(["en", "de"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
