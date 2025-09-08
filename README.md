# 🚖 Taxi 951 — React + Vite (hybride)

![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5%2B-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Google Maps JS API](https://img.shields.io/badge/Google%20Maps-JS%20API-4285F4?logo=googlemaps&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-configured-4B32C3?logo=eslint&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)
![Status](https://img.shields.io/badge/Status-Hybrid%20%28React%20%2B%20static%29-FF8800)
![License](https://img.shields.io/badge/License-Private-lightgrey)

Moderne, snelle site voor Taxi 951:

- Home draait op React + Vite (calculator, galerij + lightbox, smooth scroll).
- Reserveren is een statische pagina met nette validatie.
- Google Maps wordt alleen geladen wanneer nodig (lazy) → minder data/kosten.

## ✨ Belangrijkste features

- Ritprijs-calculator
  - Automatische berekening via Google Maps (afstand & tijd).
  - Handmatige invoer van km/minuten als fallback.
  - Nachtmodus: geeft melding en schakelt berekenen uit.

- Google Maps (zuinig)
  - Lazy load: script pas laden als kaart/adres-check echt nodig is.
  - Adres-validatie (Geocoder), route tekenen (Directions).
  - Optioneel: `<link rel="preconnect" href="https://maps.googleapis.com" crossorigin>` voor snellere eerste handshake (géén API-kosten).

- Hybride navigatie
  - Home (React): hamburger-menu via React-state; klik op “Home” of “Taxi 951” = spring naar boven (geen reload).
  - Reserveren (statisch): hamburger + anchors via vanilla JS; klik op “Home/Brand” → navigeert zoals verwacht.

- Fotogalerij + Lightbox
  - Toegankelijk (ESC/→/←), WebP + PNG fallback, nette UI.

- Performance & UX
  - `history.scrollRestoration = 'manual'` → altijd bovenaan na reload.
  - Kleine schermen compacter (typografie/knoppen/hero/footer).
  - Scroll-to-top knop.

- Toegankelijkheid
  - ARIA, duidelijke focus states, foutmeldingen onder velden (live region).

## 🛠 Tech stack

- Frontend: React (Vite) + vanilla JS (statische pagina)
- Styling: eigen CSS, responsive, SVG/WebP
- Maps: Google Maps JavaScript API (Places + Directions + Geocoder)

## 📦 Projectstructuur (aanbevolen)

Tip: Zet je bestaande `/assets` en `/pages` in `/public`. Alles in `/public` wordt 1-op-1 gekopieerd naar `/dist` bij `npm run build`.

---

```
/
├─ public/
│ ├─ assets/
│ │ ├─ css/ # style.css, resetstyle.css
│ │ ├─ js/ # main.js (lazy Maps, nav voor statische pagina’s)
│ │ ├─ img/ # Day-Image-_.webp/.png, Night-Image-_.webp/.png
│ │ └─ icons/ # favicon.ico, apple-touch-icon.png
│ └─ pages/
│ └─ reserveren.html
├─ src/
│ ├─ App.jsx # Home-pagina (React)
│ ├─ main.jsx # mount React
│ └─ expose-env.js # zet VITE_GOOGLE_MAPS_API_KEY op window.\_\_GMAPS_API_KEY
├─ index.html # Home (laadt React + public assets)
├─ package.json
└─ README.md
```

---

Gebruik je nu `/assets` en `/pages` nog in de projectroot? Verplaats die mappen 1-op-1 naar `/public` en laat de paden in je HTML zoals ze zijn (`/assets/...`, `/pages/...`). Klaar.

## ▶️ Ontwikkelen

npm install
npm run dev

# open http://localhost:5173

## 🏗️ Build & preview

npm run build
npm run preview

## 🔐 Omgevingsvariabelen (Google Maps)

1. Maak `.env.local` in de project-root:

VITE_GOOGLE_MAPS_API_KEY=JOUW_API_KEY_HIER

2. `src/expose-env.js` zet die key op `window.__GMAPS_API_KEY`.
3. Kosten/Data: het Maps-script wordt lazy geladen (alleen wanneer je kaart/adressen echt gebruikt).
   Optioneel: `<link rel="preconnect" href="https://maps.googleapis.com" crossorigin>` versnelt netwerk-handshake maar doet geen API-calls en kost niets.

## 🌐 Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`

Zorg dat je `/public` map bestaat met `/assets` en `/pages`. Netlify neemt dat automatisch mee.

## 👤 Auteur

- Naam: Yunus Yildiz
- Site: https://taxi951.netlify.app

## 📜 Licentie

Gebruik in overleg; bedoeld voor portfolio en bedrijfswebsite Taxi 951.

## Changelog (kort)

- Migratie naar React + Vite (Home).
- Statische reserveren-pagina behouden (sneller, simpel).
- Lazy Google Maps loader, adresvalidatie verbeterd.
- Mobiele UI compacter + diverse accessibility & UX fixes.

---

## 🗺️ Roadmap — Later (Optie B: React MPA)

Doel: alle pagina’s React maken (Multi-Page App met Vite), zelfde UX/SEO-snelheid.

**Fase 0 — Nieuwsbrief (Brevo Double Opt-In)**

- [ ] **Statische pagina’s**
  - `/public/pages/nieuwsbrief-bevestigen.html` → “check je mail om te bevestigen”
  - `/public/pages/nieuwsbrief-bedankt.html` → “inschrijving bevestigd”

- [ ] **Serverless endpoint (Netlify)**
  - `/.netlify/functions/subscribe` die Brevo’s DOI-endpoint aanroept (server-side).
  - `netlify.toml` → `functions = "netlify/functions"`

- [ ] **Environment variables (Netlify)**
  - `BREVO_API_KEY`
  - `BREVO_LIST_ID`
  - `BREVO_DOI_TEMPLATE_ID`
  - `BREVO_REDIRECT_BASE` (bv. `https://taxi951.netlify.app`)

- [ ] **Frontend koppeling**
  - In `App.jsx`: newsletter submit → `POST /.netlify/functions/subscribe`
  - Bij succes: redirect naar `/pages/nieuwsbrief-bevestigen.html`
  - In Brevo: DOI-redirect instellen naar  
    `${BREVO_REDIRECT_BASE}/pages/nieuwsbrief-bedankt.html`

- [ ] **Quality**
  - Honeypot veld of eenvoudige rate-limit in function
  - Netjes foutmelding tonen bij netwerk/API-fouten
  - (Optioneel) `noindex` meta op de twee pagina’s

**Definition of Done (Nieuwsbrief)**

- Aanmelding via formulier stuurt DOI-mail; na klik landt user op _bedankt_.
- Geen API-sleutel in client; alles via serverless function.
- Env vars + Netlify build werken zonder codewijzigingen.

**Fase 1 — Structuur & shared UI**

- [ ] `src/components/`: `Nav.jsx`, `Footer.jsx`, `ScrollTopButton.jsx`, `Lightbox.jsx`, `Calculator.jsx`.
- [ ] Maps util: `src/lib/maps.js` (lazy loader + helpers nu in main.js).
- [ ] CSS opschonen en component-classes hergebruiken.

**Fase 2 — Reserveren naar React**

- [ ] `src/pages/Reserveren.jsx` (formulier + validatie omzetten).
- [ ] Geocoder check + tooltips in componentlogica.
- [ ] Nieuwe entry point: `reserveren.html` → React build (Vite MPA).
- [ ] Oude `public/pages/reserveren.html` uitfaseren zodra de nieuwe werkt.

**Fase 3 — Extra pagina’s**

- [ ] `Privacy.jsx`, `Voorwaarden.jsx` (losse React entries of dynamisch).
- [ ] Navigatie-links updaten.

**Fase 4 — Performance**

- [ ] Code-splitting: lightbox en Maps via `import()` (lazy).
- [ ] Preload/preconnect fine-tunen.
- [ ] Lighthouse ≥ 95 mobiel/desktop.

**Fase 5 — Kwaliteit**

- [ ] TypeScript opt-in (bijv. `lib/maps.ts` + 2–3 components).
- [ ] Tests: Vitest + Testing Library (smoke test App, 1 interactietest Calculator).
- [ ] GitHub Actions: lint + test + build.

**Definition of Done**

- [ ] Alle pagina’s React (MPA), geen vanilla nav meer nodig in `public/assets/js/main.js`.
- [ ] Alle Maps features lazy geladen, geen regressies in UX/a11y.
- [ ] Netlify build blijft `npm run build` → `dist/`.
- [ ] README bijgewerkt met nieuwe structuur.
