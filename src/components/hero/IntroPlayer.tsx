"use client";

import Image from "next/image";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { LuPause, LuPlay, LuRotateCcw, LuX } from "react-icons/lu";
import { profile } from "@/data/profile";
import { level, playIntro, sentenceWords, sentences, stopIntro, togglePause, useIntro } from "./introStore";

const RAYS = 56;

/** Circular visualiser, photo halo and backdrop glow, all driven by the live voice level each frame. */
function useVoiceVisuals(
  active: boolean,
  rays: React.RefObject<HTMLDivElement | null>,
  halo: React.RefObject<HTMLDivElement | null>,
  glow: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    // Only animate while the dialog is open.
    if (!active) return;
    let raf = 0;
    let smooth = 0;
    const seeds = Array.from({ length: RAYS }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 2.17) * Math.cos(i * 0.61)));
    const loop = (t: number) => {
      smooth += (level.value - smooth) * 0.22;
      const el = rays.current;
      if (el) {
        for (let i = 0; i < el.children.length; i++) {
          const wobble = 0.5 + 0.5 * Math.sin(t / 95 + i * 0.75);
          const h = 0.08 + smooth * seeds[i] * (0.55 + wobble * 0.75);
          (el.children[i] as HTMLElement).style.transform = `rotate(${(i / RAYS) * 360}deg) translateY(-96px) scaleY(${Math.min(1.1, h).toFixed(3)})`;
        }
      }
      if (halo.current) {
        halo.current.style.transform = `scale(${(1 + smooth * 0.18).toFixed(3)})`;
        halo.current.style.opacity = (0.3 + smooth * 0.7).toFixed(3);
      }
      if (glow.current) glow.current.style.opacity = (0.35 + smooth * 0.5).toFixed(3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, rays, halo, glow]);
}

const noop = () => () => {};

export function IntroPlayer() {
  const { playing, paused, sentence, word, progress, voice } = useIntro();
  const reduced = useReducedMotion();
  // Portals need document; this is false during the prerender.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const rays = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useVoiceVisuals(playing, rays, halo, glow);

  // While open: the page behind is inert, focus stays inside the dialog and
  // returns to whatever opened it. Esc closes, Space pauses.
  useEffect(() => {
    if (!playing) return;
    const opener = document.activeElement as HTMLElement | null;
    const behind = [...document.querySelectorAll<HTMLElement>("body > div:not([data-intro-root]), header, main, footer")];
    behind.forEach((el) => el.setAttribute("inert", ""));
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopIntro();
      if (e.key === "Tab" && dialog.current) {
        const items = [...dialog.current.querySelectorAll<HTMLElement>("button")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === " " && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      behind.forEach((el) => el.removeAttribute("inert"));
      opener?.focus({ preventScroll: true });
    };
  }, [playing]);

  if (!mounted) return null;
  const words = sentence >= 0 ? sentenceWords[sentence] : [];
  const ease = [0.2, 0.7, 0.2, 1] as const;

  return createPortal(
    <AnimatePresence>
      {playing && (
        <motion.div
          key="intro"
          ref={dialog}
          data-intro-root
          // Lenis must not hijack wheel events inside the dialog.
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={`Spoken introduction by ${profile.displayName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
          className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && stopIntro()}
        >
          {/* Gold light behind the portrait, breathing with the voice */}
          <div ref={glow} aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[70vmin] -translate-x-1/2 -translate-y-[62%] rounded-full bg-[radial-gradient(closest-side,rgb(245_196_81/0.22),transparent)]" />

          <motion.div
            initial={{ y: 40, scale: 0.94, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: 24, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: reduced ? 0 : 0.6, ease }}
            className="relative flex w-full max-w-3xl origin-center flex-col items-center text-center [@media(max-height:820px)]:scale-[0.9]"
          >
            {/* Portrait inside a circular voice visualiser */}
            <div className="relative grid size-[230px] place-items-center">
              <div ref={rays} aria-hidden className="absolute top-1/2 left-1/2">
                {Array.from({ length: RAYS }, (_, i) => (
                  <span
                    key={i}
                    className="absolute -top-3.5 -left-[1.5px] h-7 w-[3px] rounded-full bg-gradient-to-t from-lamp/40 via-lamp to-ember"
                    style={{ transformOrigin: "50% 50%" }}
                  />
                ))}
              </div>
              <div ref={halo} aria-hidden className="absolute size-[170px] rounded-full bg-[radial-gradient(closest-side,rgb(245_196_81/0.5),transparent)]" />
              <div aria-hidden className={`absolute size-[150px] rounded-full bg-[conic-gradient(from_0deg,#ffe7a3,#f5c451,transparent_55%,#f5c451)] ${paused ? "" : "animate-[spin_5s_linear_infinite]"}`} />
              <div className="relative size-[142px] overflow-hidden rounded-full border-4 border-deeper">
                <Image src="/images/vikram-portrait.webp" alt={profile.displayName} fill sizes="142px" className="object-cover" />
              </div>
              <span className={`absolute right-[46px] bottom-[46px] size-5 rounded-full border-[3px] border-deeper ${paused ? "bg-faint" : "bg-good"}`} />
            </div>

            <h2 className="mt-3 font-display text-2xl font-semibold text-paper sm:text-3xl">{profile.displayName}</h2>
            <p className="mt-1 text-sm text-lamp">{paused ? "Paused" : "Speaking"} · {profile.role}</p>

            {/* Karaoke captions: one sentence at a time */}
            <div aria-live="polite" className="mt-6 flex min-h-[7.5rem] items-center justify-center sm:min-h-[6.5rem] [@media(max-height:820px)]:mt-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={sentence}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                  className="max-w-2xl font-display text-[1.35rem] leading-snug font-medium tracking-tight sm:text-[1.6rem]"
                >
                  {words.map((w, i) => (
                    <span
                      key={i}
                      className={`transition-[color,text-shadow] duration-200 ${
                        i === word
                          ? "text-lamp [text-shadow:0_0_18px_rgb(245_196_81/0.6)]"
                          : i < word
                            ? "text-paper"
                            : "text-paper/25"
                      }`}
                    >
                      {w}{" "}
                    </span>
                  ))}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Sentence dots and progress */}
            <div className="mt-6 flex w-full max-w-md items-center gap-2 [@media(max-height:820px)]:mt-3" aria-hidden>
              {sentences.map((_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-ember to-lamp transition-[width] duration-300"
                    style={{ width: i < sentence ? "100%" : i === sentence ? `${Math.max(4, Math.round(((word + 1) / sentenceWords[i].length) * 100))}%` : "0%" }}
                  />
                </span>
              ))}
            </div>
            <span className="sr-only">{Math.round(progress * 100)}% through the introduction</span>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-3 [@media(max-height:820px)]:mt-4">
              <button
                type="button"
                onClick={() => playIntro()}
                aria-label="Replay from the start"
                className="grid size-12 place-items-center rounded-full border border-line text-muted transition-colors hover:border-lamp hover:text-lamp"
              >
                <LuRotateCcw className="size-5" />
              </button>
              <button
                type="button"
                onClick={togglePause}
                aria-label={paused ? "Resume" : "Pause"}
                className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-ember to-lamp text-lamp-ink shadow-[0_10px_40px_-8px_rgb(245_196_81/0.7)] transition-transform hover:scale-105 active:scale-95"
              >
                {paused ? <LuPlay className="size-6 translate-x-0.5 fill-current" /> : <LuPause className="size-6 fill-current" />}
              </button>
              <button
                ref={closeBtn}
                type="button"
                onClick={stopIntro}
                aria-label="Close intro"
                className="grid size-12 place-items-center rounded-full border border-line text-muted transition-colors hover:border-lamp hover:text-lamp"
              >
                <LuX className="size-5" />
              </button>
            </div>

            <p className="mt-4 text-xs text-faint">
              {voice ? `Voice: ${voice.replace(/ - .*$/, "")} · ` : ""}Space to pause · Esc to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
