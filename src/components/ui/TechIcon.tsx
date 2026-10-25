import type { IconType } from "react-icons";
import {
  SiClaude,
  SiDocker,
  SiExpress,
  SiGit,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPm2,
  SiPostgresql,
  SiPostman,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import { LuCloud, LuGauge, LuOrbit, LuPlug, LuTestTubeDiagonal } from "react-icons/lu";

// Keyed by the `icon` field in profile.ts and by stack labels.
const ICONS: Record<string, IconType> = {
  node: SiNodedotjs,
  "node.js": SiNodedotjs,
  express: SiExpress,
  "express.js": SiExpress,
  api: LuPlug,
  "rest apis": LuPlug,
  next: SiNextdotjs,
  "next.js": SiNextdotjs,
  react: SiReact,
  js: SiJavascript,
  javascript: SiJavascript,
  ts: SiTypescript,
  typescript: SiTypescript,
  postgres: SiPostgresql,
  postgresql: SiPostgresql,
  speed: LuGauge,
  test: LuTestTubeDiagonal,
  postman: SiPostman,
  git: SiGit,
  pm2: SiPm2,
  docker: SiDocker,
  aws: LuCloud,
  claude: SiClaude,
  antigravity: LuOrbit,
};

export function TechIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name.toLowerCase()];
  return Icon ? <Icon className={className} aria-hidden /> : null;
}

export function StackChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-deeper/60 px-3 py-1 text-sm text-muted">
      <TechIcon name={name} className="size-3.5 text-paper/80" />
      {name}
    </span>
  );
}
