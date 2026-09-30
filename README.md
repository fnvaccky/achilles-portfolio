# Achilles Asuncion — Portfolio

A responsive personal portfolio for Achilles Asuncion (fnvaccky), with an interactive Three.js project gallery, a short animated introduction, selected project stories, a motion playground, a playful terminal, and a public résumé download.

## Run locally

Install Node.js 22.12 or newer, then open a terminal in this folder:

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. The site needs a local server; opening index.html directly will not run the app.

## Build

```sh
npm run build
npm run preview
```

The build runs TypeScript validation, then creates the production site in `dist/`.

## Deploy to Vercel

Import this GitHub repository into Vercel. Choose the **Vite** framework preset, build command `npm run build`, and output directory `dist`. No environment variables are required. Connect the `main` branch for production deployments.

## Update content

- `main.tsx`: biography, projects, contact details, navigation, and playground.
- `Gallery.tsx`: WebGL gallery and drag interaction.
- `style.css`: colors, typography, animation, and responsive layout.
- `orbit.png` and `jmac.png`: screenshots of the featured project websites.
- `portrait.jpg`: portrait supplied in the owner's résumé.
- `Achilles-Asuncion-Resume.pdf`: public résumé without home address, birthdate, age, or phone.
- `index.html`: title, description, social metadata, and favicon.

Fonts are bundled and self-hosted through Fontsource. Icons use Lucide. Gallery images have an HTML fallback when WebGL is unavailable. Native reduced-motion preferences are respected. Contact links open an email application; no backend or email delivery service is configured.

The ORBIT site is displayed as a creative concept project; its fictional studio commissions are not personal career claims.

## Asset sources

Project screenshots were captured from https://achilles-orbit.vercel.app and https://jmac-enterprise.vercel.app, both supplied by Achilles. Portrait extracted from the supplied CV. All portfolio copy is based on the owner's information and observed project interfaces. See `ASSETS.md` for details.
