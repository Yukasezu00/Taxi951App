import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const GALLERY = [
  '/assets/img/Day-Image-1',
  '/assets/img/Day-Image-2',
  '/assets/img/Day-Image-3',
  '/assets/img/Day-Image-4',
  '/assets/img/Night-Image-1',
  '/assets/img/Night-Image-2',
  '/assets/img/Night-Image-3',
];

function Lightbox({ open, index, onClose, onPrev, onNext }) {
  if (!open) return null;

  const dialog = (
    <div id="lightboxOverlay" className="lightbox-overlay active" aria-hidden="false">
      <button
        type="button"
        className="lightbox-backdrop"
        aria-label="Sluit lightbox (klik buiten de foto)"
        onClick={onClose}
      />
      <div
        id="lightboxDialog"
        className="lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Vergrote foto"
        tabIndex={-1}
      >
        <button
          id="lightboxClose"
          className="lightbox-close"
          aria-label="Sluiten"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <button
          id="lightboxPrev"
          className="lightbox-nav"
          aria-label="Vorige"
          type="button"
          onClick={onPrev}
        >
          ❮
        </button>

        <img
          id="lightboxImage"
          src={`${GALLERY[index]}.webp`}
          alt={`Vergrote foto Taxi 951 – ${index + 1}`}
        />

        <button
          id="lightboxNext"
          className="lightbox-nav"
          aria-label="Volgende"
          type="button"
          onClick={onNext}
        >
          ❯
        </button>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

export default function App() {
  // hamburger state
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinksRef = useRef(null);

  // scroll-to-top knop
  const [showTop, setShowTop] = useState(false);

  // nieuwsbrief feedback
  const [nbMsg, setNbMsg] = useState('');
  const [nbOk, setNbOk] = useState(false);

  // gallery + lightbox state
  const [gIndex, setGIndex] = useState(0);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  // ===== NAV: buiten klik sluit menu & Escape
  useEffect(() => {
    const onDocClick = (e) => {
      const navLinks = navLinksRef.current;
      const hamburger = document.querySelector('.hamburger');
      if (!navLinks || !hamburger) return;
      const inside = navLinks.contains(e.target) || hamburger.contains(e.target);
      if (!inside) setMenuOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setMenuOpen(false);

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // scroll-to-top zichtbaar maken
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight / 2);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // bij eerste paint: fade-in
  useEffect(() => {
    const fadeEl = document.querySelector('.fade-in');
    const hero = document.querySelector('.hero-fade');
    if (fadeEl) setTimeout(() => fadeEl.classList.add('visible'), 100);
    if (hero) setTimeout(() => hero.classList.add('visible'), 200);
  }, []);

  // ===== Brand & Home → reload op home, anders naar home
  const handleHomeOrBrand = (e) => {
    // ctrl/cmd-klik of middenklik → laat nieuwe tab toe
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    setMenuOpen(false);

    const onHome = location.pathname === '/' || /\/index\.html$/i.test(location.pathname);

    if (onHome) {
      // voorkom scroll-restoration bij echte reload
      if (typeof history === 'object' && history && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      // hard naar boven
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev || '';
      // en dan herladen
      window.location.reload();
    } else {
      // vanaf andere pagina's → naar home
      location.assign('/index.html');
    }
  };

  // interne anchors smooth scroll
  const handleAnchor = (e, href) => {
    if (href && href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      setMenuOpen(false);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // nieuwsbrief submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const naam = form.naam.value.trim();
    const email = form.email.value.trim();
    const toestemming = form.toestemming.checked;

    if (!naam || !email || !toestemming) {
      setNbOk(false);
      setNbMsg('❌ Vul je naam en e-mailadres in en geef toestemming.');
      return;
    }

    setNbOk(true);
    setNbMsg('✅ Bedankt! Je aanmelding is ontvangen.');
    form.reset();
  };

  // gallery handlers
  const galleryPrev = useCallback(
    () => setGIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length),
    [],
  );
  const galleryNext = useCallback(() => setGIndex((i) => (i + 1) % GALLERY.length), []);

  // lightbox handlers
  const openLightbox = useCallback((idx) => {
    setLbIndex(idx);
    setLbOpen(true);
    document.body.classList.add('noscroll');
  }, []);

  const closeLightbox = useCallback(() => {
    setLbOpen(false);
    document.body.classList.remove('noscroll');
  }, []);

  const lbNext = useCallback(() => setLbIndex((i) => (i + 1) % GALLERY.length), []);
  const lbPrev = useCallback(
    () => setLbIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length),
    [],
  );

  // keyboard support voor lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (!lbOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lbNext();
      if (e.key === 'ArrowLeft') lbPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lbOpen, lbNext, lbPrev, closeLightbox]);

  return (
    <div className="page-wrapper fade-in">
      {/* NAV */}
      <nav className="nav-main" aria-label="Hoofdnavigatie" data-react="1">
        <div className="nav-container">
          <a href="/" className="brand" onClick={handleHomeOrBrand}>
            Taxi 951
          </a>

          <button
            className="hamburger"
            aria-label="Menu openen"
            aria-controls="hoofdmenu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="hamburger-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"></path>
            </svg>
          </button>

          <ul id="hoofdmenu" className={`nav-links ${menuOpen ? 'open' : ''}`} ref={navLinksRef}>
            <li>
              <a href="/" onClick={handleHomeOrBrand}>
                Home
              </a>
            </li>
            <li>
              <a href="#diensten" onClick={(e) => handleAnchor(e, '#diensten')}>
                Diensten
              </a>
            </li>
            <li>
              <a href="#tarieven" onClick={(e) => handleAnchor(e, '#tarieven')}>
                Tarieven
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleAnchor(e, '#contact')}>
                Contact
              </a>
            </li>
            <li>
              <a href="/pages/reserveren.html">Reserveren</a>
            </li>
            <li>
              <a href="#overons" onClick={(e) => handleAnchor(e, '#overons')}>
                Over Ons
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main id="main">
        {/* HERO */}
        <section id="home" className="hero hero-fade">
          <h1 className="hero-title">Taxi 951</h1>
          <p className="hero-subtitle">
            Altijd betrouwbaar vervoer in Amsterdam, 24/7 beschikbaar.
          </p>
          <div className="hero-buttons">
            <button
              id="boekNuBtn"
              className="btn btn-outline"
              type="button"
              onClick={() => {
                const calc = document.querySelector('.calculator');
                if (calc) calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Boek nu
            </button>
            <a href="/pages/reserveren.html" className="btn btn-outline">
              Reserveren
            </a>
          </div>
        </section>

        {/* CALCULATOR */}
        <section className="section calculator" id="calculator">
          <h2>Bereken je ritprijs</h2>
          <form id="calcForm" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <label htmlFor="ophaal">Ophaallocatie:</label>
              <input id="ophaal" placeholder="Bv. Damrak 1, Amsterdam" />
            </div>

            <div className="form-row">
              <label htmlFor="bestemming">Bestemming:</label>
              <input id="bestemming" placeholder="Bv. Schiphol" />
            </div>

            <div className="form-row">
              <label htmlFor="tijdstip">Tijdstip:</label>
              <select id="tijdstip" defaultValue="dag">
                <option value="dag">06:00-20:00(dag)</option>
                <option value="nacht">Na 20:00(nacht)</option>
              </select>
            </div>

            <div id="nachtMelding" className="nacht-melding hidden" aria-live="polite">
              ❌ Berekening is niet mogelijk tijdens nachtritten.
              <br />
              Neem contact op via{' '}
              <a href="https://wa.me/31650680749" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{' '}
              of <a href="tel:0650680749">bel de chauffeur</a>.
            </div>

            <div className="form-row">
              <label htmlFor="afstand">Afstand (km):</label>
              <input id="afstand" placeholder="bv. 10" />
            </div>

            <div className="form-row">
              <label htmlFor="minuten">Minuten:</label>
              <input id="minuten" placeholder="bv. 15" />
            </div>

            <button id="berekenBtn" type="button" className="cta-button">
              Bereken
            </button>

            <div id="prijsOutput" className="prijs-output" style={{ marginTop: 12 }}></div>
            <div id="ritSamenvatting" className="hidden" style={{ marginTop: 12 }}></div>
          </form>

          <div
            id="map"
            style={{
              width: '100%',
              height: 360,
              marginTop: 16,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          />
        </section>

        {/* TARIEVEN */}
        <section id="tarieven" className="section">
          <h2>Tarieven</h2>
          <p>
            De kosten bestaan uit een instaptarief van <span className="tarief-bedrag">€3,50</span>{' '}
            plus:
          </p>
          <div className="tarieven-lijst">
            <div className="tarief-item">
              <span className="tarief-bedrag">€2,00</span>
              <span className="tarief-omschrijving">per kilometer</span>
            </div>
            <div className="tarief-item">
              <span className="tarief-bedrag">€0,42</span>
              <span className="tarief-omschrijving">per minuut</span>
            </div>
          </div>
          <p className="nacht-melding">
            Tijdens nachtritten (na 20:00) worden de tarieven besproken met de chauffeur{' '}
            <a href="#contact" onClick={(e) => handleAnchor(e, '#contact')}>
              Neem contact met ons op
            </a>
            .
          </p>
        </section>

        {/* DIENSTEN */}
        <section id="diensten" className="section">
          <h2>Diensten</h2>
          <ul className="diensten-lijst">
            <li>
              <span className="icoon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 13h2v-2H3v2zm0-4h2V7H3v2zm0 8h2v-2H3v2zm4 0h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V7H7v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2zm4 8h6V3h-6v16z" />
                </svg>
              </span>
              Stadsritten Amsterdam
            </li>
            <li>
              <span className="icoon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5v3.5l-2 1v1l3-.5 3 .5v-1l-2-1v-3.5l8 2.5z" />
                </svg>
              </span>
              Luchthavenvervoer
            </li>
            <li>
              <span className="icoon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </span>
              Groepsvervoer
            </li>
            <li>
              <span className="icoon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M20.742 13.045A8.088 8.088 0 0 1 12 20a8 8 0 0 1-7.984-8.938A8.001 8.001 0 0 0 12 4a8.088 8.088 0 0 1 8.742 9.045z" />
                </svg>
              </span>
              Nachttaxi
            </li>
            <li>
              <span className="icoon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
              </span>
              Online reserveren
            </li>
          </ul>
        </section>

        {/* OVER ONS */}
        <section id="overons" className="section">
          <h2>Over Taxi 951</h2>
          <p>
            Taxi 951 is jouw vertrouwde vervoerspartner in Amsterdam. Wij staan bekend om onze
            stiptheid, nette voertuigen en chauffeurs met uitstekende kennis van de stad. Of je nu
            snel van A naar B wilt, ’s nachts thuiskomt of een luchthavenrit nodig hebt – wij zorgen
            voor een comfortabele en veilige reis, 24/7.
          </p>
        </section>

        {/* MANUELE GALERIJ */}
        <div className="manual-gallery" aria-label="Fotogalerij Taxi 951">
          <button
            className="nav-btn left"
            id="prevBtn"
            aria-label="Vorige foto"
            onClick={galleryPrev}
            type="button"
          >
            ❮
          </button>

          <button
            type="button"
            className="lightbox-img-btn"
            onClick={() => openLightbox(gIndex)}
            aria-label={`Open foto ${gIndex + 1} in lightbox`}
          >
            <picture>
              <source srcSet={`${GALLERY[gIndex]}.webp`} type="image/webp" />
              <source srcSet={`${GALLERY[gIndex]}.png`} type="image/png" />
              <img
                id="galleryImage"
                src={`${GALLERY[gIndex]}.png`}
                loading="lazy"
                alt={`Taxi 951 – foto ${gIndex + 1}`}
              />
            </picture>
          </button>

          <button
            className="nav-btn right"
            id="nextBtn"
            aria-label="Volgende foto"
            onClick={galleryNext}
            type="button"
          >
            ❯
          </button>
        </div>

        <Lightbox
          open={lbOpen}
          index={lbIndex}
          onClose={closeLightbox}
          onPrev={lbPrev}
          onNext={lbNext}
        />

        {/* CONTACT */}
        <section id="contact" className="section">
          <h2>Contact</h2>
          <div className="contact-item">
            <span className="contact-icon" aria-hidden="true">
              📞
            </span>
            <a href="tel:0650680749">Bel ons: 0650680749</a>
          </div>
          <div className="contact-item">
            <span className="contact-icon" aria-hidden="true">
              💬
            </span>
            <a href="https://wa.me/31650680749" target="_blank" rel="noopener noreferrer">
              WhatsApp ons
            </a>
          </div>
          <div className="contact-item">
            <span className="contact-icon" aria-hidden="true">
              ✉️
            </span>
            <a href="mailto:info@taxi951.nl">info@taxi951.nl</a>
          </div>
        </section>

        {/* NIEUWSBRIEF */}
        <section id="nieuwsbrief" className="section">
          <h2>Schrijf je in voor onze nieuwsbrief</h2>
          <div className="nieuwsbrief-form">
            <form
              id="nieuwsbriefForm"
              className="form-nieuwsbrief"
              method="POST"
              action="#"
              onSubmit={handleNewsletterSubmit}
            >
              <div className="field">
                <label htmlFor="naam">
                  <strong>Naam *</strong>
                </label>
                <input type="text" id="naam" name="naam" required placeholder="Bijv. Jan Jansen" />
              </div>

              <div className="field">
                <label htmlFor="email">
                  <strong>Emailadres *</strong>
                </label>
                <input type="email" id="email" name="email" required placeholder="jouw@email.nl" />
              </div>

              <div className="toestemming">
                <input type="checkbox" id="toestemming" name="toestemming" required />
                <label htmlFor="toestemming">
                  Ja, ik geef toestemming om e-mails te ontvangen van Taxi 951.
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Aanmelden
              </button>
              <p
                id="formulierFeedback"
                className={`formulier-feedback ${nbOk ? 'ok' : 'err'}`}
                role="status"
                aria-live="polite"
              >
                {nbMsg}
              </p>
            </form>
          </div>
        </section>

        {/* SCROLL TO TOP */}
        <button
          id="scrollTopBtn"
          title="Terug naar boven"
          aria-label="Terug naar boven"
          type="button"
          className={showTop ? 'show' : ''}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2L5 9h4v7h6V9h4z" />
          </svg>
        </button>

        {/* FOOTER */}
        <footer>
          <div className="footer-container">
            <p>© 2025 Taxi 951. Alle rechten voorbehouden.</p>
            <div className="footer-links">
              <a href="/pages/privacy.html">Privacybeleid</a>
              <a href="/pages/voorwaarden.html">Algemene voorwaarden</a>
              <a className="link-underline" href="mailto:info@taxi951.nl">
                info@taxi951.nl
              </a>
              <a className="link-underline" href="tel:0650680749">
                Bel: 0650680749
              </a>
              <a
                className="link-underline"
                href="https://wa.me/31650680749"
                target="_blank"
                rel="noopener"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
