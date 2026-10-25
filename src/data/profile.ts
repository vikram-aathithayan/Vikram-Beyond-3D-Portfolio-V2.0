// Single source of truth for every section of the site and the /resume page.
// Edit here; nothing else hard-codes personal details.

export const profile = {
  name: "Vikram Aathithayan M",
  displayName: "Vikram Aathithayan",
  shortName: "Vikram",
  role: "Full-stack Software Engineer",
  // The current employer is named only in the Career section (see `experience`).
  location: "Villupuram, Tamil Nadu, India",
  email: "vikram.aathithayan@gmail.com",
  phoneDisplay: "+91 95853 17209",
  github: "https://github.com/vikram-aathithayan",
  linkedin: "https://www.linkedin.com/in/vikram-aathithayan-0084b923a",
  careerStart: "2024-02-01",
  summary:
    "Full-stack software engineer with 2.5+ years shipping production systems, with Node.js at the core. I've built REST APIs and backends for real estate CRMs and HR platforms, and now build a credit management system end to end.",
  // Set to "/audio/intro.mp3" once Vikram's own recording of `intro` is in public/audio.
  // Until then the site reads `intro` aloud with the visitor's most natural browser voice.
  introAudio: null as string | null,
  intro:
    "Hi, I'm Vikram Aathithayan, a full-stack software engineer from Tamil Nadu. For over two and a half years I've been building production systems, with Node.js at the core. I've built backends for real estate CRMs and HR platforms, and right now I'm building a credit management system, end to end. Have a look around, and if you'd like to work together, you'll find my contact details at the bottom of the page.",
} as const;

export type Experience = {
  company: string;
  role: string;
  start: string; // ISO date
  end: string | null; // null = current
  type: string;
  summary: string;
  points: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: "LEXISORA Infotech",
    role: "Software Engineer",
    start: "2026-07-13",
    end: null,
    type: "Full-time",
    summary:
      "Full-stack engineer and tester on a credit management system built on Creditsafe and Companies House data.",
    points: [
      "Build features across both portals: the customer portal and the admin portal",
      "Develop the Next.js frontend and the backend services behind it",
      "Design PostgreSQL schemas and queries for company, credit and customer data",
      "Integrate Creditsafe credit data and Companies House company records",
      "Own testing for both portals, from API checks to end-to-end user flows",
      "Work AI-first, using Claude and Antigravity to plan, write and review code",
    ],
    stack: ["Next.js", "PostgreSQL", "Claude", "Antigravity"],
  },
  {
    company: "Twilight IT Solutions",
    role: "Software Developer",
    start: "2024-02-01",
    end: "2026-07-09",
    type: "Full-time, on-site",
    summary:
      "Backend developer on production systems for real estate, EdTech and HR clients.",
    points: [
      "Developed and maintained scalable REST APIs using Node.js and Express.js",
      "Built backend modules for a Real Estate CRM, including leasing and sales workflows",
      "Implemented secure authentication and authorization for enterprise applications",
      "Optimized PostgreSQL queries to cut response times",
      "Worked with frontend teams on API contracts and integration",
      "Managed production deployments with PM2",
    ],
    stack: ["Node.js", "Express.js", "PostgreSQL", "TypeScript", "PM2", "Postman"],
  },
];

export const education = {
  degree: "Bachelor of Engineering, Mechanical Engineering",
  school: "Sri Rangapoopathi College of Engineering",
  years: "2017 – 2021",
  note: "Dean's List, all semesters",
};

export type Project = {
  slug: string;
  title: string;
  kind: string;
  client?: string;
  period: string;
  description: string;
  stack: string[];
  image?: string;
  current?: boolean;
};

export const projects: Project[] = [
  {
    slug: "credit-management",
    title: "Credit Management System",
    kind: "Company credit checks and monitoring",
    period: "Jul 2026 – now",
    description:
      "Credit checks and company monitoring powered by Creditsafe and Companies House. Two portals: customers look up and track companies, admins manage accounts and data. I work on both, frontend to database, and test them.",
    stack: ["Next.js", "PostgreSQL", "Claude", "Antigravity"],
    image: "/projects/credit-management.jpg",
    current: true,
  },
  {
    slug: "property",
    title: "Property Management System",
    kind: "Real estate CRM",
    client: "Evoltec Technologies",
    period: "Twilight IT Solutions",
    description:
      "CRM for property management, leasing, customers and sales. I built the backend APIs for the property, leasing and sales modules and the transaction data behind them.",
    stack: ["Node.js", "Express.js", "PostgreSQL"],
    image: "/projects/property-management.jpg",
  },
  {
    slug: "youcanfly",
    title: "YouCanFly",
    kind: "Drone learning platform",
    period: "Twilight IT Solutions",
    description:
      "EdTech platform for learning to fly drones. I built course and user management APIs, authentication and student progress tracking.",
    stack: ["Node.js", "Express.js", "PostgreSQL"],
    image: "/projects/drone-learning.jpg",
  },
  {
    slug: "hrms",
    title: "HRMS Platform",
    kind: "Human resource management",
    period: "Twilight IT Solutions",
    description:
      "Employee records, payroll, recruitment and performance modules for an enterprise HR team.",
    stack: ["Node.js", "PostgreSQL"],
    image: "/projects/hrms.jpg",
  },
  {
    slug: "ess",
    title: "ESS Portal",
    kind: "Employee self-service",
    period: "Twilight IT Solutions",
    description:
      "Lets staff request leave, view payslips, read announcements and raise service tickets.",
    stack: ["Node.js", "Express.js"],
    image: "/projects/ess.jpg",
  },
  {
    slug: "attendance",
    title: "Attendance System",
    kind: "Workforce attendance",
    period: "Twilight IT Solutions",
    description:
      "Biometric attendance, shift rosters, live monitoring and automated reports.",
    stack: ["Node.js", "PostgreSQL"],
    image: "/projects/attendance.jpg",
  },
];

// Self-rated proficiency, 0–100. Adjust freely.
export type Skill = { name: string; level: number; icon: string };
export type SkillGroup = { area: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    area: "Backend",
    skills: [
      { name: "Node.js", level: 90, icon: "node" },
      { name: "Express.js", level: 88, icon: "express" },
      { name: "REST APIs", level: 92, icon: "api" },
    ],
  },
  {
    area: "Frontend",
    skills: [
      { name: "Next.js", level: 75, icon: "next" },
      { name: "React", level: 74, icon: "react" },
      { name: "JavaScript", level: 88, icon: "js" },
      { name: "TypeScript", level: 72, icon: "ts" },
    ],
  },
  {
    area: "Data",
    skills: [
      { name: "PostgreSQL", level: 86, icon: "postgres" },
      { name: "Query optimization", level: 80, icon: "speed" },
    ],
  },
  {
    area: "Quality and delivery",
    skills: [
      { name: "Testing", level: 80, icon: "test" },
      { name: "Postman", level: 88, icon: "postman" },
      { name: "Git and GitHub", level: 85, icon: "git" },
      { name: "PM2", level: 80, icon: "pm2" },
      { name: "Docker", level: 68, icon: "docker" },
      { name: "AWS", level: 65, icon: "aws" },
    ],
  },
  {
    area: "AI-assisted development",
    skills: [
      { name: "Claude", level: 88, icon: "claude" },
      { name: "Antigravity", level: 82, icon: "antigravity" },
    ],
  },
];

export function monthsBetween(startIso: string, end: Date = new Date()) {
  const s = new Date(startIso);
  return (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth());
}
