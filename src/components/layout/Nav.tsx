"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuMenu, LuX } from "react-icons/lu";
import { profile } from "@/data/profile";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#workspace", label: "How I work" },
  { href: "#career", label: "Career" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "border-b border-line/70 bg-night/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-10" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight" onClick={() => setOpen(false)}>
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-ember to-lamp text-sm text-lamp-ink shadow-[0_0_18px_rgb(245_196_81/0.35)]">VA</span>
          <span className="hidden sm:inline">{profile.shortName}</span>
        </a>
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className="relative block rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-paper aria-[current=true]:text-paper"
              >
                {l.label}
                {/* Gold underline glides to the section in view */}
                {active === l.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-lamp shadow-[0_0_10px_rgb(245_196_81/0.7)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block border-t border-line/60 py-4 font-display text-2xl font-semibold">
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
