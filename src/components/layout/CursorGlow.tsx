"use client";

import { useEffect, useRef } from "react";

/** A soft fire-light that follows the pointer across the page. */
export function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const tick = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.current?.style.setProperty("transform", `translate3d(${cx - 300}px, ${cy - 300}px, 0)`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    if (el.current) el.current.style.opacity = "1";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[5] size-[600px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{ background: "radial-gradient(closest-side, rgb(245 196 81 / 0.07), transparent)" }}
    />
  );
}
