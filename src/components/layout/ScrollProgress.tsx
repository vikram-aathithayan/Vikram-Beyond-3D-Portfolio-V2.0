"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { LuArrowUp } from "react-icons/lu";

/** A gold progress line along the top edge, and a back-to-top button once you're past the hero. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-ember via-lamp to-chart-1 shadow-[0_0_12px_rgb(245_196_81/0.6)]"
        style={{ scaleX }}
      />
      <AnimatePresence>
        {past && (
          <motion.a
            href="#top"
            aria-label="Back to top"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            className="fixed right-5 bottom-5 z-50 grid size-12 place-items-center rounded-full border border-lamp/40 bg-deep/80 text-lamp shadow-[0_10px_30px_-8px_rgb(245_196_81/0.5)] backdrop-blur-md transition-colors hover:bg-lamp hover:text-lamp-ink"
          >
            <LuArrowUp className="size-5" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
