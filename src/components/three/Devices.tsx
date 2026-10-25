"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { codeScreenTexture } from "./textures";
import { isShown } from "./world";

const ALU = { color: "#3a3833", metalness: 0.85, roughness: 0.28 };
const DARK = { color: "#151413", metalness: 0.5, roughness: 0.45 };
const GOLD = "#f5c451";

/** A laptop with live Node.js code on screen, floating and slowly turning. */
export function Laptop() {
  const root = useRef<THREE.Group>(null!);
  const lid = useRef<THREE.Group>(null!);
  const screen = useMemo(() => codeScreenTexture(), []);

  useFrame(({ clock }, dt) => {
    if (!isShown(root.current)) return;
    const t = clock.elapsedTime;
    screen.tick(dt);
    root.current.position.y = Math.sin(t * 1.1) * 0.06;
    root.current.rotation.y = 0.3 + Math.sin(t * 0.4) * 0.15;
    // The lid breathes open a few degrees.
    lid.current.rotation.x = -1.85 + Math.sin(t * 0.8) * 0.04;
  });

  return (
    <group ref={root} rotation={[0.28, 0, 0]}>
      {/* Base */}
      <RoundedBox args={[1.5, 0.06, 1.02]} radius={0.025}>
        <meshStandardMaterial {...ALU} />
      </RoundedBox>
      <mesh position={[0, 0.031, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.32, 0.5]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* Key rows */}
      {Array.from({ length: 4 }, (_, r) => (
        <mesh key={r} position={[0, 0.034, -0.12 + r * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.22, 0.07]} />
          <meshStandardMaterial color="#232120" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.46, 0.16]} />
        <meshStandardMaterial color="#2b2925" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Gold edge light */}
      <mesh position={[0, -0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.52, 1.04]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.18} toneMapped={false} />
      </mesh>

      {/* Lid, hinged on the back edge */}
      <group ref={lid} position={[0, 0.03, -0.5]} rotation={[-1.85, 0, 0]}>
        <RoundedBox args={[1.5, 0.04, 1.0]} radius={0.02} position={[0, 0, 0.5]}>
          <meshStandardMaterial {...ALU} />
        </RoundedBox>
        <mesh position={[0, -0.022, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.38, 0.88]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        {/* Logo glow on the back */}
        <mesh position={[0, 0.021, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 24]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0.2]} intensity={2.5} distance={3} color="#ffe2a0" />
    </group>
  );
}

/** A desktop workstation: monitor with code, keyboard, mouse and a glass tower with spinning fans. */
export function DesktopComputer() {
  const root = useRef<THREE.Group>(null!);
  const fans = useRef<THREE.Group[]>([]);
  const led = useRef<THREE.MeshBasicMaterial>(null!);
  const screen = useMemo(() => codeScreenTexture(), []);

  useFrame(({ clock }, dt) => {
    if (!isShown(root.current)) return;
    const t = clock.elapsedTime;
    screen.tick(dt);
    root.current.rotation.y = 0.45 + Math.sin(t * 0.35) * 0.12;
    root.current.position.y = Math.sin(t * 0.9) * 0.04;
    fans.current.forEach((f) => f && (f.rotation.z -= dt * 6));
    led.current.color.setHSL(0.12, 0.9, 0.45 + Math.sin(t * 2.2) * 0.15);
  });

  return (
    <group ref={root} rotation={[0.18, 0, 0]}>
      {/* Desk slab */}
      <RoundedBox args={[3.2, 0.06, 1.4]} radius={0.02} position={[0.2, -0.03, 0]}>
        <meshStandardMaterial color="#1a1917" metalness={0.3} roughness={0.55} />
      </RoundedBox>

      {/* Monitor */}
      <group position={[-0.2, 0, -0.2]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.03, 32]} />
          <meshStandardMaterial {...ALU} />
        </mesh>
        <mesh position={[0, 0.3, -0.04]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.08, 0.55, 0.05]} />
          <meshStandardMaterial {...ALU} />
        </mesh>
        <RoundedBox args={[1.9, 1.12, 0.06]} radius={0.03} position={[0, 0.92, 0]}>
          <meshStandardMaterial {...DARK} />
        </RoundedBox>
        <mesh position={[0, 0.94, 0.032]}>
          <planeGeometry args={[1.8, 1.02]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.37, 0.032]}>
          <planeGeometry args={[1.9, 0.012]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      </group>

      {/* Keyboard and mouse */}
      <RoundedBox args={[1.2, 0.04, 0.36]} radius={0.015} position={[-0.25, 0.02, 0.4]}>
        <meshStandardMaterial color="#232120" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {Array.from({ length: 4 }, (_, r) => (
        <mesh key={r} position={[-0.25, 0.042, 0.28 + r * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1, 0.055]} />
          <meshStandardMaterial color="#34312c" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.55, 0.035, 0.42]} scale={[1, 0.55, 1.5]}>
        <sphereGeometry args={[0.08, 20, 14]} />
        <meshStandardMaterial color="#2a2825" metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Tower with a glass side panel */}
      <group position={[1.35, 0.6, -0.15]}>
        <RoundedBox args={[0.55, 1.2, 1.0]} radius={0.03}>
          <meshStandardMaterial color="#161514" metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <mesh position={[-0.28, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 1.1]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.05} transparent opacity={0.55} />
        </mesh>
        {[0.28, -0.08].map((y, i) => (
          <group key={i} ref={(el) => void (fans.current[i] = el!)} position={[-0.26, y, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh>
              <torusGeometry args={[0.16, 0.012, 8, 40]} />
              <meshBasicMaterial color={GOLD} toneMapped={false} />
            </mesh>
            {Array.from({ length: 5 }, (_, b) => (
              <mesh key={b} rotation={[0, 0, (b / 5) * Math.PI * 2]} position={[0, 0, 0]}>
                <boxGeometry args={[0.025, 0.24, 0.005]} />
                <meshStandardMaterial color="#3b3730" metalness={0.5} roughness={0.4} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, 0.45, 0.505]}>
          <planeGeometry args={[0.04, 0.18]} />
          <meshBasicMaterial ref={led} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 1.2, 1.2]} intensity={3} distance={4} color="#ffe2a0" />
    </group>
  );
}
