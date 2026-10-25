"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { SiClaude, SiDocker, SiExpress, SiNextdotjs, SiNodedotjs, SiPostgresql, SiReact, SiTypescript } from "react-icons/si";
import { chipTexture, glowTexture } from "./textures";
import { level } from "@/components/hero/introStore";

// Hero: a network globe. Points for continents-of-data, arcs for connections,
// packets travelling along them, and the stack orbiting on a ring.

const R = 1;
const CHIPS = [
  { Icon: SiNodedotjs, key: "node" },
  { Icon: SiNextdotjs, key: "next" },
  { Icon: SiPostgresql, key: "postgres" },
  { Icon: SiExpress, key: "express" },
  { Icon: SiReact, key: "react" },
  { Icon: SiTypescript, key: "ts" },
  { Icon: SiDocker, key: "docker" },
  { Icon: SiClaude, key: "claude" },
];

function fibonacciSphere(n: number, r: number) {
  const out = new Float32Array(n * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = phi * i;
    out.set([Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r], i * 3);
  }
  return out;
}

const arcMaterial = new THREE.LineBasicMaterial({ color: "#f5c451", transparent: true, opacity: 0.5 });

export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export function Globe({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const spin = useRef<THREE.Group>(null!);
  const tilt = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);
  const packets = useRef<THREE.InstancedMesh>(null!);
  const talk = useRef(0);

  const points = useMemo(() => fibonacciSphere(1400, R), []);
  const arcs = useMemo(() => {
    const rnd = seeded(11);
    const v = () => new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(R);
    return Array.from({ length: 14 }, () => {
      const a = v();
      const b = v();
      const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.25 + a.distanceTo(b) * 0.25));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), arcMaterial);
      return { curve, line, speed: 0.15 + rnd() * 0.25, off: rnd() };
    });
  }, []);
  const chips = useMemo(() => CHIPS.map((c) => chipTexture(c.Icon, c.key)), []);
  const glow = useMemo(() => glowTexture("rgba(245,196,81,0.55)", "rgba(201,150,58,0)"), []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    // While Vikram speaks, the globe pulses with his voice and spins faster.
    const v = level.value;
    talk.current = THREE.MathUtils.damp(talk.current, v, 10, dt);
    spin.current.rotation.y += dt * (0.12 + talk.current * 0.9);
    tilt.current.scale.setScalar(1 + talk.current * 0.07);
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, 0.25 - pointer.current.y * 0.25, 3, dt);
    tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, -pointer.current.x * 0.2, 3, dt);
    ring.current.rotation.y = -t * 0.25;
    arcs.forEach((a, i) => {
      tmp.position.copy(a.curve.getPoint((t * a.speed + a.off) % 1, point));
      tmp.updateMatrix();
      packets.current.setMatrixAt(i, tmp.matrix);
    });
    packets.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={tilt}>
      <sprite scale={[R * 4.2, R * 4.2, 1]} position={[0, 0, -0.6]}>
        <spriteMaterial map={glow} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={spin}>
        {/* Dark core so points on the far side read as behind */}
        <mesh>
          <sphereGeometry args={[R * 0.985, 48, 32]} />
          <meshBasicMaterial color="#0a0805" transparent opacity={0.88} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.035} color="#ffd76e" transparent opacity={1} sizeAttenuation depthWrite={false} toneMapped={false} />
        </points>
        {[0.35, 0.7, 1].map((s, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, (i - 1) * 0.55 * R, 0]}>
            <torusGeometry args={[R * Math.sqrt(1 - ((i - 1) * 0.55) ** 2) * 1.002, 0.0025, 6, 120]} />
            <meshBasicMaterial color="#c9963a" transparent opacity={0.25 * s + 0.15} />
          </mesh>
        ))}
        {arcs.map((a, i) => (
          <primitive key={i} object={a.line} />
        ))}
        <instancedMesh ref={packets} args={[undefined, undefined, arcs.length]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshBasicMaterial color="#fff1c9" toneMapped={false} />
        </instancedMesh>
      </group>

      {/* Stack orbit */}
      <group rotation={[0.35, 0, -0.18]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.75, 0.004, 6, 160]} />
          <meshBasicMaterial color="#d4a537" transparent opacity={0.5} />
        </mesh>
        <group ref={ring}>
          {chips.map((tex, i) => {
            const a = (i / chips.length) * Math.PI * 2;
            return (
              <Billboard key={i} position={[Math.cos(a) * R * 1.75, 0, Math.sin(a) * R * 1.75]}>
                <mesh>
                  <planeGeometry args={[0.36, 0.36]} />
                  <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
                </mesh>
              </Billboard>
            );
          })}
        </group>
      </group>
    </group>
  );
}
