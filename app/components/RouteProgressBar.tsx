"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin green progress bar that appears at the top of the screen
 * whenever the route changes — gives instant visual feedback so users
 * know their tap was registered and navigation is in progress.
 */
export default function RouteProgressBar() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Start: jump to 15%, then ease slowly toward 85%
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";

    // Force reflow so the transition resets properly
    bar.getBoundingClientRect();

    bar.style.transition = "width 0.35s ease-out";
    bar.style.width = "15%";

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      bar.style.transition = "width 2s ease-out";
      bar.style.width = "85%";
    }, 100);

    // Finish: slam to 100%, then fade out
    const finishTimer = setTimeout(() => {
      bar.style.transition = "width 0.15s ease-out";
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.transition = "opacity 0.25s ease";
        bar.style.opacity = "0";
        setTimeout(() => {
          bar.style.width = "0%";
        }, 300);
      }, 150);
    }, 400);

    return () => {
      clearTimeout(finishTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        height: "3px",
        width: "0%",
        background: "linear-gradient(90deg, #38c172, #20b858)",
        pointerEvents: "none",
        boxShadow: "0 0 8px rgba(56, 193, 114, 0.6)",
      }}
      ref={barRef}
    />
  );
}
