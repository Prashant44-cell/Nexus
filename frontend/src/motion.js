import { useEffect } from 'react';

// Pointer-driven 3D tilt + reveal-on-scroll for every .glass-panel on screen.
//
// Delegated from the document rather than wrapped around each panel: one listener and one
// observer cover the whole page, so adding a panel needs no motion code of its own.
// ponytail: no animation library — a tilt is two rotations and a reveal is one observer.

const SELECTOR = '.glass-panel';
const MAX_TILT_DEG = 5;      // clamped low: past ~6deg a data panel reads as a toy, not a surface
const STAGGER_MS = 60;
const REVEAL_MS = 450;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resetTilt(el) {
  el.style.setProperty('--tilt-x', '0deg');
  el.style.setProperty('--tilt-y', '0deg');
}

/**
 * @param {Array} deps re-scan when these change (panels mount/unmount on tab switch).
 */
export function usePanelMotion(deps = []) {
  useEffect(() => {
    // Honour the OS setting: no tilt, no reveal, panels simply appear.
    if (prefersReducedMotion()) return;

    const panels = Array.from(document.querySelectorAll(SELECTOR));
    if (!panels.length) return;

    // --- Reveal on scroll -------------------------------------------------
    // Straight ease-out, no overshoot: a bouncing data table reads as sloppy.
    let seen = 0;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const delay = Math.min(seen++, 6) * STAGGER_MS;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-revealed');
        // Drop the delay once the reveal is done, or every later hover tilt inherits it.
        setTimeout(() => { el.style.transitionDelay = ''; }, delay + REVEAL_MS);
        io.unobserve(el);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    for (const el of panels) {
      el.classList.add('motion-panel');
      io.observe(el);
    }

    // --- Pointer tilt -----------------------------------------------------
    let frame = 0;
    let active = null;

    const onPointerMove = (ev) => {
      const el = ev.target instanceof Element ? ev.target.closest(SELECTOR) : null;
      if (el !== active) {
        if (active) resetTilt(active);
        active = el;
      }
      if (!el) return;

      const { clientX, clientY } = ev;
      if (frame) return;                       // rAF throttle: at most one write per frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        const py = (clientY - r.top) / r.height - 0.5;
        // Pointer above centre tips the top edge away, which is what "leaning toward the
        // cursor" looks like — hence the inverted X rotation.
        el.style.setProperty('--tilt-x', `${(-py * MAX_TILT_DEG * 2).toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${(px * MAX_TILT_DEG * 2).toFixed(2)}deg`);
        el.style.setProperty('--glare-x', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    };

    // Pointer can leave the window without a final move event; without this the last
    // panel stays stuck mid-tilt.
    const onPointerLeave = () => {
      if (active) resetTilt(active);
      active = null;
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      for (const el of panels) resetTilt(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
