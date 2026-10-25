import { TechIcon } from "@/components/ui/TechIcon";

const STACK = [
  "Node.js",
  "Next.js",
  "PostgreSQL",
  "React",
  "TypeScript",
  "Express.js",
  "REST APIs",
  "Docker",
  "Git",
  "Postman",
  "PM2",
  "Claude",
  "Antigravity",
];

/** An endless band of the stack, scrolling under the hero. */
export function TechMarquee() {
  const row = [...STACK, ...STACK];
  return (
    <div className="relative overflow-hidden border-y border-line/70 bg-deeper/60 py-5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-night to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-night to-transparent" />
      <ul className="marquee flex w-max gap-12" aria-label="Technologies I work with">
        {row.map((name, i) => (
          <li
            key={i}
            aria-hidden={i >= STACK.length}
            className="flex items-center gap-3 font-display text-xl font-semibold whitespace-nowrap text-muted"
          >
            <TechIcon name={name} className="size-5 text-lamp" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
