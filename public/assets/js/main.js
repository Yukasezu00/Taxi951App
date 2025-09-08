/* global google */

const GMAPS_API_KEY = window.__GMAPS_API_KEY || '';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================ */
/* Helpers die we op meerdere plekken nodig hebben */
/* ================================ */
function isOnHome() {
  const p = location.pathname.replace(/\/+$/, '');
  return p === '' || p === '/' || /\/index\.html$/i.test(p);
}
function isHomeHref(href) {
  if (!href) return false;
  try {
    const u = new URL(href, location.href);
    return u.pathname === '/' || /\/index\.html$/i.test(u.pathname);
  } catch {
    return false;
  }
}
function forceHomeUrl() {
  return '/index.html';
}

/* “Instant” naar boven zonder smooth scroll */
function jumpToTopInstant() {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  root.style.scrollBehavior = prev || '';
}

/* Alleen bij echte reloads altijd helemaal naar boven */
function setupTopOnReload() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  let navType = '';
  try {
    const navEntry = performance.getEntriesByType('navigation')[0];
    navType = navEntry && navEntry.type;
  } catch {
    if (performance && performance.navigation && performance.navigation.type === 1) {
      navType = 'reload';
    }
  }
  const onLoadOrShow = () => jumpToTopInstant();

  if (navType === 'reload') {
    window.addEventListener('load', onLoadOrShow, { once: true });
    window.addEventListener('pageshow', onLoadOrShow, { once: true });
  } else if (isOnHome()) {
    window.addEventListener('load', onLoadOrShow, { once: true });
  }
}

/* ================================ */
/* NAV: hamburger + Home/brand gedrag */
/* ================================ */
function setupNavMenu() {
  // 🔹 Home (React): nav zit in #root -> dan niets doen, React regelt events
  const root = document.getElementById('root');
  const nav = document.querySelector('.nav-main');
  if (root && nav && root.contains(nav)) return;

  // 🔹 Statische pagina's (bv. reserveren.html)
  const hamburger = document.querySelector('.nav-main .hamburger');
  const menu = document.getElementById('hoofdmenu');
  if (!hamburger || !menu) return;

  let isOpen = false;

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeyDown);
  };

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    menu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    setTimeout(() => document.addEventListener('click', onDocClick), 0);
    document.addEventListener('keydown', onKeyDown);
  };

  const toggleMenu = () => (isOpen ? closeMenu() : openMenu());

  const onDocClick = (e) => {
    if (menu.contains(e.target) || hamburger.contains(e.target)) return;
    closeMenu();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeMenu();
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === hamburger) {
      e.preventDefault();
      toggleMenu();
    }
  };

  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Links in het menu -> menu sluiten
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) closeMenu();
  });

  // Breder scherm -> menu dicht
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  // Home/brand klik-gedrag (voor statische pagina's)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href') || '';
    const clickedBrand = a.classList.contains('brand');
    const clickedHome = isHomeHref(href);

    if (clickedBrand || clickedHome) {
      if (isOnHome()) {
        e.preventDefault();
        closeMenu();
        window.location.reload();
      } else if (href === '' || href === '#' || href.startsWith('#')) {
        e.preventDefault();
        closeMenu();
        window.location.assign(forceHomeUrl());
      }
    }
  });
}

/* ================================ */
/* Tijdshelpers */
/* ================================ */
function normalizeTijdstipValue(raw) {
  const v = String(raw || '').toLowerCase();
  if (v.includes('nacht') || v.includes('20:') || v.includes('na 20')) return 'nacht';
  return 'dag';
}
function getLocalHourByTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat('nl-NL', {
      timeZone: tz,
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    return parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  } catch {
    return new Date().getHours();
  }
}
function setSelectTo(mode) {
  const sel = document.getElementById('tijdstip');
  if (!sel) return;
  const target = mode === 'nacht' ? 'nacht' : 'dag';
  let matched = false;
  [...sel.options].forEach((opt, i) => {
    const hay = `${opt.value || ''} ${opt.textContent || ''}`.toLowerCase();
    if (hay.includes(target) && !matched) {
      sel.selectedIndex = i;
      matched = true;
    }
  });
  if (matched) updateNachtState();
}
function autoSelectTijdstipByClock() {
  const sel = document.getElementById('tijdstip');
  if (!sel) return;
  if (sel.dataset.userChanged === '1') return;
  const hour = getLocalHourByTimezone();
  const shouldBe = hour >= 20 || hour < 6 ? 'nacht' : 'dag';
  setSelectTo(shouldBe);
}

/* ================================ */
/* Google Maps loader */
/* ================================ */
function loadGoogleMapsScript() {
  if (window.google && google.maps && google.maps.places) {
    try {
      initAutocomplete();
    } catch (e) {
      console.warn(e);
    }
    return;
  }
  if (document.getElementById('gmap-loader')) return;

  const s = document.createElement('script');
  s.id = 'gmap-loader';
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places&callback=__mapsReady`;
  s.async = true;
  s.defer = true;

  window.__mapsReady = () => {
    try {
      initAutocomplete();
    } catch (e) {
      console.warn(e);
    }
  };
  document.head.appendChild(s);
}
function ensureGoogleReady() {
  return new Promise((resolve) => {
    if (window.google && google.maps) return resolve();
    loadGoogleMapsScript();
    const deadline = Date.now() + 12000;
    const t = setInterval(() => {
      if (window.google && google.maps) {
        clearInterval(t);
        resolve();
      } else if (Date.now() > deadline) {
        clearInterval(t);
        resolve();
      }
    }, 100);
  });
}

/* ================================ */
/* Directions + prijs */
/* ================================ */
async function haalAfstandEnTijdOp(ophaaladres, bestemmingsadres) {
  if (window.google && google.maps) {
    return new Promise((resolve) => {
      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: ophaaladres,
          destination: bestemmingsadres,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
            const leg = result.routes[0].legs[0];
            resolve({ afstandKm: leg.distance.value / 1000, duurMinuten: leg.duration.value / 60 });
          } else {
            console.error('DirectionsService status:', status, result);
            resolve(null);
          }
        },
      );
    });
  }
  return null;
}
function berekenPrijs(afstand, minuten) {
  const instaptarief = 3.5;
  const prijsPerKm = 2.0;
  const prijsPerMinuut = 0.42;
  return instaptarief + afstand * prijsPerKm + minuten * prijsPerMinuut;
}

/* ================================ */
/* Route tekenen */
/* ================================ */
function toonRouteOpKaart(ophaaladres, bestemming) {
  if (!window.google || !google.maps) {
    console.warn('Maps niet geladen');
    return;
  }
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  if (!mapEl.style.height) mapEl.style.height = '360px';

  const map = new google.maps.Map(mapEl, { zoom: 13, center: { lat: 52.379189, lng: 4.899431 } });
  directionsRenderer.setMap(map);
  directionsService.route(
    { origin: ophaaladres, destination: bestemming, travelMode: google.maps.TravelMode.DRIVING },
    (result, status) => {
      if (status === 'OK') directionsRenderer.setDirections(result);
      else console.error('❌', status);
    },
  );
}

/* ================================ */
/* Calculator UI */
/* ================================ */
function updateNachtState() {
  const tijdstipEl = document.getElementById('tijdstip');
  const nachtMelding = document.getElementById('nachtMelding');
  const prijsOutput = document.getElementById('prijsOutput');
  const samenvattingBox = document.getElementById('ritSamenvatting');
  const berekenBtn = document.querySelector(
    '.calculator button, .calculator .cta-button, #berekenBtn',
  );
  if (!tijdstipEl) return;

  const raw = tijdstipEl.value || tijdstipEl.options[tijdstipEl.selectedIndex]?.textContent;
  const isNacht = normalizeTijdstipValue(raw) === 'nacht';

  if (nachtMelding) nachtMelding.classList.toggle('hidden', !isNacht);
  if (berekenBtn) berekenBtn.disabled = isNacht;

  if (isNacht) {
    if (prijsOutput) {
      prijsOutput.textContent = '';
      prijsOutput.style.color = '#222';
    }
    if (samenvattingBox) {
      samenvattingBox.classList.add('hidden');
      samenvattingBox.innerHTML = '';
    }
  }
}

async function verwerkAdressen() {
  const tijdstipEl = document.getElementById('tijdstip');
  const tijdstip = normalizeTijdstipValue(tijdstipEl?.value || 'dag');
  const ophaal = document.getElementById('ophaal')?.value.trim();
  const bestemming = document.getElementById('bestemming')?.value.trim();
  const prijsOutput = document.getElementById('prijsOutput');
  const samenvattingBox = document.getElementById('ritSamenvatting');
  const berekenBtn = document.querySelector(
    '.calculator button, .calculator .cta-button, #berekenBtn',
  );
  const afstandInputRaw = document.getElementById('afstand')?.value;
  const minutenInputRaw = document.getElementById('minuten')?.value;
  const toNum = (v) => parseFloat(String(v || '').replace(',', '.'));

  const setLoading = (state) => {
    if (!berekenBtn) return;
    if (state) {
      berekenBtn.disabled = true;
      berekenBtn.dataset.origText = berekenBtn.textContent;
      berekenBtn.textContent = 'Bezig…';
    } else {
      berekenBtn.disabled = false;
      if (berekenBtn.dataset.origText) berekenBtn.textContent = berekenBtn.dataset.origText;
    }
  };
  const clearSummary = () => {
    samenvattingBox?.classList.add('hidden');
    if (samenvattingBox) samenvattingBox.innerHTML = '';
  };

  if (tijdstip === 'nacht') {
    if (prijsOutput) {
      prijsOutput.innerHTML =
        '❌ Berekening is niet mogelijk tijdens nachtritten. Neem contact op met de chauffeur.';
      prijsOutput.style.color = 'red';
    }
    clearSummary();
    return;
  }

  if (!ophaal && !bestemming && afstandInputRaw && minutenInputRaw) {
    const afstand = toNum(afstandInputRaw),
      minuten = toNum(minutenInputRaw);
    if (
      isNaN(afstand) ||
      isNaN(minuten) ||
      afstand < 0 ||
      minuten < 0 ||
      !isFinite(afstand) ||
      !isFinite(minuten)
    ) {
      if (prijsOutput) {
        prijsOutput.innerHTML = '❌ Ongeldige afstand of tijd.';
        prijsOutput.style.color = 'red';
      }
      clearSummary();
      return;
    }
    const prijs = berekenPrijs(afstand, minuten);
    if (prijsOutput) {
      prijsOutput.innerHTML = `Geschatte prijs: €${prijs.toFixed(2)}`;
      prijsOutput.style.color = '#222';
    }
    clearSummary();
    return;
  }

  if (!ophaal && !bestemming && !afstandInputRaw && !minutenInputRaw) {
    if (prijsOutput) prijsOutput.innerHTML = '';
    clearSummary();
    return;
  }

  if (ophaal && bestemming) {
    if (prijsOutput) {
      prijsOutput.innerHTML = '⏳ Route en prijs worden berekend...';
      prijsOutput.style.color = '#444';
    }
    clearSummary();
    setLoading(true);
    await ensureGoogleReady();
    const data = await haalAfstandEnTijdOp(ophaal, bestemming);
    setLoading(false);

    if (!data) {
      if (prijsOutput) {
        prijsOutput.innerHTML = '❌ Ongeldig ophaal- of bestemmingsadres (of Maps kon niet laden).';
        prijsOutput.style.color = 'red';
      }
      return;
    }
    if (data.afstandKm < 0 || data.duurMinuten < 0) {
      if (prijsOutput) {
        prijsOutput.innerHTML = '❌ Afstand of tijd mag niet negatief zijn.';
        prijsOutput.style.color = 'red';
      }
      return;
    }

    const prijs = berekenPrijs(data.afstandKm, data.duurMinuten);
    if (prijsOutput) prijsOutput.innerHTML = `Geschatte prijs: €${prijs.toFixed(2)}`;
    if (samenvattingBox) {
      samenvattingBox.innerHTML = `
        <div class="samenvatting-kaart">
          <h4>🧾 Ritoverzicht</h4>
          <ul>
            <li><strong>📍 Ophaaladres:</strong> ${escapeHtml(ophaal)}</li>
            <li><strong>📍 Bestemming:</strong> ${escapeHtml(bestemming)}</li>
            <li><strong>Afstand:</strong> ${data.afstandKm.toFixed(1)} km</li>
            <li><strong>Rittijd:</strong> ${data.duurMinuten.toFixed(0)} minuten</li>
            <li><strong>Tijdstip:</strong> Dag</li>
          </ul>
        </div>`;
      samenvattingBox.classList.remove('hidden');
    }
    toonRouteOpKaart(ophaal, bestemming);
  }
}

/* ================================ */
/* Koppelingen & overige UI */
/* ================================ */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#berekenBtn');
  if (btn) {
    e.preventDefault();
    verwerkAdressen();
  }
});
document.addEventListener('change', (e) => {
  const sel = e.target.closest('#tijdstip');
  if (sel) {
    sel.dataset.userChanged = '1';
    updateNachtState();
  }
});
document.addEventListener('submit', (e) => {
  const form = e.target.closest('#calcForm');
  if (form) {
    e.preventDefault();
    verwerkAdressen();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupTopOnReload();
  setupNavMenu();

  // 🔹 LAZY Maps: NIET hier pre-loaden
  //    Laad pas wanneer de gebruiker echt met adressen werkt.
  ['ophaal', 'bestemming'].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener(
      'focus',
      () => {
        loadGoogleMapsScript();
      },
      { once: true },
    );
  });

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      const halfway = window.innerHeight / 2;
      scrollTopBtn.classList.toggle('show', window.scrollY > halfway);
    });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  updateNachtState();
  autoSelectTijdstipByClock();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) autoSelectTijdstipByClock();
});

/* ================================ */
/* Back-to-top: mobiel altijd laag */
/* ================================ */
function updateScrollBtnOffset() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;
  const small = window.matchMedia('(max-width: 480px)').matches;
  if (small) {
    scrollBtn.style.bottom = '20px';
    return;
  }
  const footer = document.querySelector('footer');
  const footerHeight = footer ? footer.offsetHeight : 0;
  const extraMargin = 40;
  scrollBtn.style.bottom = `${footerHeight + extraMargin}px`;
}
window.addEventListener('load', updateScrollBtnOffset);
window.addEventListener('resize', updateScrollBtnOffset);
window.addEventListener('scroll', updateScrollBtnOffset);

/* ================================ */
/* Lazy-load Maps bij scroll naar #map */
/* ================================ */
window.addEventListener('DOMContentLoaded', () => {
  const kaart = document.getElementById('map');
  if (!kaart) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (entries[0].isIntersecting) {
        loadGoogleMapsScript();
        obs.disconnect();
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(kaart);
});

/* ================================ */
/* Autocomplete: desktop = Google widget; mobiel = fallback */
/* ================================ */
function attachGoogleAutocomplete(input) {
  try {
    input.setAttribute('autocomplete', 'off');
    const ac = new google.maps.places.Autocomplete(input, {
      fields: ['place_id', 'formatted_address', 'geometry'],
      types: ['address'],
      componentRestrictions: { country: ['nl'] },
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place && place.formatted_address) {
        input.value = place.formatted_address;
        input.dataset.validPlace = '1';
        input.dataset.placeId = place.place_id || '';
        input.dataset.formatted = place.formatted_address || input.value;
      } else {
        input.dataset.validPlace = '';
      }
    });
    input.addEventListener('input', () => {
      input.dataset.validPlace = '';
    });
    return true;
  } catch {
    return false;
  }
}

/* Body-level floating fallback (not clipped by containers) */
function attachServiceFallbackFloating(input) {
  if (!google.maps.places || !google.maps.places.AutocompleteService) return false;

  const svc = new google.maps.places.AutocompleteService();
  let panel = document.querySelector('.addr-suggest[data-for="' + input.id + '"]');
  if (!panel) {
    panel = document.createElement('ul');
    panel.className = 'addr-suggest';
    panel.dataset.for = input.id;
    panel.hidden = true;
    document.body.appendChild(panel);
  }

  const placePanel = () => {
    const r = input.getBoundingClientRect();
    panel.style.left = `${Math.round(r.left)}px`;
    panel.style.top = `${Math.round(r.bottom + 4)}px`;
    panel.style.width = `${Math.round(r.width)}px`;
  };

  const render = (preds) => {
    if (!preds || !preds.length) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = preds
      .slice(0, 8)
      .map((p) => `<li data-value="${escapeHtml(p.description)}">${escapeHtml(p.description)}</li>`)
      .join('');
    placePanel();
    panel.hidden = false;
  };

  let lastQ = '';
  const query = () => {
    const q = input.value.trim();
    if (q.length < 3) return render([]);
    lastQ = q;
    svc.getPlacePredictions(
      { input: q, types: ['address'], componentRestrictions: { country: 'nl' } },
      (preds, status) => {
        if (q !== lastQ) return;
        if (status !== google.maps.places.PlacesServiceStatus.OK) return render([]);
        render(preds || []);
      },
    );
  };

  input.addEventListener('focus', () => {
    placePanel();
    query();
  });
  input.addEventListener('input', () => {
    input.dataset.validPlace = '';
    query();
  });
  window.addEventListener('scroll', placePanel, { passive: true });
  window.addEventListener('resize', placePanel);

  document.addEventListener('click', (e) => {
    if (e.target === input || panel.contains(e.target)) return;
    panel.hidden = true;
  });
  panel.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    input.value = li.dataset.value;
    input.dataset.validPlace = '';
    panel.hidden = true;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  return true;
}

function initAutocomplete() {
  const ophaalInput = document.getElementById('ophaal');
  const bestInput = document.getElementById('bestemming');
  if (!ophaalInput && !bestInput) return;
  if (!window.google || !google.maps || !google.maps.places) return;

  const isPhone = window.matchMedia('(max-width: 480px)').matches;

  // Phones: force fallback only
  if (isPhone) {
    if (ophaalInput) attachServiceFallbackFloating(ophaalInput);
    if (bestInput) attachServiceFallbackFloating(bestInput);
    return;
  }

  // Desktop/tablet: try widget, fallback if not available
  if (ophaalInput) {
    const ok = attachGoogleAutocomplete(ophaalInput);
    if (!ok) attachServiceFallbackFloating(ophaalInput);
  }
  if (bestInput) {
    const ok = attachGoogleAutocomplete(bestInput);
    if (!ok) attachServiceFallbackFloating(bestInput);
  }
}
