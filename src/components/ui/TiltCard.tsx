"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { motion, useMotionValue, useSpring } from "motion/react";

/** Tilts toward the pointer in 3D, with a light glare that follows. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  return (
    <motion.div
      ref={ref}
      className={`group/tilt relative ${className ?? ""}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 12);
        rx.set(-(py - 0.5) * 10);
        ref.current!.style.setProperty("--gx", `${px * 100}%`);
        ref.current!.style.setProperty("--gy", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--gx,50%) var(--gy,50%), rgb(245 196 81 / 0.12), transparent 60%)" }}
      />
    </motion.div>
  );
}
