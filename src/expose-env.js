// src/expose-env.js
// Haal de key uit .env via Vite en zet 'm op window voor public scripts
window.__GMAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

// (optioneel) alleen in dev laten zien dat de key er is:
if (import.meta.env.DEV) {
  console.log('GMAPS KEY OK:', String(window.__GMAPS_API_KEY).slice(0, 6))
}
