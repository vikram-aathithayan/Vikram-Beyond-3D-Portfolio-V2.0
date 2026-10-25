# Vikram Aathithayan · Portfolio V2

Personal portfolio for Vikram Aathithayan M, Software Engineer at LEXISORA Infotech.

A fully animated, IT-themed site in black and royal gold. One WebGL canvas sits behind the whole page and
follows the scroll: a network globe with the stack in orbit (hero), server racks (About), a stylised developer at a dual-monitor desk (How I work), a laptop with live
Node.js code (Career), a tech universe (Skills), a desktop workstation (Projects) and a signal tower (Contact).
A gold sports car and a motorbike drive across the gaps between sections as you scroll, wheels spinning with
the distance. The full name lands letter by letter like a film title, sections reveal on scroll, project cards
tilt in 3D, and a spoken introduction plays with live captions.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4
- three.js with React Three Fiber and drei (one site-wide canvas, see [src/components/three](src/components/three))
- Motion for UI animation, Lenis for smooth scrolling
- Hand-built SVG charts with hover tooltips

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Edit content

Everything personal lives in [`src/data/profile.ts`](src/data/profile.ts): bio, spoken intro, experience,
projects, skills and contact details. The home page and `/resume` both read from it.

## Spoken intro

"Hear my intro" opens a full-screen player with a studio portrait, a voice visualiser and word-by-word
captions. It reads `intro` from [src/data/profile.ts](src/data/profile.ts) with the most natural voice the
visitor's browser offers. To use a real recording, put it at `public/audio/intro.mp3` and set `introAudio`.

## Security

[next.config.ts](next.config.ts) sends a Content Security Policy plus X-Frame-Options, nosniff,
Referrer-Policy, Permissions-Policy, COOP and (in production) HSTS.

## Structure

```
src/
  app/                   layout, page, /resume
  components/three/      site-wide 3D canvas and the IT scenes for each section
  components/hero/       hero, cinematic name, intro player and voice engine
  components/sections/   About, How I work, Career, Skills, Projects, Contact
  components/ui/         tech icons, tilt card
  data/profile.ts        all content
```

## Deploy

Push to GitHub and import the repo in Vercel. No environment variables are needed.
