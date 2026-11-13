export const TZ = "Europe/Berlin";

/** Offset (ms) of Europe/Berlin from UTC at the given instant. */
function offsetMs(at: Date): number {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Berlin wall-clock (YYYY-MM-DD + minutes since midnight) -> UTC Date. */
export function berlinToUtc(date: string, minutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 0, minutes));
  let t = guess.getTime() - offsetMs(guess);
  t = guess.getTime() - offsetMs(new Date(t));
  return new Date(t);
}

export function berlinDateStr(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function fmtDateTime(at: Date | string, lang = "en"): string {
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(at));
}

/** Minutes since midnight (Berlin time) of an instant. */
export function berlinMinutes(at: Date): number {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  return Number(p.find((x) => x.type === "hour")!.value) * 60 + Number(p.find((x) => x.type === "minute")!.value);
}

export const toMin =(t: string | null): number | null => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : null);
