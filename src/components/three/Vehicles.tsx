"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { glowTexture } from "./textures";
import { cameraY, sectionY, world, type SectionId } from "./world";

// Both vehicles are modelled facing +X with wheels touching y = 0.

export type VehicleHandle = { wheels: THREE.Object3D[]; radius: number; body: THREE.Object3D };

const PAINT = { color: "#d4a537", metalness: 0.9, roughness: 0.22 };
const BLACK = { color: "#0d0d0d", metalness: 0.6, roughness: 0.3 };
const TYRE = { color: "#111", roughness: 0.9 };

function Wheel({ r, w, rim = "#e8c46a" }: { r: number; w: number; rim?: string }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, w, 28]} />
        <meshStandardMaterial {...TYRE} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, (s * w) / 2 + s * 0.002]}>
          <mesh>
            <circleGeometry args={[r * 0.62, 24]} />
            <meshStandardMaterial color={rim} metalness={0.95} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          {/* Spokes, so rotation reads */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, s * 0.003]}>
              <boxGeometry args={[r * 0.12, r * 1.1, 0.004]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Low, wide sports car in royal gold. */
export const SportsCar = forwardRef<VehicleHandle>(function SportsCar(_, ref) {
  const wheels = useRef<THREE.Group[]>([]);
  const body = useRef<THREE.Group>(null!);
  const R = 0.2;
  useImperativeHandle(ref, () => ({ wheels: wheels.current, radius: R, body: body.current }));
  const beam = useMemo(() => glowTexture("rgba(255,236,190,0.9)", "rgba(255,220,150,0)"), []);

  return (
    <group>
      <group ref={body}>
        {/* Lower body */}
        <RoundedBox args={[2.2, 0.26, 0.94]} radius={0.1} position={[0, 0.31, 0]}>
          <meshStandardMaterial {...PAINT} />
        </RoundedBox>
        {/* Nose wedge */}
        <mesh position={[0.86, 0.4, 0]} rotation={[0, 0, -0.16]}>
          <boxGeometry args={[0.6, 0.06, 0.86]} />
          <meshStandardMaterial {...PAINT} />
        </mesh>
        {/* Cabin and glass */}
        <RoundedBox args={[0.82, 0.2, 0.74]} radius={0.09} position={[-0.18, 0.52, 0]}>
          <meshStandardMaterial color="#0b0b0c" metalness={0.95} roughness={0.08} />
        </RoundedBox>
        <mesh position={[0.36, 0.5, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.46, 0.02, 0.72]} />
          <meshStandardMaterial color="#0b0b0c" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[-0.72, 0.48, 0]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.42, 0.02, 0.72]} />
          <meshStandardMaterial color="#0b0b0c" metalness={0.95} roughness={0.08} />
        </mesh>
        {/* Spoiler */}
        <mesh position={[-1.02, 0.56, 0]}>
          <boxGeometry args={[0.18, 0.03, 0.9]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
        {[-0.32, 0.32].map((z) => (
          <mesh key={z} position={[-1.0, 0.49, z]}>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        ))}
        {/* Side intake stripe */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.05, 0.33, s * 0.462]}>
            <boxGeometry args={[1.1, 0.05, 0.005]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        ))}
        {/* Headlights and tail lights */}
        {[-0.3, 0.3].map((z) => (
          <group key={z}>
            <mesh position={[1.1, 0.36, z]}>
              <boxGeometry args={[0.04, 0.05, 0.2]} />
              <meshBasicMaterial color="#fff6e0" toneMapped={false} />
            </mesh>
            <mesh position={[-1.1, 0.36, z]}>
              <boxGeometry args={[0.03, 0.05, 0.24]} />
              <meshBasicMaterial color="#ff3030" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Headlight beam on the road ahead */}
        <sprite position={[1.9, 0.25, 0]} scale={[1.8, 0.5, 1]}>
          <spriteMaterial map={beam} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {/* Wheels */}
      {[
        [0.68, 0.43],
        [0.68, -0.43],
        [-0.68, 0.43],
        [-0.68, -0.43],
      ].map(([x, z], i) => (
        <group key={i} ref={(el) => void (wheels.current[i] = el!)} position={[x, R, z]}>
          <Wheel r={R} w={0.16} />
        </group>
      ))}
      {/* Under-glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.2, 0.9]} />
        <meshBasicMaterial color="#f5c451" transparent opacity={0.16} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
});

/** Sport motorbike: black frame, gold tank and fairing. */
export const Motorbike = forwardRef<VehicleHandle>(function Motorbike(_, ref) {
  const wheels = useRef<THREE.Group[]>([]);
  const body = useRef<THREE.Group>(null!);
  const R = 0.3;
  useImperativeHandle(ref, () => ({ wheels: wheels.current, radius: R, body: body.current }));
  const beam = useMemo(() => glowTexture("rgba(255,236,190,0.9)", "rgba(255,220,150,0)"), []);

  const tube = (from: [number, number, number], to: [number, number, number], r = 0.025, mat = BLACK) => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return (
      <mesh position={mid} quaternion={q}>
        <cylinderGeometry args={[r, r, len, 10]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    );
  };

  return (
    <group>
      <group ref={body}>
        {/* Frame: front fork, swingarm, spine */}
        {[-0.07, 0.07].map((z) => (
          <group key={z}>{tube([0.66, R, z], [0.48, 0.92, z], 0.022, { color: "#c9c4b8", metalness: 0.95, roughness: 0.2 })}</group>
        ))}
        {[-0.07, 0.07].map((z) => (
          <group key={z}>{tube([-0.66, R, z], [-0.05, 0.42, z], 0.026)}</group>
        ))}
        {tube([0.45, 0.88, 0], [-0.35, 0.66, 0], 0.04)}
        {/* Engine */}
        <RoundedBox args={[0.42, 0.3, 0.26]} radius={0.05} position={[0.02, 0.42, 0]}>
          <meshStandardMaterial color="#2c2b28" metalness={0.85} roughness={0.3} />
        </RoundedBox>
        {/* Tank */}
        <RoundedBox args={[0.5, 0.2, 0.32]} radius={0.09} position={[0.14, 0.78, 0]} rotation={[0, 0, -0.18]}>
          <meshStandardMaterial {...PAINT} />
        </RoundedBox>
        {/* Front fairing */}
        <mesh position={[0.5, 0.85, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.26, 0.12, 0.26]} />
          <meshStandardMaterial {...PAINT} />
        </mesh>
        {/* Seat and tail */}
        <RoundedBox args={[0.46, 0.08, 0.26]} radius={0.035} position={[-0.3, 0.74, 0]} rotation={[0, 0, 0.1]}>
          <meshStandardMaterial color="#141414" roughness={0.7} />
        </RoundedBox>
        <mesh position={[-0.6, 0.76, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.24, 0.06, 0.18]} />
          <meshStandardMaterial {...PAINT} />
        </mesh>
        {/* Handlebar */}
        {tube([0.44, 0.97, -0.26], [0.44, 0.97, 0.26], 0.018)}
        {/* Exhaust */}
        {tube([-0.05, 0.3, 0.17], [-0.62, 0.46, 0.17], 0.04, { color: "#9c968a", metalness: 0.95, roughness: 0.18 })}
        {/* Lights */}
        <mesh position={[0.62, 0.86, 0]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshBasicMaterial color="#fff6e0" toneMapped={false} />
        </mesh>
        <mesh position={[-0.72, 0.78, 0]}>
          <boxGeometry args={[0.03, 0.04, 0.1]} />
          <meshBasicMaterial color="#ff3030" toneMapped={false} />
        </mesh>
        <sprite position={[1.35, 0.5, 0]} scale={[1.3, 0.45, 1]}>
          <spriteMaterial map={beam} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {[0.66, -0.66].map((x, i) => (
        <group key={i} ref={(el) => void (wheels.current[i] = el!)} position={[x, R, 0]}>
          <Wheel r={R} w={0.11} />
        </group>
      ))}
    </group>
  );
});

/**
 * Drives a vehicle across the screen as its spot on the page scrolls through
 * view: it enters on one side as the spot rises from the bottom, and exits the
 * other as it reaches the top. Wheels spin to match the distance covered.
 */
export function Drive({
  section,
  top,
  direction = 1,
  scale = () => 1,
  z = 0,
  children,
}: {
  section: SectionId;
  /** Pixels below the section's top where the road runs. */
  top: number;
  /** 1 drives left to right, -1 right to left. */
  direction?: 1 | -1;
  scale?: (W: number) => number;
  z?: number;
  children: (ref: React.Ref<VehicleHandle>) => ReactNode;
}) {
  const g = useRef<THREE.Group>(null!);
  const road = useRef<THREE.Mesh>(null!);
  const vehicle = useRef<VehicleHandle>(null);
  const last = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const sy = sectionY(section, 0) - top * world.k;
    const d = sy - cameraY();
    const visible = Math.abs(d) < world.H;
    g.current.visible = visible;
    road.current.visible = visible;
    road.current.position.set(0, sy, z - 0.3);
    road.current.scale.x = world.W + 4;
    if (!visible) {
      last.current = null;
      return;
    }
    const s = scale(world.W);
    const p = THREE.MathUtils.clamp((d + world.H / 2) / world.H, 0, 1);
    const span = world.W / 2 + 1.6 * s;
    const x = THREE.MathUtils.lerp(-span, span, direction === 1 ? p : 1 - p);
    g.current.position.set(x, sy, z);
    g.current.scale.setScalar(s);
    g.current.rotation.y = direction === 1 ? 0 : Math.PI;

    const v = vehicle.current;
    if (!v) return;
    const moved = last.current === null ? 0 : (x - last.current) * direction;
    last.current = x;
    for (const w of v.wheels) if (w) w.rotation.z -= moved / (v.radius * s);
    // Idle engine shake, bigger when moving.
    const t = clock.elapsedTime;
    v.body.position.y = Math.sin(t * 38) * 0.004 + Math.min(0.02, Math.abs(moved) * 0.4) * Math.sin(t * 20);
    v.body.rotation.z = THREE.MathUtils.lerp(v.body.rotation.z, THREE.MathUtils.clamp(-moved * 0.6, -0.04, 0.04), 0.2);
  });

  return (
    <>
      {/* A thin gold road line under the vehicle, edge to edge */}
      <mesh ref={road}>
        <planeGeometry args={[1, 0.012]} />
        <meshBasicMaterial color="#f5c451" transparent opacity={0.28} toneMapped={false} depthWrite={false} />
      </mesh>
      <group ref={g}>{children(vehicle)}</group>
    </>
  );
}
