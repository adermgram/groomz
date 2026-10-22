# GROOMS — Landing Page

Static implementation of the GROOMS landing page (Berlin afro & textured-hair barbershop).

## Stack

Plain HTML + CSS + vanilla JavaScript. **No build step, no dependencies, no server runtime** —
it's a static site, ready to drop onto Hostinger shared hosting (or any static host).

## Files

- `index.html` — page markup (semantic, SEO meta, Open Graph, JSON-LD schema)
- `styles.css` — all styling, light/dark theme variables, responsive rules
- `app.js` — interactivity:
  - 7-language switcher (EN, DE, RU, FR, ES, IT, NL)
  - light/dark theme toggle
  - hero background-video crossfade (8 clips, with poster fallback)
  - scroll-reveal animations
  - Hair Profile "early access" waitlist modal
- `assets/` — logo, favicon, OG image, 12 contact-sheet frames, 8 hero videos, app preview
- `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` — SEO / crawler files

## Run locally

Any static server works, e.g.:

```bash
python3 -m http.server 8099
# then open http://localhost:8099/
```

## Deploy

Upload the entire folder's contents to the web root (`public_html/` on Hostinger).
No configuration required.

## Note on the waitlist form

The Hair Profile waitlist form is currently **front-end only** — on submit it shows the
success state but does not yet send the data anywhere (this mirrors the design prototype).
To capture real sign-ups, wire the form's submit to an email service or form endpoint
(e.g. a Formspree/Hostinger mail handler) in `app.js` → `submitWaitlist()`.

Booking remains via Instagram DM (@groomz.men), per the signed landing-page scope.
