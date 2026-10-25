"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { motion } from "motion/react";
import { LuPlay, LuSquare } from "react-icons/lu";
import { profile } from "@/data/profile";
import { playIntro, stopIntro, useIntro } from "./introStore";
import { IntroPlayer } from "./IntroPlayer";

const FACTS = [
  { k: "Role", v: profile.role },
  { k: "Core stack", v: "Node.js, Next.js, PostgreSQL" },
  { k: "Based in", v: "Tamil Nadu, India" },
];

// Opening timeline (seconds).
const LETTER_START = 0.55;
const LETTER_STEP = 0.075;
const NAME_LINES = profile.displayName.toUpperCase().split(" ");
const LETTER_COUNT = NAME_LINES.join("").length;
// Index of each line's first letter, so the stagger runs across both lines.
const LINE_OFFSETS = NAME_LINES.map((_, l) => NAME_LINES.slice(0, l).join("").length);
const NAME_DONE = LETTER_START + LETTER_COUNT * LETTER_STEP + 0.6;

/**
 * The full name, landing letter by letter like a film title: each letter
 * slams in from out of focus with a flash, then a light streak crosses the
 * name and the fire shine keeps rolling over it.
 */
function CinematicName({ still }: { still: boolean }) {
  return (
    <h1
      aria-label={profile.displayName}
      // One line on every screen: the size follows the width so the full name always fits.
      className="pointer-events-none absolute inset-x-0 top-[max(20%,120px)] flex select-none items-center justify-center gap-[0.22em] whitespace-nowrap text-[clamp(2.2rem,min(13.6vw,19svh),13rem)] md:top-[max(17%,130px)]"
    >
      {NAME_LINES.map((word, line) => (
        <span key={word} aria-hidden className="flex">
          {word.split("").map((ch, j) => {
            const i = LINE_OFFSETS[line] + j;
            return (
              <motion.span
                key={i}
                initial={still ? false : { opacity: 0, scale: 2.4, y: i % 2 ? 36 : -36, filter: "blur(22px) brightness(3)" }}
                animate={{
                  opacity: [0, 1, 0.45, 1],
                  scale: [2.4, 0.94, 1.02, 1],
                  y: 0,
                  filter: ["blur(22px) brightness(3)", "blur(0px) brightness(2.2)", "blur(0px) brightness(1.4)", "blur(0px) brightness(1)"],
                }}
                transition={
                  still
                    ? { duration: 0 }
                    : { duration: 0.85, delay: LETTER_START + i * LETTER_STEP, times: [0, 0.45, 0.7, 1], ease: "easeOut" }
                }
                className={`display display-condensed fire-letter inline-block leading-[0.84] ${line === 0 ? "silver" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}

      {/* Light streak across the name once every letter has landed */}
      {!still && (
        <motion.span
          aria-hidden
          initial={{ x: "-60vw", opacity: 0 }}
          animate={{ x: "60vw", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, delay: NAME_DONE - 0.2, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 h-[3px] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,#ffe9b0,#fff,#ffd36e,transparent)] shadow-[0_0_40px_12px_rgb(255_215_110/0.5)] mix-blend-screen"
        />
      )}
    </h1>
  );
}

export function Hero() {
  const { playing } = useIntro();
  const reduced = !!useReducedMotion();
  useEffect(() => {
    // Voices load asynchronously in Chrome; asking early warms the list.
    window.speechSynthesis?.getVoices();
    return () => stopIntro();
  }, []);

  const ease = [0.2, 0.7, 0.2, 1] as const;
  const after = (d: number) => (reduced ? { duration: 0 } : { duration: 0.9, delay: NAME_DONE + d, ease });

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* Full-screen spoken intro (rendered into <body>) */}
      <IntroPlayer />
      <div
        id="stage"
        className="stage relative h-[62svh] min-h-[440px] overflow-hidden md:h-[100svh] md:min-h-[700px]"
      >
        <CinematicName still={reduced} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-night via-night/60 to-transparent md:h-40" />

        {/* Cinema letterbox: closed at load, opens once the title has landed */}
        {!reduced && (
          <>
            <motion.div
              aria-hidden
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{ duration: 1.1, delay: NAME_DONE, ease: [0.7, 0, 0.2, 1] }}
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[13svh] bg-black"
            />
            <motion.div
              aria-hidden
              initial={{ y: 0 }}
              animate={{ y: "100%" }}
              transition={{ duration: 1.1, delay: NAME_DONE, ease: [0.7, 0, 0.2, 1] }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[13svh] bg-black"
            />
          </>
        )}
      </div>

      {/* Intro copy and facts. Over the stage on wide screens, below it on phones. */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:pb-12 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={after(0.35)}
          className="max-w-lg md:pointer-events-auto"
        >
          <a
            href="#projects"
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-line bg-deep/70 py-1.5 pr-4 pl-2 text-sm text-muted backdrop-blur transition-colors hover:text-paper"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-good" />
            </span>
            Now building a credit management system
          </a>
          <p className="max-w-md text-lg text-muted">
            Full-stack software engineer with Node.js at the core. I build fast APIs and complete products with
            Node.js, Next.js and PostgreSQL, and I test what I ship.
          </p>
          <button
            type="button"
            onClick={() => (playing ? stopIntro() : playIntro())}
            className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-lamp px-6 py-3.5 font-semibold text-lamp-ink shadow-[0_10px_40px_-8px_rgb(245_196_81/0.55)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {playing ? <LuSquare className="size-4" /> : <LuPlay className="size-4 fill-current" />}
            {playing ? "Stop intro" : "Hear my intro"}
          </button>
        </motion.div>

        <dl className="hidden justify-self-end text-right md:block">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.k}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={after(0.5 + i * 0.12)}
              className="mt-3 first:mt-0"
            >
              <dt className="text-xs text-faint">{f.k}</dt>
              <dd className="text-paper">{f.v}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
