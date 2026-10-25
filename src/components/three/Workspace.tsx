"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { codeScreenTexture, terminalTexture } from "./textures";
import { isShown } from "./world";

// A stylised young developer at a dual-monitor desk. He's built facing +Z and
// then turned to face the monitors at -Z. All motion is procedural: a 16 s
// routine of typing, mouse work, a coffee sip and a stretch, with head nods
// to the music in his headphones throughout.

const SKIN = "#b07a52";
const HAIR = "#1a1412";
const HOODIE = "#6b665c";
const JOGGER = "#2c2c30";
const GOLD = "#f5c451";

type ArmPose = [number, number, number, number]; // shoulder x, shoulder z, elbow x, elbow z
type Pose = { lean: number; right: ArmPose; left: ArmPose; headY: number; headX: number };

const POSES: Record<"type" | "mouse" | "reach" | "sip" | "stretch", Pose> = {
  type: { lean: 0.16, right: [-0.62, 0.14, -1.0, 0], left: [-0.62, -0.14, -1.0, 0], headY: 0, headX: 0.12 },
  mouse: { lean: 0.12, right: [-0.55, -0.12, -1.05, 0.15], left: [-0.62, -0.14, -1.0, 0], headY: -0.05, headX: 0.1 },
  reach: { lean: 0.14, right: [-0.62, 0.14, -1.0, 0], left: [-0.7, -0.38, -0.7, 0], headY: 0.25, headX: 0.15 },
  sip: { lean: 0.02, right: [-0.62, 0.14, -1.0, 0], left: [-0.35, -0.1, -2.2, 0.15], headY: 0.15, headX: -0.08 },
  stretch: { lean: -0.18, right: [-2.9, 0.25, -0.15, 0], left: [-2.9, -0.25, -0.15, 0], headY: 0, headX: -0.25 },
};

// Routine (seconds within a 16 s loop).
function phaseAt(t: number): keyof typeof POSES {
  const s = t % 16;
  if (s < 5.5) return "type";
  if (s < 7.8) return "mouse";
  if (s < 8.6) return "reach";
  if (s < 10.6) return "sip";
  if (s < 11.2) return "reach";
  if (s < 13.2) return "type";
  if (s < 15) return "stretch";
  return "type";
}

const damp = THREE.MathUtils.damp;

function Developer({ mugRef }: { mugRef: React.RefObject<THREE.Group> }) {
  const spine = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const rS = useRef<THREE.Group>(null!);
  const rE = useRef<THREE.Group>(null!);
  const lS = useRef<THREE.Group>(null!);
  const lE = useRef<THREE.Group>(null!);
  const lHand = useRef<THREE.Mesh>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const blink = useRef({ next: 2, until: 0 });
  const grab = useRef(0);
  const tmp = useMemo(() => ({ hand: new THREE.Vector3(), rest: new THREE.Vector3() }), []);

  const m = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.85 }),
      hoodie: new THREE.MeshStandardMaterial({ color: HOODIE, roughness: 0.85 }),
      jogger: new THREE.MeshStandardMaterial({ color: JOGGER, roughness: 0.85 }),
      shoe: new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.5 }),
      sole: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.6, roughness: 0.35 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.25 }),
      dark: new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.4 }),
      white: new THREE.MeshStandardMaterial({ color: "#f5f1ea", roughness: 0.3 }),
      pupil: new THREE.MeshStandardMaterial({ color: "#1b0f0a", roughness: 0.2 }),
    }),
    [],
  );

  useFrame(({ clock }, dt) => {
    if (!isShown(spine.current)) return;
    const t = clock.elapsedTime;
    const phase = phaseAt(t);
    const p = POSES[phase];
    const k = 7;

    spine.current.rotation.x = damp(spine.current.rotation.x, p.lean, 4, dt);
    spine.current.position.y = 0.55 + Math.sin(t * 1.6) * 0.004;

    // Nodding to the music, a little harder while typing.
    const nod = Math.max(0, Math.sin(t * 6.2)) * (phase === "type" ? 0.07 : 0.035);
    let hy = p.headY;
    if (phase === "type") hy += Math.sin(t * 0.5) > 0.6 ? 0.32 : 0; // glance at the second monitor
    head.current.rotation.y = damp(head.current.rotation.y, hy, 4, dt);
    head.current.rotation.x = damp(head.current.rotation.x, p.headX + nod, 9, dt);

    const set = (s: THREE.Group, e: THREE.Group, a: ArmPose, ex = 0, ez = 0) => {
      s.rotation.x = damp(s.rotation.x, a[0], k, dt);
      s.rotation.z = damp(s.rotation.z, a[1], k, dt);
      e.rotation.x = damp(e.rotation.x, a[2] + ex, 14, dt);
      e.rotation.z = damp(e.rotation.z, a[3] + ez, 14, dt);
    };
    const typing = phase === "type";
    const rTap = typing ? Math.max(0, Math.sin(t * 13)) * 0.1 : 0;
    const lTap = typing || phase === "mouse" ? Math.max(0, Math.sin(t * 11 + 1.3)) * (typing ? 0.1 : 0.03) : 0;
    const mouseMove = phase === "mouse" ? Math.sin(t * 2.4) * 0.12 : 0;
    set(rS.current, rE.current, p.right, rTap, mouseMove);
    set(lS.current, lE.current, p.left, lTap);
    rS.current.rotation.y = phase === "mouse" ? Math.sin(t * 1.7) * 0.08 : 0;

    // Mug: rides in the left hand from the moment it's grabbed until it's set down.
    const holding = phase === "sip" || (phase === "reach" && (t % 16) > 10.6);
    grab.current = damp(grab.current, holding ? 1 : 0, holding ? 8 : 10, dt);
    const mug = mugRef.current;
    if (mug) {
      const rest = mug.userData.rest as THREE.Vector3 | undefined;
      if (!rest) mug.userData.rest = mug.position.clone();
      else {
        lHand.current.getWorldPosition(tmp.hand);
        mug.parent!.worldToLocal(tmp.hand);
        tmp.hand.setY(tmp.hand.y - 0.03);
        mug.position.copy(tmp.rest.copy(rest).lerp(tmp.hand, grab.current));
        mug.rotation.z = -grab.current * (phase === "sip" ? 0.5 : 0.1);
      }
    }

    // Blink.
    const b = blink.current;
    if (t > b.next) {
      b.until = t + 0.12;
      b.next = t + 2.5 + Math.random() * 3;
    }
    eyes.current.scale.y = damp(eyes.current.scale.y, t < b.until ? 0.1 : 1, 40, dt);
  });

  return (
    <group>
      {/* Seated legs */}
      <group position={[0, 0.5, 0]}>
        <RoundedBox args={[0.36, 0.14, 0.3]} radius={0.06} material={m.jogger} />
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 0, 0.02]}>
            <mesh material={m.jogger} position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.072, 0.34, 6, 12]} />
            </mesh>
            <mesh material={m.jogger} position={[0, -0.23, 0.43]}>
              <capsuleGeometry args={[0.062, 0.3, 6, 12]} />
            </mesh>
            {/* Sneakers */}
            <RoundedBox args={[0.11, 0.08, 0.24]} radius={0.035} position={[0, -0.46, 0.48]} material={m.shoe} />
            <mesh position={[0, -0.5, 0.48]} material={m.sole}>
              <boxGeometry args={[0.115, 0.018, 0.25]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Upper body pivots at the waist */}
      <group ref={spine} position={[0, 0.55, 0]}>
        {/* Hoodie torso */}
        <mesh material={m.hoodie} position={[0, 0.24, 0]} scale={[1.32, 1, 0.85]}>
          <capsuleGeometry args={[0.15, 0.22, 8, 20]} />
        </mesh>
        {/* Pocket and drawstrings */}
        <mesh material={m.jogger} position={[0, 0.12, 0.13]}>
          <boxGeometry args={[0.2, 0.08, 0.01]} />
        </mesh>
        {[-0.04, 0.04].map((x) => (
          <mesh key={x} material={m.gold} position={[x, 0.36, 0.135]}>
            <cylinderGeometry args={[0.005, 0.005, 0.12, 6]} />
          </mesh>
        ))}
        {/* Hood resting on the back */}
        <mesh material={m.hoodie} position={[0, 0.44, -0.11]} rotation={[-0.3, 0, 0]} scale={[1.45, 0.75, 0.7]}>
          <sphereGeometry args={[0.1, 20, 14]} />
        </mesh>
        <mesh material={m.skin} position={[0, 0.53, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.08, 14]} />
        </mesh>

        {/* Head: slightly oversized for the stylised look */}
        <group ref={head} position={[0, 0.57, 0.01]}>
          <group position={[0, 0.13, 0]}>
            <mesh material={m.skin} scale={[0.93, 1.05, 1]}>
              <sphereGeometry args={[0.13, 32, 24]} />
            </mesh>
            {/* Hair: covers the top and back of the head, with a swept fringe */}
            <mesh material={m.hair} position={[0, 0.005, -0.005]}>
              <sphereGeometry args={[0.137, 32, 16, Math.PI, Math.PI, 0, Math.PI * 0.78]} />
            </mesh>
            <mesh material={m.hair} position={[0, 0.03, -0.01]} scale={[0.98, 0.95, 1.02]}>
              <sphereGeometry args={[0.135, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            </mesh>
            <mesh material={m.hair} position={[0.02, 0.1, 0.07]} rotation={[0.6, 0.2, -0.3]} scale={[1.6, 0.5, 1]}>
              <sphereGeometry args={[0.06, 16, 12]} />
            </mesh>
            {/* Ears */}
            {[-1, 1].map((s) => (
              <mesh key={s} material={m.skin} position={[s * 0.12, -0.005, 0]} scale={[0.5, 1, 0.8]}>
                <sphereGeometry args={[0.03, 12, 10]} />
              </mesh>
            ))}
            {/* Headphones */}
            <mesh material={m.dark} rotation={[0, 0, 0]} position={[0, 0.02, -0.005]}>
              <torusGeometry args={[0.145, 0.014, 8, 40, Math.PI]} />
            </mesh>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.14, -0.01, 0]}>
                <mesh material={m.dark} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 20]} />
                </mesh>
                <mesh material={m.gold} position={[s * 0.021, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.005, 20]} />
                </mesh>
              </group>
            ))}
            {/* Face */}
            <group ref={eyes} position={[0, 0.005, 0]}>
              {[-1, 1].map((s) => (
                <group key={s} position={[s * 0.045, 0, 0.112]}>
                  <mesh material={m.white} scale={[1.15, 1.25, 0.6]}>
                    <sphereGeometry args={[0.02, 14, 10]} />
                  </mesh>
                  <mesh material={m.pupil} position={[0, -0.002, 0.011]}>
                    <sphereGeometry args={[0.012, 12, 10]} />
                  </mesh>
                </group>
              ))}
            </group>
            {[-1, 1].map((s) => (
              <mesh key={s} material={m.hair} position={[s * 0.046, 0.04, 0.118]} rotation={[0, 0, s * -0.1]}>
                <boxGeometry args={[0.04, 0.009, 0.008]} />
              </mesh>
            ))}
            <mesh material={m.skin} position={[0, -0.03, 0.128]} scale={[0.8, 1, 1]}>
              <sphereGeometry args={[0.02, 14, 10]} />
            </mesh>
            {/* A small smile */}
            <mesh material={m.pupil} position={[0, -0.068, 0.118]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.022, 0.004, 6, 16, Math.PI]} />
            </mesh>
          </group>
        </group>

        {/* Arms (his right is -X) */}
        <Arm side={-1} shoulder={rS} elbow={rE} m={m} />
        <Arm side={1} shoulder={lS} elbow={lE} hand={lHand} m={m} />
      </group>
    </group>
  );
}

function Arm({
  side,
  shoulder,
  elbow,
  hand,
  m,
}: {
  side: number;
  shoulder: React.RefObject<THREE.Group>;
  elbow: React.RefObject<THREE.Group>;
  hand?: React.RefObject<THREE.Mesh>;
  m: Record<string, THREE.Material>;
}) {
  return (
    <group ref={shoulder} position={[side * 0.22, 0.42, 0]}>
      <mesh material={m.hoodie}>
        <sphereGeometry args={[0.068, 16, 12]} />
      </mesh>
      <mesh material={m.hoodie} position={[0, -0.13, 0]}>
        <capsuleGeometry args={[0.058, 0.2, 6, 12]} />
      </mesh>
      <group ref={elbow} position={[0, -0.27, 0]}>
        <mesh material={m.hoodie} position={[0, -0.11, 0]}>
          <capsuleGeometry args={[0.05, 0.17, 6, 12]} />
        </mesh>
        <mesh material={m.gold} position={[0, -0.215, 0]}>
          <cylinderGeometry args={[0.046, 0.046, 0.02, 14]} />
        </mesh>
        <mesh ref={hand} material={m.skin} position={[0, -0.265, 0]} scale={[0.85, 1.1, 0.55]}>
          <sphereGeometry args={[0.05, 14, 12]} />
        </mesh>
      </group>
    </group>
  );
}

function Monitor({ texture, x, rotY }: { texture: THREE.Texture; x: number; rotY: number }) {
  return (
    <group position={[x, 0.75, -0.52]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#2a2925" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.17, -0.03]}>
        <boxGeometry args={[0.05, 0.3, 0.03]} />
        <meshStandardMaterial color="#2a2925" metalness={0.85} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.92, 0.56, 0.04]} radius={0.015} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.51, 0.021]}>
        <planeGeometry args={[0.87, 0.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.225, 0.021]}>
        <planeGeometry args={[0.92, 0.006]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Workspace() {
  const chair = useRef<THREE.Group>(null!);
  const mug = useRef<THREE.Group>(null!);
  const steam = useRef<THREE.Mesh>(null!);
  const code = useMemo(() => codeScreenTexture(), []);
  const term = useMemo(() => terminalTexture(), []);
  const lampTarget = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, dt) => {
    if (!isShown(chair.current)) return;
    const t = clock.elapsedTime;
    code.tick(dt);
    term.tick(dt);
    chair.current.rotation.y = Math.PI + Math.sin(t * 0.45) * 0.05;
    const s = steam.current;
    s.position.y = 0.13 + ((t * 0.12) % 0.12);
    (s.material as THREE.MeshBasicMaterial).opacity = 0.25 * (1 - ((t * 0.12) % 0.12) / 0.12);
  });

  return (
    <group>
      {/* Floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -0.1]}>
        <circleGeometry args={[1.05, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.07} toneMapped={false} depthWrite={false} />
      </mesh>

      {/* Gold rim light from behind, so he separates from the black page */}
      <pointLight position={[-0.6, 1.6, 1.2]} intensity={6} distance={4} decay={1.3} color="#ffd98a" />
      <pointLight position={[1.2, 1.4, -0.4]} intensity={3} distance={4} decay={1.4} color="#fff2dc" />

      {/* Desk */}
      <RoundedBox args={[1.9, 0.045, 0.75]} radius={0.015} position={[0, 0.72, -0.42]}>
        <meshStandardMaterial color="#1c1a17" metalness={0.3} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.744, -0.045]}>
        <boxGeometry args={[1.9, 0.004, 0.01]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      {[-0.88, 0.88].map((x) => (
        <mesh key={x} position={[x, 0.35, -0.42]}>
          <boxGeometry args={[0.05, 0.7, 0.6]} />
          <meshStandardMaterial color="#141414" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      <Monitor texture={code.texture} x={-0.38} rotY={0.12} />
      <Monitor texture={term.texture} x={0.52} rotY={-0.22} />

      {/* Keyboard, mouse pad and mouse */}
      <RoundedBox args={[0.5, 0.025, 0.16]} radius={0.01} position={[0, 0.755, -0.2]}>
        <meshStandardMaterial color="#232120" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {Array.from({ length: 4 }, (_, r) => (
        <mesh key={r} position={[0, 0.769, -0.255 + r * 0.037]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.46, 0.026]} />
          <meshStandardMaterial color="#3a3630" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.4, 0.745, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24, 0.2]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.76, -0.2]} scale={[1, 0.5, 1.5]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshStandardMaterial color="#2a2825" metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Coffee mug (picked up during the sip) */}
      <group ref={mug} position={[-0.5, 0.745, -0.15]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.036, 0.1, 20]} />
          <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.036, 20]} />
          <meshStandardMaterial color="#3b2414" roughness={0.3} />
        </mesh>
        <mesh position={[0.045, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh ref={steam} position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      </group>

      {/* Desk lamp */}
      <group position={[-0.82, 0.745, -0.6]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.08, 0.02, 24]} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.03, 0.2, 0.03]} rotation={[0.15, 0, -0.18]}>
          <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>
        <group position={[0.1, 0.4, 0.1]} rotation={[0.55, 0, -0.75]}>
          <mesh>
            <coneGeometry args={[0.08, 0.12, 24, 1, true]} />
            <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.03, 16, 12]} />
            <meshBasicMaterial color="#fff4d6" toneMapped={false} />
          </mesh>
        </group>
        <primitive object={lampTarget} position={[0.6, -0.75, 0.6]} />
        <spotLight position={[0.12, 0.36, 0.12]} target={lampTarget} angle={0.8} penumbra={0.7} intensity={5} distance={2.5} decay={1.4} color="#ffd98a" />
      </group>

      {/* Plant */}
      <group position={[0.85, 0.745, -0.68]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.12, 20]} />
          <meshStandardMaterial color="#e9e3d6" roughness={0.9} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i) * 0.03, 0.18 + (i % 3) * 0.03, Math.sin(i) * 0.03]} rotation={[Math.cos(i * 2) * 0.6, i, Math.sin(i * 2) * 0.6]} scale={[1, 2.4, 0.3]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? "#3a8a5f" : "#2c6e4c"} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Gaming chair with the developer, facing the desk */}
      <group ref={chair} position={[0, 0, 0.32]} rotation={[0, Math.PI, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]} position={[0, 0.05, 0]}>
            <boxGeometry args={[0.035, 0.025, 0.56]} />
            <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.36, 12]} />
          <meshStandardMaterial color="#8b8577" metalness={0.9} roughness={0.25} />
        </mesh>
        <RoundedBox args={[0.5, 0.07, 0.46]} radius={0.03} position={[0, 0.45, 0.02]}>
          <meshStandardMaterial color="#1d1d1f" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.46, 0.7, 0.07]} radius={0.04} position={[0, 0.88, -0.23]} rotation={[-0.12, 0, 0]}>
          <meshStandardMaterial color="#1d1d1f" roughness={0.75} />
        </RoundedBox>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.88, -0.19]} rotation={[-0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.62, 0.005]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
        ))}
        <Developer mugRef={mug} />
      </group>
    </group>
  );
}
