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

`netlify.toml` already points build to `npm run build`, publish to `dist`, and functions to `netlify/functions`. HTML path redirects (`/work.html` → `/work`) are included.
