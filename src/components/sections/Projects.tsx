import Image from "next/image";
import { projects, type Project } from "@/data/profile";
import { StackChip } from "@/components/ui/TechIcon";
import { TiltCard } from "@/components/ui/TiltCard";

function ProjectCard({ p }: { p: Project }) {
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-deep/75 backdrop-blur-xl ${
        p.current ? "border-lamp/50" : "border-line"
      }`}
    >
      {p.image && (
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {p.current && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-night/80 px-3 py-1 text-xs font-medium text-good backdrop-blur">
              <span className="size-2 rounded-full bg-good" /> In progress, {p.period}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="text-sm text-faint">
          {p.kind}
          {p.client ? `, for ${p.client}` : ""}
        </div>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-paper">{p.title}</h3>
        <p className="mt-3 text-muted">{p.description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {p.stack.map((s) => (
            <StackChip key={s} name={s} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div data-reveal className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 className="section-title">Projects</h2>
          <p className="measure text-lg text-muted">
            Six production systems: one I&apos;m building now, and five I shipped at Twilight IT Solutions
            for real estate, EdTech and HR clients.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <div key={p.slug} data-reveal style={{ "--d": `${(i % 3) * 120}ms` } as React.CSSProperties}>
              <TiltCard className="h-full">
                <ProjectCard p={p} />
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
