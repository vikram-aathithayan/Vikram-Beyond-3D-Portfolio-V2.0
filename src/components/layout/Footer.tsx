"use client";

import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";

// Contact details and links live in the Contact section just above, so the
// footer only closes the page: live local time, availability and copyright.

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

// The clock and year are read in the browser only; the prerendered page has neither.
function useLocalTime() {
  const [now, setNow] = useState<{ time: string; year: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow({ time: timeFmt.format(d), year: d.getFullYear() });
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Footer() {
  const now = useLocalTime();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© {now?.year} Vikram Aathithayan</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-good" />
            </span>
            Open to new opportunities
          </span>
          <span className="inline-flex items-center gap-2 tabular-nums">
            <LuClock className="size-3.5" />
            {now ? `${now.time} in Tamil Nadu` : "Tamil Nadu, India"}
          </span>
        </div>
      </div>
    </footer>
  );
}
