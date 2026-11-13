"use client";
import { useEffect, useState } from "react";

export type Lang = "en" | "de";
const KEY = "grooms-lang"; // shared with the landing page
const EVT = "grooms-lang";

/** Saved choice, else the browser language (German browsers get German), else English. */
export function readLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === "de" ? "de" : "en";
    return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
  } catch {
    return "en";
  }
}

export function setLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function useLang(): Lang {
  const [lang, set] = useState<Lang>("en");
  useEffect(() => {
    const sync = () => {
      const l = readLang();
      set(l);
      document.documentElement.lang = l;
    };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return lang;
}

export const localeOf = (l: Lang) => (l === "de" ? "de-DE" : "en-GB");
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

export const T = {
  en: {
    kicker: "Book a chair",
    title: "Pick your time.",
    yourBooking: "Your booking",
    help: "Questions first?",
    helpLink: "Message us on Instagram",
    steps: ["Service", "Time", "Details"],
    noServices: "No services available right now. Message us on Instagram.",
    min: "min",
    change: "Change",
    continue: "Continue →",
    fullName: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    notes: "Notes (optional)",
    notesPh: "Hair type, reference style…",
    consent: "We use your details only to manage this appointment and send you a confirmation.",
    confirm: "Confirm booking →",
    booking: "Booking…",
    taken: "Sorry, that time was just taken. Please pick another.",
    wrong: "Something went wrong. Please try again.",
    confirmed: "Confirmed",
    booked: "You're booked.",
    berlinTime: "(Berlin time)",
    sentTo: "We sent a confirmation with a calendar file to {email}.",
    manage: "Manage booking",
    chooseDay: "Choose a day",
    finding: "Finding free times…",
    noTimes: "No free times on this day. Try another date.",
    allBerlin: "All times are Berlin time.",
    notFound: "Booking not found.",
    badLink: "This link is invalid.",
    loading: "Loading…",
    cancelled: "Cancelled.",
    hi: "Hi {name}.",
    status: "Status: {status}",
    statuses: { confirmed: "confirmed", cancelled: "cancelled", completed: "completed", no_show: "no-show" } as Record<string, string>,
    done: "Done. We emailed you the update.",
    lockedMsg: "Changes are only possible up to {n}h before the appointment. Please message us on Instagram.",
    lockedInfo: "Changes are possible up to {n}h before your appointment. Message us on Instagram.",
    reschedule: "Reschedule",
    cancelBooking: "Cancel booking",
    cancelAsk: "Cancel this booking?",
    confirmNew: "Confirm new time",
    back: "Back",
    bookAgain: "Book again",
    langLabel: "Language",
    location: "Location",
    openMaps: "Open in Maps",
    onlyAt: "Showing days at {name} only.",
    allLocations: "See all locations",
    closed: "Closed",
  },
  de: {
    kicker: "Stuhl buchen",
    title: "Wähle deine Zeit.",
    yourBooking: "Deine Buchung",
    help: "Erst eine Frage?",
    helpLink: "Schreib uns auf Instagram",
    steps: ["Service", "Zeit", "Details"],
    noServices: "Gerade sind keine Services verfügbar. Schreib uns auf Instagram.",
    min: "Min.",
    change: "Ändern",
    continue: "Weiter →",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    phone: "Telefon (optional)",
    notes: "Anmerkungen (optional)",
    notesPh: "Haartyp, Referenz-Style…",
    consent: "Wir nutzen deine Daten nur, um diesen Termin zu verwalten und dir eine Bestätigung zu schicken.",
    confirm: "Buchung bestätigen →",
    booking: "Wird gebucht…",
    taken: "Diese Zeit wurde gerade vergeben. Bitte wähle eine andere.",
    wrong: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    confirmed: "Bestätigt",
    booked: "Du bist gebucht.",
    berlinTime: "(Berliner Zeit)",
    sentTo: "Wir haben eine Bestätigung mit Kalenderdatei an {email} geschickt.",
    manage: "Buchung verwalten",
    chooseDay: "Tag wählen",
    finding: "Freie Zeiten werden gesucht…",
    noTimes: "An diesem Tag sind keine Zeiten frei. Probiere ein anderes Datum.",
    allBerlin: "Alle Zeiten in Berliner Zeit.",
    notFound: "Buchung nicht gefunden.",
    badLink: "Dieser Link ist ungültig.",
    loading: "Lädt…",
    cancelled: "Storniert.",
    hi: "Hi {name}.",
    status: "Status: {status}",
    statuses: { confirmed: "bestätigt", cancelled: "storniert", completed: "abgeschlossen", no_show: "nicht erschienen" } as Record<string, string>,
    done: "Erledigt. Wir haben dir die Änderung per E-Mail geschickt.",
    lockedMsg: "Änderungen sind nur bis {n} Std. vor dem Termin möglich. Bitte schreib uns auf Instagram.",
    lockedInfo: "Änderungen sind bis {n} Std. vor deinem Termin möglich. Schreib uns auf Instagram.",
    reschedule: "Termin verschieben",
    cancelBooking: "Buchung stornieren",
    cancelAsk: "Diese Buchung stornieren?",
    confirmNew: "Neue Zeit bestätigen",
    back: "Zurück",
    bookAgain: "Erneut buchen",
    langLabel: "Sprache",
    location: "Standort",
    openMaps: "In Maps öffnen",
    onlyAt: "Es werden nur Tage bei {name} angezeigt.",
    allLocations: "Alle Standorte anzeigen",
    closed: "Geschlossen",
  },
};

export function useT() {
  const lang = useLang();
  return { lang, t: T[lang], loc: localeOf(lang) };
}
