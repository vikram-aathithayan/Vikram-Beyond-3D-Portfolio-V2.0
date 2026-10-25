"use client";

import { LuPrinter } from "react-icons/lu";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-[#0f1a2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#22314f]"
    >
      <LuPrinter className="size-4" /> Save as PDF
    </button>
  );
}
