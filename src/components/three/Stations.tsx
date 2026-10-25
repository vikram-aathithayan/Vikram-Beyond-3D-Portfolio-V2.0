"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  SiClaude,
  SiDocker,
  SiExpress,
  SiGit,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPostman,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import { LuOrbit } from "react-icons/lu";
import { chipTexture, glowTexture } from "./textures";
import { seeded } from "./Globe";
import { isShown } from "./world";

const ORANGE = new THREE.Color("#f5c451");
const AMBER = new THREE.Color("#c9963a");
const TEAL = new THREE.Color("#2fd3a4");
const OFF = new THREE.Color("#1e1a12");

// ---------------------------------------------------------------------------
// About: server racks with blinking status LEDs

export function ServerRacks() {
  const leds = useRef<THREE.InstancedMesh>(null!);
  const RACKS = 3;
  const PER = 14;
  const layout = useMemo(() => {
    const out: { x: number; y: number; z: number; rate: number; color: THREE.Color }[] = [];
    const rnd = seeded(5);
    for (let r = 0; r < RACKS; r++) {
      for (let u = 0; u < PER; u++) {
        for (let l = 0; l < 2; l++) {
          out.push({
            x: (r - 1) * 1.25 + 0.32 + l * 0.09,
            y: -1.45 + u * 0.21,
            z: 0.52,
            rate: 1 + rnd() * 6,
            color: rnd() < 0.2 ? TEAL : rnd() < 0.5 ? AMBER : ORANGE,
          });
        }
      }
    }
    return out;
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    layout.forEach((l, i) => {
      tmp.position.set(l.x, l.y, l.z);
      tmp.updateMatrix();
      leds.current.setMatrixAt(i, tmp.matrix);
    });
    leds.current.instanceMatrix.needsUpdate = true;
  }, [layout, tmp]);

  useFrame(({ clock }) => {
    if (!isShown(leds.current)) return;
    const t = clock.elapsedTime;
    layout.forEach((l, i) => {
      const on = Math.sin(t * l.rate + i) > 0.2;
      leds.current.setColorAt(i, on ? l.color : c.copy(OFF));
    });
    if (leds.current.instanceColor) leds.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {Array.from({ length: RACKS }, (_, r) => (
        <group key={r} position={[(r - 1) * 1.25, 0, 0]}>
          <RoundedBox args={[1.1, 3.3, 1]} radius={0.04}>
            <meshStandardMaterial color="#121212" metalness={0.7} roughness={0.35} />
          </RoundedBox>
          {Array.from({ length: PER }, (_, u) => (
            <mesh key={u} position={[0, -1.45 + u * 0.21, 0.505]}>
              <boxGeometry args={[0.96, 0.16, 0.02]} />
              <meshStandardMaterial color="#1b1a18" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={leds} args={[undefined, undefined, layout.length]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <pointLight position={[0, 0, 2]} intensity={6} distance={6} color="#f5c451" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Skills: a tech universe, the stack orbiting a glowing core

const ORBITS = [
  { r: 1.5, speed: 0.35, tilt: [0.3, 0, 0.1], icons: [SiNodedotjs, SiNextdotjs, SiPostgresql, SiExpress] },
  { r: 2.4, speed: -0.22, tilt: [-0.2, 0, -0.25], icons: [SiReact, SiTypescript, SiJavascript, SiClaude] },
  { r: 3.3, speed: 0.14, tilt: [0.15, 0, 0.3], icons: [SiDocker, SiGit, SiPostman, LuOrbit] },
] as const;

export function TechOrbit() {
  const core = useRef<THREE.Mesh>(null!);
  const rings = useRef<THREE.Group[]>([]);
  const textures = useMemo(
    () => ORBITS.map((o, oi) => o.icons.map((Icon, i) => chipTexture(Icon, `orbit-${oi}-${i}`))),
    [],
  );
  const glow = useMemo(() => glowTexture(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    core.current.rotation.y += dt * 0.4;
    core.current.rotation.x += dt * 0.2;
    rings.current.forEach((g, i) => g && (g.rotation.y = t * ORBITS[i].speed));
  });
  return (
    <group>
      <sprite scale={[3.2, 3.2, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#ffd76e" wireframe transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshBasicMaterial color="#fff1c9" toneMapped={false} />
      </mesh>
      {ORBITS.map((o, oi) => (
        <group key={oi} rotation={o.tilt as unknown as THREE.Euler}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[o.r, 0.006, 6, 180]} />
            <meshBasicMaterial color="#d4a537" transparent opacity={0.35} />
          </mesh>
          <group ref={(el) => void (rings.current[oi] = el!)}>
            {textures[oi].map((tex, i) => {
              const a = (i / textures[oi].length) * Math.PI * 2;
              return (
                <Billboard key={i} position={[Math.cos(a) * o.r, 0, Math.sin(a) * o.r]}>
                  <mesh>
                    <planeGeometry args={[0.55, 0.55]} />
                    <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
                  </mesh>
                </Billboard>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Contact: a signal tower broadcasting rings

export function SignalTower() {
  const rings = useRef<THREE.Mesh[]>([]);
  const N = 4;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.35 + i / N) % 1;
      m.scale.setScalar(0.3 + p * 3.2);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });
  });
  return (
    <group>
      {/* Lattice mast */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.18, -0.9, 0]} rotation={[0, 0, s * -0.1]}>
          <cylinderGeometry args={[0.025, 0.035, 2.6, 6]} />
          <meshStandardMaterial color="#3a3428" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, -2 + i * 0.4, 0]} rotation={[0, 0, i % 2 ? 0.9 : -0.9]}>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 4]} />
          <meshStandardMaterial color="#3a3428" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshBasicMaterial color="#fff1c9" toneMapped={false} />
      </mesh>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i} ref={(el) => void (rings.current[i] = el!)} position={[0, 0.5, 0]}>
          <torusGeometry args={[0.5, 0.012, 6, 96]} />
          <meshBasicMaterial color="#f5c451" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Everywhere: data particles drifting upward

export function DataDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, speeds } = useMemo(() => {
    const rnd = seeded(99);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.set([(rnd() - 0.5) * 26, (rnd() - 0.5) * 14, -2 - rnd() * 12], i * 3);
      speeds[i] = 0.08 + rnd() * 0.25;
    }
    return { positions, speeds };
  }, [count]);
  useFrame((state, dt) => {
    // The field follows the camera vertically and wraps, so it never runs out.
    const cy = state.camera.position.y;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + speeds[i] * dt;
      // Keep within ±7 of the camera; scrolling makes particles stream past.
      if (y - cy > 7) y -= 14;
      if (y - cy < -7) y += 14;
      arr[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#f7d27a" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}
