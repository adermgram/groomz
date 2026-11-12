import nodemailer from "nodemailer";
import { fmtDateTime } from "./tz";

const DEFAULT_SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://groomzmen.de").replace(/\/$/, "");

function transport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function wrap(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;background:#f3efe8;padding:24px">
  <div style="max-width:520px;margin:auto;background:#fff;border-top:4px solid #d62b1a;padding:28px;color:#141216">
    <div style="font-weight:800;font-size:22px;letter-spacing:-.01em">GROOMS</div>
    <h2 style="margin:18px 0 8px">${esc(title)}</h2>${body}
    <p style="color:#837b6d;font-size:12px;margin-top:28px">GROOMS · Berlin · <a href="https://www.instagram.com/groomz.men/">@groomz.men</a></p>
  </div></div>`;
}

export type MailBooking = {
  client_name: string;
  client_email: string;
  starts_at: string;
  ends_at: string;
  manage_token: string;
  service_name: string;
};

function ics(b: MailBooking, site: string) {
  const f = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GROOMS//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.manage_token}@groomzmen.de`,
    `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(b.starts_at)}`,
    `DTEND:${f(b.ends_at)}`,
    `SUMMARY:GROOMS - ${b.service_name}`,
    "LOCATION:GROOMS, Berlin",
    `URL:${site}/booking/${b.manage_token}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

async function send(to: string, subject: string, html: string, ical?: string) {
  const t = transport();
  if (!t) {
    console.warn("[mail] SMTP not configured, skipping:", subject, "->", to);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments: ical ? [{ filename: "grooms-booking.ics", content: ical, contentType: "text/calendar" }] : undefined,
    });
  } catch (e) {
    console.error("[mail] failed", subject, e); // never let email failure break a booking
  }
}

const details = (b: MailBooking) =>
  `<p style="margin:0 0 6px"><b>${esc(b.service_name)}</b></p><p style="margin:0 0 16px">${esc(fmtDateTime(b.starts_at))} (Berlin time)</p>`;
const manage = (b: MailBooking, site: string) =>
  `<p><a href="${site}/booking/${b.manage_token}" style="background:#d62b1a;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block">Manage / cancel booking</a></p>`;

/** `site` = public base URL (from the incoming request); falls back to NEXT_PUBLIC_SITE_URL. */
export async function sendConfirmation(b: MailBooking, rescheduled = false, site = DEFAULT_SITE()) {
  await send(
    b.client_email,
    rescheduled ? "Your GROOMS booking was moved" : "Your GROOMS booking is confirmed",
    wrap(rescheduled ? "Booking updated" : "You're booked", `<p>Hi ${esc(b.client_name)},</p>${details(b)}${manage(b, site)}`),
    ics(b, site),
  );
  if (process.env.OWNER_EMAIL) {
    await send(
      process.env.OWNER_EMAIL,
      `${rescheduled ? "Moved" : "New"} booking: ${b.client_name}`,
      wrap("Booking", `${details(b)}<p>${esc(b.client_name)} · ${esc(b.client_email)}</p>`),
    );
  }
}

export async function sendCancellation(b: MailBooking, byClient: boolean, site = DEFAULT_SITE()) {
  await send(
    b.client_email,
    "Your GROOMS booking was cancelled",
    wrap("Booking cancelled", `<p>Hi ${esc(b.client_name)},</p>${details(b)}<p><a href="${site}/book">Book a new time</a></p>`),
  );
  if (byClient && process.env.OWNER_EMAIL) {
    await send(process.env.OWNER_EMAIL, `Cancelled: ${b.client_name}`, wrap("Cancelled by client", details(b)));
  }
}

export async function sendReminder(b: MailBooking, site = DEFAULT_SITE()) {
  await send(
    b.client_email,
    "Reminder: your GROOMS appointment is tomorrow",
    wrap("See you soon", `<p>Hi ${esc(b.client_name)},</p>${details(b)}${manage(b, site)}`),
  );
}
