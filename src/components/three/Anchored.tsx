"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraY, sectionCenterX, sectionY, world, type SectionId } from "./world";

/**
 * Pins its children to a page section. `x` is a function of the visible width
 * so scenes can hug an edge on any screen. Hidden when far from view.
 */
export function Anchored({
  section,
  f = 0.5,
  top,
  x = () => 0,
  centerX = false,
  y = 0,
  z = 0,
  scale = () => 1,
  hideOnNarrow = false,
  children,
}: {
  section: SectionId;
  /** Fraction of the way down the section. */
  f?: number;
  /** Pixels below the section's top; overrides `f`. */
  top?: number;
  x?: (W: number) => number;
  /** Centre horizontally on the section element itself (adds to x). */
  centerX?: boolean;
  /** World-unit nudge; a function of the visible width when it differs by screen. */
  y?: number | ((W: number) => number);
  z?: number;
  scale?: (W: number) => number;
  hideOnNarrow?: boolean;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const sy = (top === undefined ? sectionY(section, f) : sectionY(section, 0) - top * world.k) + (typeof y === "function" ? y(world.W) : y);
    g.current.position.set(x(world.W) + (centerX ? sectionCenterX(section) : 0), sy, z);
    g.current.scale.setScalar(scale(world.W));
    // Skip drawing when more than ~1.5 screens away.
    g.current.visible = !(hideOnNarrow && world.narrow) && Math.abs(sy - cameraY()) < world.H * 1.6 + Math.abs(z) * 0.6;
  });
  return <group ref={g}>{children}</group>;
}
