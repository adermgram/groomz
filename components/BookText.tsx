"use client";
import { useT } from "../lib/booking-i18n";

export function BookHeading() {
  const { t } = useT();
  return (
    <>
      <span className="kicker">{t.kicker}</span>
      <h1 className="h2">{t.title}</h1>
    </>
  );
}

export function BookHelp() {
  const { t } = useT();
  return (
    <p className="bk-muted bk-help">
      {t.help}{" "}
      <a href="https://www.instagram.com/groomz.men/" target="_blank" rel="noopener">{t.helpLink}</a>.
    </p>
  );
}

export function ManageKicker() {
  const { t } = useT();
  return <span className="kicker">{t.yourBooking}</span>;
}
