/* ===================================================================
   VEER GUPTA — PORTFOLIO SCRIPT
   CMU 15-113, Project 1

   AI USAGE NOTE (assignment requirement — see prompt-log.txt for the
   full conversational log):
   This file was drafted with AI assistance (Claude). Each feature
   below has its own comment block marking what the AI wrote/proposed
   and what I reviewed or adjusted. None of this was copy-pasted
   blind — I read through the logic, renamed things to match my own
   HTML structure (element ids, classes, section ids), and can explain
   what each block does line by line.

   Features:
   1. Theme toggle       — terminal <-> "paper" light mode
   2. Scroll-spy nav     — highlights the current section in the rail
   3. Stat counters      — animates project metrics counting up from
                            0 when they scroll into view
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------
     1. THEME TOGGLE
     AI-assisted: the core idea (toggle a class on <body>, let CSS
     variables handle the actual recoloring) was suggested by the AI
     during the design-concept pass. I adapted the button label text
     and the terminal/paper metaphor myself to match the design plan.
     No localStorage is used — state resets each visit, which is fine
     for a simple static site and avoids browser-storage complexity.
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
     2. SCROLL-SPY NAVIGATION
     AI-assisted: I asked the AI for a way to highlight the current
     section in the left rail as the user scrolls. It suggested
     IntersectionObserver over a manual scroll-position calculation
     (better performance, no scroll-event math). I reviewed how the
     rootMargin values work and adjusted them so a section is marked
     "active" a bit before it's centered in the viewport, rather than
     only when fully visible — the -40%/-50% margins trigger that.
     ----------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  if (navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        const activeLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (!activeLink) return;
        navLinks.forEach((link) => link.classList.remove('active'));
        activeLink.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => navObserver.observe(section));
  }

  /* -----------------------------------------------------------------
     3. ANIMATED STAT COUNTERS
     New feature added on request. AI-assisted end to end: I asked for
     a count-up animation for the project metrics (e.g. "+290% net
     return") that plays once, when the metric scrolls into view.

     How it works:
     - Each ".counter" element in the HTML already contains its real,
       final text (e.g. "+290% net return") so the numbers are still
       correct if JavaScript fails to load — the animation is a
       progressive enhancement, not the only source of truth.
     - data-target / data-prefix / data-suffix / data-comma attributes
       on each element tell the script the number to count to and how
       to format it back into text.
     - requestAnimationFrame + an ease-out curve drives the animation
       (the AI wrote the easing math — a standard cubic ease-out,
       1 - (1-t)^3 — which I kept because it's a well-known, readable
       formula rather than something opaque).
     - IntersectionObserver fires the animation once per element, the
       first time it enters the viewport, then stops observing it so
       it doesn't replay on every scroll up/down.
     - prefers-reduced-motion is respected: if the user has that
       preference set, counters just show their final value instantly
       instead of animating.
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