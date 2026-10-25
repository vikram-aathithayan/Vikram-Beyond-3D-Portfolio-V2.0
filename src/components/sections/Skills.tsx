"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import { skillGroups, type Skill } from "@/data/profile";
import { TechIcon } from "@/components/ui/TechIcon";

// Brand colours give each tile its own identity; gold stays the page accent.
const BRAND: Record<string, string> = {
  node: "#5fa04e",
  express: "#e8e2d4",
  api: "#f5c451",
  next: "#f2f2f2",
  react: "#61dafb",
  js: "#f7df1e",
  ts: "#3178c6",
  postgres: "#4f8fd6",
  speed: "#f5c451",
  test: "#4ade80",
  postman: "#ff6c37",
  git: "#f05032",
  pm2: "#2b9be6",
  docker: "#2496ed",
  aws: "#ff9900",
  claude: "#d97757",
  antigravity: "#a78bfa",
};

// Short names for tabs and tile captions.
const SHORT: Record<string, string> = { "Quality and delivery": "Delivery", "AI-assisted development": "AI tools" };
const short = (area: string) => SHORT[area] ?? area;

const CORE = ["REST APIs", "Node.js", "PostgreSQL"];
const ALL = "All";
const TABS = [ALL, ...skillGroups.map((g) => g.area)];

function level(n: number) {
  if (n >= 85) return "Expert";
  if (n >= 75) return "Advanced";
  return "Proficient";
}

/** A ring that fills and a number that counts up the first time it's seen. */
function Ring({ value, size, stroke, color }: { value: number; size: number; stroke: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  // Starts at 0 on server and client alike; counts up (or jumps, for reduced motion) once seen.
  const [shown, setShown] = useState(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: reduced ? 0 : 1.4, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <div ref={ref} className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <span className="absolute font-display font-bold text-paper tabular-nums" style={{ fontSize: size * 0.27 }}>
        {shown}
      </span>
    </div>
  );
}

function CoreCard({ s, i }: { s: Skill; i: number }) {
  const color = BRAND[s.icon] ?? "#f5c451";
  return (
    <div
      data-reveal
      style={{ "--d": `${i * 110}ms` } as React.CSSProperties}
      className="group relative overflow-hidden rounded-2xl border border-lamp/30 bg-gradient-to-br from-[#1f1808] via-deep/80 to-deep/80 p-6 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
        style={{ background: color }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <span className="grid size-12 place-items-center rounded-xl border border-line bg-night/70" style={{ color }}>
            <TechIcon name={s.icon} className="size-6" />
          </span>
          <h3 className="mt-4 font-display text-2xl font-semibold text-paper">{s.name}</h3>
          <p className="mt-1 text-sm text-lamp">{level(s.level)} · core skill</p>
        </div>
        <Ring value={s.level} size={104} stroke={8} color="#f5c451" />
      </div>
    </div>
  );
}

function SkillTile({ s, area }: { s: Skill; area: string }) {
  const color = BRAND[s.icon] ?? "#f5c451";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3 }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-deep/70 p-4 backdrop-blur-xl transition-colors hover:border-lamp/50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(240px circle at 20% 50%, ${color}1f, transparent 70%)` }}
      />
      <span
        className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-night/70 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        style={{ color }}
      >
        <TechIcon name={s.icon} className="size-5" />
      </span>
      <div className="relative min-w-0 flex-1">
        <div className="leading-tight font-medium text-paper">{s.name}</div>
        <div className="text-xs text-faint">
          {short(area)} · <span className="text-muted">{level(s.level)}</span>
        </div>
      </div>
      <Ring value={s.level} size={50} stroke={4.5} color="#f5c451" />
    </motion.div>
  );
}

export function Skills() {
  const [tab, setTab] = useState(ALL);
  const all = skillGroups.flatMap((g) => g.skills.map((s) => ({ s, area: g.area })));
  const core = CORE.map((n) => all.find((x) => x.s.name === n)!.s);
  const shown = all.filter((x) => (tab === ALL ? !CORE.includes(x.s.name) : x.area === tab));
  const total = all.length;

  return (
    <section id="skills" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div data-reveal className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 className="section-title">Skills</h2>
          <p className="measure text-lg text-muted">
            {total} tools I use in production, each rated out of 100. Backend is where I started and where I&apos;m
            strongest.
          </p>
        </div>

        {/* Core strengths */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {core.map((s, i) => (
            <CoreCard key={s.name} s={s} i={i} />
          ))}
        </div>

        {/* Filter */}
        <div data-reveal className="mt-12 flex flex-wrap gap-2" role="group" aria-label="Filter skills by area">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className="relative rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors aria-pressed:border-transparent aria-pressed:text-lamp-ink aria-[pressed=false]:text-muted aria-[pressed=false]:hover:text-paper"
            >
              {tab === t && (
                <motion.span
                  layoutId="skill-tab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-ember to-lamp"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              )}
              <span className="relative">{short(t)}</span>
            </button>
          ))}
        </div>

        {/* All skills */}
        <motion.div layout className="mt-6 grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map(({ s, area }) => (
              <SkillTile key={s.name} s={s} area={area} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-faint">
          <span>
            <b className="font-medium text-paper">Expert</b> 85+
          </span>
          <span>
            <b className="font-medium text-paper">Advanced</b> 75–84
          </span>
          <span>
            <b className="font-medium text-paper">Proficient</b> under 75
          </span>
        </p>
      </div>
    </section>
  );
}
