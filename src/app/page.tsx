import { Hero } from "@/components/hero/Hero";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Background } from "@/components/three/Background";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { About } from "@/components/sections/About";
import { HowIWork } from "@/components/sections/HowIWork";
import { Career } from "@/components/sections/Career";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Background />
      <CursorGlow />
      <ScrollReveal />
      <ScrollProgress />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <TechMarquee />
        <About />
        <HowIWork />
        <Career />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
