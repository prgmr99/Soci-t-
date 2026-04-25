"use client";

import { useEffect, useRef } from "react";

/**
 * A 1px brass hairline at the top of the viewport that fills horizontally
 * as the user scrolls the page.
 *
 * why:
 * - Reinforces the "long-form editorial" feel — readers see how far they are
 *   into the issue without a heavy chrome.
 * - Uses passive scroll + rAF + transform-only writes so it never blocks the
 *   main thread; the bar is fixed and aria-hidden so it adds no a11y noise.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      node.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px origin-left bg-brass-strong/70"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
