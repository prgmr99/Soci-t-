"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** ms to delay the animation after entering the viewport (for stagger). */
  delay?: number;
  className?: string;
};

/**
 * Reveals children with a calm fade-up the first time they cross into view.
 *
 * why:
 * - Société's editorial layout is intentionally restrained; a one-shot reveal
 *   on enter mimics turning a page rather than a flashy effect.
 * - Animates only opacity/transform, and unsubscribes the IntersectionObserver
 *   after the first hit so scroll never repeats work.
 * - prefers-reduced-motion forces the content to render fully so the page
 *   stays readable without motion.
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "true" : "false"}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
