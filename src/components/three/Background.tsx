"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/components/ui/useReducedMotion";

const SiteCanvas = dynamic(() => import("./SiteCanvas"), { ssr: false });

export function Background() {
  const reduced = useReducedMotion();
  return <SiteCanvas still={!!reduced} />;
}
