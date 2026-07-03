/**
 * ═══════════════════════════════════════════════════════════════
 * MEDITERRANEI × LEGACOOP · AI AGRI-FOOD PRESENTATION
 * script.js — v1.0
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── STATE ──────────────────────────────────────────────────── */
const TOTAL_SLIDES = 6;
let currentIndex  = 0;
let isAnimating   = false;
let wheelLocked   = false;
let touchStartY   = 0;

/** Journey labels shown below the slide counter */
const SLIDE_LABELS = [
  'Field \u0026 origin',
  'From seed to shelf data',
  'Cooperative AI',
  'Measured impacts',
  'GDO \u0026 territories',
  'Cooperative future'
];

/* ─── DOM REFS ───────────────────────────────────────────────── */
const slidesWrapper = document.getElementById('slidesWrapper');
const slides        = Array.from(document.querySelectorAll('.slide'));
const dots          = Array.from(document.querySelectorAll('.dot'));
const ticks         = Array.from(document.querySelectorAll('.progress-tick'));
const progressFill  = document.getElementById('progressFill');
const currentLabel  = document.getElementById('currentSlide');
const counterLabel  = document.getElementById('counterLabel');
const scrollHint    = document.getElementById('scrollHint');

/* ─── HELPERS ────────────────────────────────────────────────── */

/**
 * Zero-pads a number to 2 digits
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n + 1).padStart(2, '0');
}

/**
 * Updates the progress bar width
 */
function updateProgress() {
  const pct = (currentIndex / (TOTAL_SLIDES - 1)) * 100;
  progressFill.style.width = pct + '%';
}

/**
 * Updates the slide counter label
 */
function updateCounter() {
  currentLabel.textContent = pad(currentIndex);
}

/**
 * Updates the dynamic journey label below the counter
 */
function updateCounterLabel() {
  if (counterLabel) {
    counterLabel.textContent = SLIDE_LABELS[currentIndex] || '';
  }
}

/**
 * Highlights the tick mark corresponding to the current slide
 */
function updateTicks() {
  ticks.forEach((tick, i) => {
    tick.classList.toggle('is-active', i === currentIndex);
  });
}

/**
 * Updates nav dot active state
 */
function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

/**
 * Manages the scroll hint visibility
 */
function updateScrollHint() {
  if (currentIndex > 0) {
    scrollHint.classList.add('hidden');
  } else {
    scrollHint.classList.remove('hidden');
  }
}

/* ─── ANIMATE-IN ELEMENTS ────────────────────────────────────── */

/**
 * Triggers sequential fade-in for all .animate-in children
 * within the given slide element.
 * @param {HTMLElement} slideEl
 */
function triggerAnimations(slideEl) {
  const items = Array.from(slideEl.querySelectorAll('.animate-in'));
  items.forEach(el => el.classList.remove('visible'));

  // Small delay to allow CSS transition reset
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach(el => el.classList.add('visible'));
    });
  });
}

/**
 * Resets animate-in state on a departing slide
 * @param {HTMLElement} slideEl
 */
function resetAnimations(slideEl) {
  const items = Array.from(slideEl.querySelectorAll('.animate-in'));
  items.forEach(el => el.classList.remove('visible'));
}

/* ─── STAT COUNTER ANIMATION ─────────────────────────────────── */

/**
 * No-op: slide 4 now uses text-based impact statements.
 * Kept for API compatibility but does nothing.
 * @param {HTMLElement} _slideEl
 */
function animateStats(_slideEl) {
  // Stats are now text-based; no numeric animation needed.
}

/* ─── COUNTER ANIMATION ──────────────────────────────────────── */

/**
 * Fades #currentSlide and #counterLabel out, updates their text,
 * then fades them back in — in sync with the slide content transition.
 *
 * Strategy: inline-style opacity is toggled via the same double-rAF
 * pattern used by triggerAnimations(), so the counter participates
 * in the same visual beat as the incoming slide's content.
 *
 * We use a 120ms fade-out (fast enough to feel immediate) followed
 * by an rAF-driven fade-in timed to the CSS easing of the slide.
 */
function animateCounter() {
  const FADE_DURATION = '120ms';
  const elements = [currentLabel, counterLabel].filter(Boolean);

  // 1) Snap to invisible, applying a quick transition
  elements.forEach(el => {
    el.style.transition = `opacity ${FADE_DURATION} ease`;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(4px)';
  });

  // 2) After the fade-out completes, update text and fade back in.
  //    Double-rAF ensures the browser has committed the opacity-0 frame
  //    before we start the fade-in (same pattern as triggerAnimations).
  setTimeout(() => {
    // Text is already updated by updateCounter/updateCounterLabel
    // called just before animateCounter(); just re-trigger the fade-in.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elements.forEach(el => {
          el.style.transition = `opacity 280ms ease, transform 280ms ease`;
          el.style.opacity    = '';
          el.style.transform  = '';
        });
      });
    });
  }, 130); // Slightly longer than FADE_DURATION to guarantee the frame is committed
}

/* ─── MAIN NAVIGATION ────────────────────────────────────────── */

/**
 * Navigates to a slide by index.
 * Applies is-active, is-above class logic for CSS transitions.
 * @param {number} targetIndex
 */
function goToSlide(targetIndex) {
  if (
    isAnimating ||
    targetIndex === currentIndex ||
    targetIndex < 0 ||
    targetIndex >= TOTAL_SLIDES
  ) return;

  isAnimating = true;

  const prevIndex = currentIndex;
  currentIndex    = targetIndex;

  const prevSlide    = slides[prevIndex];
  const targetSlide  = slides[targetIndex];

  // Reset target animations before it becomes visible
  resetAnimations(targetSlide);

  // Apply positional classes
  slides.forEach((slide, i) => {
    slide.classList.remove('is-active', 'is-above');
    if (i < currentIndex) slide.classList.add('is-above');
  });

  targetSlide.classList.add('is-active');

  // Set body class for slide-specific themes
  document.body.className = '';
  document.body.classList.add(`slide-${currentIndex + 1}-active`);
  if (currentIndex === 2) {
    document.body.classList.add('slide-trust-active');
  }

  // Trigger content animations on the incoming slide
  triggerAnimations(targetSlide);

  // Special: animate stats on slide 4 (index 3)
  if (currentIndex === 3) {
    animateStats(targetSlide);
  }

  // Special: animate trace bar on slide 2 (index 1)
  // (handled by CSS .is-active .trace-bar-fill)

  // Update UI elements (progress, ticks, dots, scroll hint) synchronously
  // so they all change at the exact same frame as the slide class swap.
  updateProgress();
  updateTicks();
  updateDots();
  updateScrollHint();

  // Update counter text first, then animate it in sync with slide content.
  // animateCounter() fades the numbers out, waits one tick, then fades them
  // back in — matching the visual rhythm of triggerAnimations().
  updateCounter();
  updateCounterLabel();
  animateCounter();

  // Unlock after CSS slide transition completes.
  // 680 ms matches the CSS transition duration (~650 ms) + a small buffer
  // to prevent isAnimating from clearing before the slide has fully settled.
  const UNLOCK_MS = 680;
  setTimeout(() => {
    isAnimating = false;
  }, UNLOCK_MS);
}

/* ─── KEYBOARD NAVIGATION ────────────────────────────────────── */
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      e.preventDefault();
      goToSlide(currentIndex + 1);
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      goToSlide(currentIndex - 1);
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(TOTAL_SLIDES - 1);
      break;
  }
});

/* ─── MOUSE WHEEL NAVIGATION ─────────────────────────────────── */
/**
 * Wheel handler design rationale:
 *
 * THRESHOLD (32): Filters jitter and accidental micro-scrolls on trackpads
 *   without requiring an exaggerated gesture. Values below ~25 produce false
 *   triggers; values above ~50 feel sluggish on low-sensitivity devices.
 *
 * LOCK (170 ms): Absorbs the inertial momentum that follows a deliberate scroll
 *   gesture, preventing duplicate goToSlide() calls from a single swipe.
 *   Set below UNLOCK_MS (680 ms) so it releases well before isAnimating clears,
 *   allowing the next intentional gesture to be registered cleanly.
 *
 * e.preventDefault() is called ONLY when a slide change is possible; when
 * already at the first or last slide the browser receives the event normally.
 *
 * deltaX is ignored entirely — direction is decided solely by deltaY.
 */
document.addEventListener('wheel', e => {
  // Ignore horizontal scrolls and micro-jitter
  if (Math.abs(e.deltaY) < 32) return;

  if (wheelLocked) {
    // Still in the momentum window — swallow the event to prevent double-jump
    e.preventDefault();
    return;
  }

  const isScrollingDown = e.deltaY > 0;
  const canGoDown = isScrollingDown && currentIndex < TOTAL_SLIDES - 1;
  const canGoUp   = !isScrollingDown && currentIndex > 0;

  if (canGoDown || canGoUp) {
    // Intercept the event only for valid transitions
    e.preventDefault();

    // Short lock to absorb scroll momentum (see rationale above)
    wheelLocked = true;
    setTimeout(() => { wheelLocked = false; }, 170);

    goToSlide(isScrollingDown ? currentIndex + 1 : currentIndex - 1);
  }
  // If already at boundary: event not prevented → browser handles naturally
}, { passive: false });

/* ─── TOUCH NAVIGATION ───────────────────────────────────────── */
document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const delta = touchStartY - e.changedTouches[0].clientY;
  const THRESHOLD = 50;

  if (delta > THRESHOLD) {
    goToSlide(currentIndex + 1);
  } else if (delta < -THRESHOLD) {
    goToSlide(currentIndex - 1);
  }
}, { passive: true });

/* ─── DOT NAVIGATION ─────────────────────────────────────────── */
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const target = parseInt(dot.dataset.slide, 10);
    goToSlide(target);
  });
});

/* ─── LUCIDE ICONS ───────────────────────────────────────────── */

/**
 * Initializes Lucide icon library after DOM is ready.
 * Falls back gracefully if library is unavailable.
 */
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ─── INIT ───────────────────────────────────────────────────── */

/**
 * Bootstrap the presentation on DOM ready.
 */
function init() {
  initIcons();

  // Set initial slide (slide 0 is active)
  const firstSlide = slides[0];
  if (firstSlide) {
    firstSlide.classList.add('is-active');
    document.body.classList.add('slide-1-active');
    triggerAnimations(firstSlide);
  }

  // All other slides below by default — no class needed
  // as CSS default is translateY(100%)

  // Initialise UI
  updateProgress();
  updateCounter();
  updateCounterLabel();
  updateTicks();
  updateDots();
  updateScrollHint();

  // Scroll hint auto-hide
  document.addEventListener('keydown', () => {
    if (scrollHint) scrollHint.classList.add('hidden');
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
