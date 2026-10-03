# Deploy (Netlify)

From `site/`:

```bash
npm install
npm run build
npx netlify login
npx netlify deploy --prod
```

Set site environment variables in Netlify UI:

- `RESEND_API_KEY` — required for contact form
- `CONTACT_TO=asad@akhan.space`
- `CONTACT_FROM` — a verified Resend sender (e.g. `Akhan Space <onboarding@resend.dev>` until your domain is verified)

Root `netlify.toml` sets `base = "site"`, builds with `npm run build`, publishes `dist`, and wires `netlify/functions`. HTML path redirects (`/work.html` → `/work`) are included.

In the Netlify UI, leave **Base directory** empty (the toml handles it). If you previously set Base directory to `site`, clear it or keep it — either way should work after the root toml is present.
