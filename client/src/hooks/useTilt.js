import { useCallback, useEffect, useRef } from 'react';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function isTouch() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover: none)').matches
  );
}

/**
 * Tilts an element towards the pointer so the dish appears to turn as you
 * look at it, and exposes the pointer position as CSS variables so a glare
 * layer can follow the cursor.
 *
 * Returns a ref to attach to the card. No-op on touch screens and when the
 * visitor asked for reduced motion.
 */
export default function useTilt({ max = 9, scale = 1.02, glare = true } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const enabled = useRef(true);

  useEffect(() => {
    enabled.current = !prefersReducedMotion() && !isTouch();
  }, []);

  const write = useCallback((node, rx, ry, mx, my, sc) => {
    node.style.setProperty('--tilt-rx', `${rx}deg`);
    node.style.setProperty('--tilt-ry', `${ry}deg`);
    node.style.setProperty('--tilt-scale', sc);
    if (glare) {
      node.style.setProperty('--tilt-mx', `${mx}%`);
      node.style.setProperty('--tilt-my', `${my}%`);
    }
  }, [glare]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const onMove = (event) => {
      if (!enabled.current) return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        write(
          node,
          (0.5 - py) * max * 2,
          (px - 0.5) * max * 2,
          px * 100,
          py * 100,
          scale
        );
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame.current);
      write(node, 0, 0, 50, 50, 1);
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame.current);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [max, scale, write]);

  return ref;
}
