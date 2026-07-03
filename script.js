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

  // Update UI
  updateProgress();
  updateCounter();
  updateCounterLabel();
  updateTicks();
  updateDots();
  updateScrollHint();

  // Unlock after CSS transition
  const UNLOCK_MS = 950;
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
document.addEventListener('wheel', e => {
  e.preventDefault();

  if (wheelLocked) return;

  // Sensitivity threshold to filter tiny scroll jitter
  const THRESHOLD = 40;
  if (Math.abs(e.deltaY) < THRESHOLD && Math.abs(e.deltaX) < THRESHOLD) return;

  // Lock wheel briefly to prevent rapid fire
  wheelLocked = true;
  setTimeout(() => { wheelLocked = false; }, 1000);

  if (e.deltaY > 0 || e.deltaX > 0) {
    goToSlide(currentIndex + 1);
  } else {
    goToSlide(currentIndex - 1);
  }
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
