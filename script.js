/* ===================================================================
   VEER GUPTA — PORTFOLIO SCRIPT (v2 — multi-page rebuild)
   CMU 15-113, Project 1

   AI USAGE NOTE (assignment requirement — see prompt-log.txt for the
   full conversational log): drafted with AI assistance (Claude).
   Each feature has its own comment marking what the AI wrote/
   proposed and what I reviewed or changed.

   Why this file changed from v1: the site was restructured from a
   single scrolling page into five separate pages (index, about,
   experience, projects, contact) with a fixed top nav instead of a
   left rail. That made the old scroll-spy feature (which highlighted
   the current section as you scrolled one long page) meaningless —
   there's no single page to scroll through anymore. I removed it and
   replaced it with a mobile hamburger menu, since a fixed top nav
   actually needs a collapse behavior on small screens that the old
   left-rail layout didn't.

   Features:
   1. Theme toggle    — terminal <-> "paper" light mode (unchanged)
   2. Mobile nav menu — hamburger opens/closes the nav links (NEW,
                         replaces the old scroll-spy)
   3. Stat counters   — animates project metrics counting up from 0
                         when they scroll into view (unchanged,
                         projects.html only)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------
     1. THEME TOGGLE
     AI-assisted: core approach (toggle a class on <body>, let CSS
     variables handle recoloring) came from the AI during the design
     pass; I kept the terminal/paper wording and no-localStorage
     choice from the original single-page version.
     ----------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isPaper = document.body.classList.toggle('theme-paper');
      themeToggle.setAttribute('aria-pressed', String(isPaper));
      themeToggle.textContent = isPaper ? '☀ paper / terminal' : '☾ terminal / paper';
    });
  }

  /* -----------------------------------------------------------------
     2. MOBILE NAV TOGGLE
     AI-assisted: I asked for a standard hamburger-menu pattern for
     the new fixed top nav. The AI suggested toggling an "open" class
     on the link list plus aria-expanded on the button for
     accessibility (screen readers announcing open/closed state) —
     I kept that rather than a simpler show/hide because it's not
     much more code and it's the correct accessible pattern. I also
     added the "close menu after a link is clicked" behavior myself
     after testing it and noticing the menu stayed open after
     navigating, which felt broken.
     ----------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinksList = document.getElementById('navLinksList');

  if (navToggle && navLinksList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinksList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinksList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinksList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -----------------------------------------------------------------
     3. ANIMATED STAT COUNTERS (projects.html)
     AI-assisted end to end, unchanged from the single-page version.
     Each ".counter" element already contains its real, final text
     (e.g. "+290% net return") so the numbers are correct even if
     JavaScript fails to load — the animation is a progressive
     enhancement, not the only source of truth. data-target /
     data-prefix / data-suffix / data-comma attributes tell the
     script the number to count to and how to format it.
     requestAnimationFrame + an ease-out cubic curve drives the
     animation; IntersectionObserver fires it once per element, the
     first time it scrolls into view, then stops observing so it
     doesn't replay on scroll up/down. prefers-reduced-motion skips
     straight to the final value.
     ----------------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatNumber = (value, useComma) => {
    const rounded = Math.round(value);
    return useComma ? rounded.toLocaleString('en-US') : String(rounded);
  };

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const useComma = el.dataset.comma === 'true';
    const finalText = `${prefix}${formatNumber(target, useComma)}${suffix}`;

    if (prefersReducedMotion || isNaN(target)) {
      el.textContent = finalText;
      return;
    }

    const duration = 1200; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentValue = target * eased;

      el.textContent = `${prefix}${formatNumber(currentValue, useComma)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = finalText; // lock to the exact final string
      }
    };

    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target); // play once, then stop watching
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

});
