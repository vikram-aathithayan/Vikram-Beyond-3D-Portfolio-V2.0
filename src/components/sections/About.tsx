import Image from "next/image";
import { education, profile } from "@/data/profile";

const FACTS = [
  { k: "Experience", v: "2.5+ years in production" },
  { k: "Now", v: "Credit management system" },
  { k: "Focus", v: "Full-stack and testing" },
  { k: "Education", v: "B.E. Mechanical Engineering" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-center lg:gap-20 lg:px-10">
        <div data-reveal className="relative mx-auto w-full max-w-[320px]">
          <div className="absolute -inset-3 rotate-[-3deg] rounded-[28px] bg-gradient-to-br from-lamp/60 to-ember/50" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line">
            <Image
              src="/images/vikram-portrait.webp"
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="320px"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>
        <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          <h2 className="section-title">
            From mechanical engineering
            <span className="block text-muted">to shipping software.</span>
          </h2>
          <p className="mt-6 measure text-lg text-muted">{profile.summary}</p>
          <p className="mt-4 measure text-muted">
            I studied at {education.school}, made the Dean&apos;s List every semester, and moved into
            software in 2024. I care about APIs that stay fast, data that stays correct, and features
            that are tested before anyone else sees them.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt className="text-sm text-faint">{f.k}</dt>
                <dd className="mt-1 font-medium text-paper">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
