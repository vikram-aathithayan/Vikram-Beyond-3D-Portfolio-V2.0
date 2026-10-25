import type { Metadata } from "next";
import Link from "next/link";
import { education, experience, profile, projects, skillGroups } from "@/data/profile";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: `Resume | ${profile.name}`,
  description: `Resume of ${profile.name}, ${profile.role}.`,
};

const fmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const range = (s: string, e: string | null) => `${fmt.format(new Date(s))} – ${e ? fmt.format(new Date(e)) : "Present"}`;

export default function Resume() {
  return (
    <div className="min-h-screen bg-[#e9edf4] px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-[820px] items-center justify-between print:hidden">
        <Link href="/" className="text-sm font-medium text-[#3b4a66] hover:underline">
          Back to portfolio
        </Link>
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[820px] bg-white px-10 py-12 text-[13.5px] leading-relaxed text-[#1c2433] shadow-xl print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="border-b-2 border-[#0f1a2e] pb-5">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#0f1a2e]">{profile.name}</h1>
          <p className="mt-1 text-base font-medium text-[#9a5b00]">
            {profile.role}
          </p>
          <p className="mt-2 text-[#3b4a66]">
            {profile.location} | {profile.phoneDisplay} | {profile.email}
            <br />
            {profile.linkedin.replace("https://www.", "")} | {profile.github.replace("https://", "")}
          </p>
        </header>

        <Section title="Summary">
          <p>{profile.summary}</p>
        </Section>

        <Section title="Experience">
          {experience.map((e) => (
            <div key={e.company} className="mb-4 break-inside-avoid">
              <div className="flex flex-wrap justify-between gap-2">
                <strong className="text-[#0f1a2e]">
                  {e.role}, {e.company}
                </strong>
                <span className="text-[#3b4a66]">{range(e.start, e.end)}</span>
              </div>
              <p className="text-[#3b4a66] italic">{e.summary}</p>
              <ul className="mt-1 list-disc pl-5">
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Projects">
          {projects.map((p) => (
            <div key={p.slug} className="mb-2.5 break-inside-avoid">
              <strong className="text-[#0f1a2e]">{p.title}</strong>
              <span className="text-[#3b4a66]">
                {" "}
                ({p.kind}
                {p.client ? `, ${p.client}` : ""}) · {p.stack.join(", ")}
              </span>
              <div>{p.description}</div>
            </div>
          ))}
        </Section>

        <Section title="Skills">
          <ul className="space-y-1">
            {skillGroups.map((g) => (
              <li key={g.area}>
                <strong className="text-[#0f1a2e]">{g.area}:</strong> {g.skills.map((s) => s.name).join(", ")}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Education">
          <div className="flex flex-wrap justify-between gap-2">
            <strong className="text-[#0f1a2e]">{education.degree}</strong>
            <span className="text-[#3b4a66]">{education.years}</span>
          </div>
          <div>
            {education.school}. {education.note}.
          </div>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-display text-lg font-bold tracking-tight text-[#0f1a2e]">{title}</h2>
      {children}
    </section>
  );
}
