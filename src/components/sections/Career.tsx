"use client";

import { useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { motion } from "motion/react";
import { LuGraduationCap } from "react-icons/lu";
import { education, experience, monthsBetween, type Experience } from "@/data/profile";
import { StackChip } from "@/components/ui/TechIcon";

const COLORS = ["var(--color-chart-2)", "var(--color-chart-1)"];
const fmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

function span(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ") || "Under a month";
}

// "Today" only exists on the client; the server renders a fixed date and the
// browser swaps in the real one during hydration without a mismatch.
const SERVER_TODAY = new Date("2026-10-24");
let clientToday: Date | undefined;
const noop = () => () => {};
function useToday() {
  return useSyncExternalStore(
    noop,
    () => (clientToday ??= new Date()),
    () => SERVER_TODAY,
  );
}

function Timeline({ today }: { today: Date }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const start = new Date("2024-01-01").getTime();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1).getTime();
  const pos = (d: Date) => ((d.getTime() - start) / (end - start)) * 100;
  const years: number[] = [];
  for (let y = 2024; y <= today.getFullYear(); y++) years.push(y);
  const ordered = [...experience].reverse();

  return (
    <figure data-reveal className="rounded-2xl border border-line bg-deep/70 p-5 backdrop-blur-xl sm:p-7">
      <figcaption className="font-medium text-paper">Time in each role</figcaption>
      <div className="relative mt-10" onPointerLeave={() => setHover(null)}>
        {/* Year grid */}
        <div className="pointer-events-none absolute inset-0">
          {years.map((y) => (
            <div key={y} className="absolute inset-y-0 border-l border-line" style={{ left: `${pos(new Date(`${y}-01-01`))}%` }}>
              <span className="absolute -bottom-7 -translate-x-1/2 text-xs text-faint tabular-nums">{y}</span>
            </div>
          ))}
          <div className="absolute inset-y-[-6px] border-l-2 border-dashed border-lamp" style={{ left: `${pos(today)}%` }}>
            <span className="absolute -top-6 -translate-x-1/2 text-xs font-medium text-lamp">Today</span>
          </div>
        </div>
        <div className="relative space-y-3 py-2">
          {ordered.map((e, i) => {
            const s = new Date(e.start);
            const f = e.end ? new Date(e.end) : today;
            const left = pos(s);
            const width = Math.max(1.2, pos(f) - left);
            const months = monthsBetween(e.start, f);
            return (
              <div key={e.company} className="relative h-11">
                <motion.div
                  className="absolute inset-y-0 cursor-default rounded-[4px]"
                  style={{ left: `${left}%`, background: COLORS[i], transformOrigin: "left" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={reduced ? { duration: 0 } : { duration: 0.9, delay: i * 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                  onPointerEnter={() => setHover(i)}
                  role="img"
                  tabIndex={0}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${e.company}, ${fmt.format(s)} to ${e.end ? fmt.format(f) : "now"}, ${span(months)}`}
                />
                {/* Direct label: inside long bars, beside short ones */}
                <span
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-semibold whitespace-nowrap ${width > 30 ? "pl-3 text-night" : "pr-3 text-paper"}`}
                  style={width > 30 ? { left: `${left}%` } : { right: `${100 - left}%` }}
                >
                  {e.company}
                </span>
                {hover === i && (
                  <div
                    className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-lg border border-line bg-deeper px-3 py-2 text-sm shadow-xl"
                    style={{ left: `${left + width / 2}%` }}
                  >
                    <div className="font-semibold text-paper">{e.role}</div>
                    <div className="text-faint">
                      {fmt.format(s)} – {e.end ? fmt.format(f) : "now"}, {span(months)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-7" />
    </figure>
  );
}

function Role({ e, today, color }: { e: Experience; today: Date; color: string }) {
  const s = new Date(e.start);
  const f = e.end ? new Date(e.end) : today;
  return (
    <article data-reveal className="relative grid gap-6 border-t border-line py-10 md:grid-cols-[220px_1fr]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="size-2.5 rounded-full" style={{ background: color }} />
          {fmt.format(s)} – {e.end ? fmt.format(f) : "now"}
        </div>
        <div className="mt-1 text-sm text-faint">
          {span(monthsBetween(e.start, f))}, {e.type.toLowerCase()}
        </div>
      </div>
      <div>
        <h3 className="font-display text-3xl font-semibold tracking-tight text-paper">
          {e.role} <span className="text-muted">at {e.company}</span>
        </h3>
        <p className="mt-3 measure text-muted">{e.summary}</p>
        <ul className="mt-5 grid gap-2.5 lg:grid-cols-2 lg:gap-x-8">
          {e.points.map((p) => (
            <li key={p} className="flex gap-3 text-[0.98rem] text-muted">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ background: color }} />
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          {e.stack.map((s) => (
            <StackChip key={s} name={s} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function Career() {
  const today = useToday();
  const total = monthsBetween(experience[experience.length - 1].start, today);

  return (
    <section id="career" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div data-reveal className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 className="section-title">Career</h2>
          <p className="measure text-lg text-muted">
            {span(total)} of building software that people use every day, from Node.js backends to
            full-stack products like a credit management system.
          </p>
        </div>

        <div className="mt-14">
          <Timeline today={today} />
        </div>

        <div className="mt-6">
          {experience.map((e, i) => (
            <Role key={e.company} e={e} today={today} color={COLORS[experience.length - 1 - i]} />
          ))}
          <article data-reveal className="grid gap-6 border-t border-line py-10 md:grid-cols-[220px_1fr]">
            <div className="flex items-center gap-2 text-sm text-muted">
              <LuGraduationCap className="size-4 text-chart-3" />
              {education.years}
            </div>
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight text-paper">{education.degree}</h3>
              <p className="mt-2 text-muted">
                {education.school}. {education.note}.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
