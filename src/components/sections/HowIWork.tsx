import { LuCode, LuRocket, LuSparkles, LuTestTubeDiagonal } from "react-icons/lu";

const STEPS = [
  { icon: LuCode, title: "Design the API first", body: "Endpoints, data model and contracts agreed before a line of UI is written." },
  { icon: LuSparkles, title: "Build with Node.js at the core", body: "Express APIs, Next.js frontends and PostgreSQL, with Claude and Antigravity speeding up the work." },
  { icon: LuTestTubeDiagonal, title: "Test every flow", body: "API checks and end-to-end runs on both portals before anything goes out." },
  { icon: LuRocket, title: "Ship and keep it fast", body: "Deploy, watch the logs, and tune the slow queries." },
];

export function HowIWork() {
  return (
    <section id="workspace" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10">
        <div data-reveal>
          <h2 className="section-title">How I work</h2>
          <p className="mt-6 measure text-lg text-muted">Headphones on, two screens, a coffee within reach. This is how a feature goes from idea to production.</p>
          <ol className="mt-10 space-y-6">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-lamp/30 bg-lamp/10 text-lamp">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-paper">{title}</h3>
                  <p className="mt-1 text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {/* The 3D workspace is drawn by the site canvas into this space. */}
        <div id="workspace-stage" aria-hidden className="relative h-[340px] sm:h-[420px] lg:h-[560px]">
          <div className="absolute inset-x-[10%] bottom-[6%] h-24 rounded-[50%] bg-[radial-gradient(closest-side,rgb(245_196_81/0.12),transparent)]" />
        </div>
      </div>
    </section>
  );
}
