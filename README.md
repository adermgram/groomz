# GROOMS

Next.js (App Router) + Supabase + Vercel. Landing page, online booking and an admin dashboard for GROOMS, Berlin.

## Routes
| Route | What |
|---|---|
| `/` | Landing page (7 languages, light/dark), ported from the original static site |
| `/book` | Mobile-first booking: service, day, time, details |
| `/booking/[token]` | Client's private link to view, reschedule or cancel |
| `/admin` | Bookings (today, upcoming, manual add, mark done/no-show/cancel) |
| `/admin/services`, `/admin/hours`, `/admin/clients` | Services CRUD, opening hours/time off/rules, clients and waitlist (CSV) |

## Setup
1. Create a Supabase project. In the SQL editor run `supabase/migrations/0001_init.sql` (tables, RLS, no-double-booking constraint, sample services and hours).
2. Run `supabase/migrations/0002_admins.sql` too.
3. Supabase, Authentication, Users: create the login (email + password, auto-confirm). Then Table Editor, `admins`: add a row with that email (lowercase). To remove someone's access, delete the row.
4. Copy `.env.example` to `.env.local` and fill it in (`ADMIN_EMAILS` is just an optional fallback).
4. `npm install`, then `npm run dev`.

## Email (Nodemailer)
Uses plain SMTP, so any mailbox works (Hostinger, Gmail app password, ...). Set `SMTP_*`, `MAIL_FROM`, `OWNER_EMAIL`. Add SPF/DKIM for your sending domain so mails don't land in spam. Without `SMTP_HOST` emails are skipped and bookings still work.
Reminders are sent by a daily Vercel Cron (`vercel.json`) calling `/api/cron/reminders`; set `CRON_SECRET` in Vercel.

## Deploy
Push to GitHub, import into Vercel, add the env vars from `.env.example`, then point `groomzmen.de` DNS at Vercel.

## Notes
- All times are Europe/Berlin. Slots come from opening hours, breaks, time off, service duration and existing bookings (`lib/slots.ts`). The database rejects overlapping confirmed bookings, so two people cannot take the same slot.
- Public tables are locked by RLS; bookings/waitlist/admin writes only happen server-side with the service role key.
- Landing markup lives in `content/landing.html`, behaviour and translations in `lib/landing.ts`.
