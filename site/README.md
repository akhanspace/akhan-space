# akhan.space (Astro rebuild)

Pixel-faithful rebuild of the Muse portfolio. Muse HTML in the parent folder is the visual reference.

## Develop

```bash
cd site
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Contact form (Netlify + Resend)

Handler: `netlify/functions/contact.cjs`

Set env vars (see `.env.example` / `DEPLOY.md`):

- `RESEND_API_KEY` — from [resend.com](https://resend.com)
- `CONTACT_TO=asad@akhan.space`
- `CONTACT_FROM` — verified sender on Resend

Deploy the `site/` directory to Netlify (`netlify.toml` included). See `DEPLOY.md`.

## Media

`public/assets` and `public/images` are junctions to the parent Muse `assets/` and `images/` folders.
