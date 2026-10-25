"use client";

import { useState } from "react";
import { LuCheck, LuCopy, LuFileText, LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";
import { profile } from "@/data/profile";

const DETAILS = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: LuMail, copy: true },
  { label: "Phone", value: profile.phoneDisplay, href: `tel:${profile.phoneDisplay.replace(/\s/g, "")}`, icon: LuPhone, copy: true },
  { label: "LinkedIn", value: "vikram-aathithayan", href: profile.linkedin, icon: FaLinkedinIn, external: true },
  { label: "GitHub", value: "vikram-aathithayan", href: profile.github, icon: SiGithub, external: true },
  { label: "Resume", value: "View and save as PDF", href: "/resume", icon: LuFileText },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-lamp hover:text-lamp"
    >
      {copied ? <LuCheck className="size-3.5 text-good" /> : <LuCopy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_50%_100%,rgb(245_196_81/0.08),transparent)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:px-10">
        <div data-reveal>
          <h2 className="section-title">Let&apos;s talk</h2>
          <p className="mt-6 measure text-lg text-muted">
            Hiring, have a project, or want a second pair of hands on a Node.js or Next.js codebase? Email or
            call me. I usually reply within a day.
          </p>
          <p className="mt-6 flex items-center gap-2 text-faint">
            <LuMapPin className="size-4" /> {profile.location}. Open to remote and hybrid roles.
          </p>
        </div>

        <ul data-reveal className="divide-y divide-line rounded-2xl border border-line bg-deep/70 px-5 backdrop-blur-xl sm:px-7">
          {DETAILS.map(({ label, value, href, icon: Icon, copy, external }) => (
            <li key={label} className="flex items-center gap-4 py-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-lamp">
                <Icon className="size-4" />
              </span>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group min-w-0 flex-1"
              >
                <span className="block text-sm text-faint">{label}</span>
                <span className="block text-lg text-paper [overflow-wrap:anywhere] transition-colors group-hover:text-lamp">{value}</span>
              </a>
              {copy && <CopyButton value={value} label={label} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
