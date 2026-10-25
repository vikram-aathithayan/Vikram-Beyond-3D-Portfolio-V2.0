"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { Anchored } from "./Anchored";
import { Globe } from "./Globe";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DataDust, ServerRacks, SignalTower, TechOrbit } from "./Stations";
import { DesktopComputer, Laptop } from "./Devices";
import { Workspace } from "./Workspace";
import { Drive, Motorbike, SportsCar } from "./Vehicles";
import { CAM_Z, FOV, cameraY, measure, resize } from "./world";

// One WebGL canvas fixed behind the whole page. The camera follows the scroll
// position, so each IT scene stays pinned to its section.

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function applyEnvironment(scene: THREE.Scene, texture: THREE.Texture | null, intensity: number) {
  scene.environment = texture;
  scene.environmentIntensity = intensity;
}

/** Soft studio reflections for the metal paint, generated locally and freed on unmount. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    applyEnvironment(scene, target.texture, 0.55);
    return () => {
      applyEnvironment(scene, null, 1);
      target.dispose();
      pmrem.dispose();
      room.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : m.material ? [m.material] : []).forEach((mat) => mat.dispose());
      });
    };
  }, [gl, scene]);
  return null;
}

function ScrollCamera({ pointer, still }: { pointer: React.RefObject<{ x: number; y: number }>; still: boolean }) {
  const { size, invalidate } = useThree();
  useEffect(() => {
    resize(size.width, size.height);
    measure();
  }, [size.width, size.height]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      measure();
      invalidate();
    });
    ro.observe(document.body);
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [invalidate]);

  useFrame(({ camera }, dt) => {
    camera.position.y = cameraY();
    const tx = still ? 0 : pointer.current.x * 0.35;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2.5, dt);
    camera.position.z = CAM_Z;
  });
  return null;
}

export default function SiteCanvas({ still }: { still: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const [narrow] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [dpr, setDpr] = useState(narrow ? 1.25 : 1.6);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const edge = (side: -1 | 1, inset: number) => (W: number) => side * (W / 2 - inset);
  // Section emblems: in the title/paragraph gap on wide screens, right of the title on phones.
  const emblemX = (f: number) => (W: number) => (W < 7 ? W * 0.27 : -W * f);
  const emblemY = (wide: number, narrow: number) => (W: number) => (W < 7 ? narrow : wide);
  const emblemScale = (s: number) => (W: number) => (W < 7 ? s * 0.5 : s);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Boundary>
        <Canvas
          dpr={dpr}
          frameloop={still ? "demand" : "always"}
          camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
          }}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} />
          <ScrollCamera pointer={pointer} still={still} />
          <StudioEnvironment />
          <fog attach="fog" args={["#050505", 14, 32]} />
          <ambientLight intensity={0.35} color="#fff3e0" />
          <directionalLight position={[3, 5, 6]} intensity={1.2} color="#fff8ee" />
          <pointLight position={[-6, 2, 2]} intensity={20} distance={18} color="#e0a83a" />

          <Suspense fallback={null}>
            <DataDust count={narrow ? 500 : 1100} />

            <Anchored section="stage" f={0.5} z={-1.5} scale={(W) => Math.min(1.95, W * 0.2)}>
              <Globe pointer={pointer} />
            </Anchored>

            {/* Racks peek out from the page's left edge, behind the portrait */}
            <Anchored section="about" x={(W) => -W * 0.58} z={-4} hideOnNarrow>
              <group rotation={[0, 0.55, 0]}>
                <ServerRacks />
              </group>
            </Anchored>

            {/* The developer at his desk, in the How I work section */}
            <Anchored section="workspace-stage" f={0.7} centerX z={0} scale={(W) => (W < 7 ? 1.55 : Math.min(2.25, W * 0.16))}>
              <group rotation={[0.28, 1.02, 0]}>
                <Workspace />
              </group>
            </Anchored>

            {/* One emblem per section, in the gap between its title and intro paragraph */}
            <Anchored section="career" top={190} x={emblemX(0.17)} y={emblemY(-0.35, 0.4)} z={0} scale={emblemScale(1.25)}>
              <Laptop />
            </Anchored>

            <Anchored section="skills" top={170} x={emblemX(0.17)} y={emblemY(0, 0.75)} z={-2} scale={emblemScale(0.6)}>
              <TechOrbit />
            </Anchored>

            <Anchored section="projects" top={190} x={emblemX(0.17)} y={emblemY(-0.3, 0.3)} z={0} scale={emblemScale(0.78)}>
              <DesktopComputer />
            </Anchored>

            {/* Vehicles cross the gaps between sections as you scroll */}
            <Drive section="workspace" top={24} scale={(W) => (W < 7 ? 0.55 : 0.85)}>
              {(ref) => <SportsCar ref={ref} />}
            </Drive>
            <Drive section="projects" top={24} direction={-1} scale={(W) => (W < 7 ? 0.55 : 0.85)}>
              {(ref) => <Motorbike ref={ref} />}
            </Drive>

            <Anchored section="contact" f={0.75} x={edge(-1, 2.2)} z={-2} hideOnNarrow>
              <SignalTower />
            </Anchored>
          </Suspense>
        </Canvas>
      </Boundary>
      {/* Keep the 3D in the background: darken it under the content columns. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgb(5_5_5/0.25),transparent)]" />
    </div>
  );
}
