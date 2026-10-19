'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Loop length in seconds - everything is driven from animTime. */
const LOOP = 16;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Emissive highlight applied to a part's materials when it is selected. */
function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function PartGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

const F1_Y = 2.35;
const BETA_ANGLES = [60, 180, 300].map((d) => (d * Math.PI) / 180);
const ALPHA_ANGLES = [0, 120, 240].map((d) => (d * Math.PI) / 180);
const betaPos = (i: number): [number, number, number] => [
  1.02 * Math.cos(BETA_ANGLES[i]),
  F1_Y,
  1.02 * Math.sin(BETA_ANGLES[i]),
];

export default function AtpSynthase(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const cycle = (animTime % LOOP + LOOP) % LOOP;

  // One rotor revolution per 6 s; gamma shaft is coupled to the c-ring.
  const rot = (animTime * Math.PI * 2) / 6;
  // Binding change: the three beta subunits take turns flashing catalytic.
  const activeBeta = Math.floor((cycle % 6) / 2) % 3;

  // c-ring subunits arranged around the rim.
  const ringSubs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI * 2) / 10;
        return [0.7 * Math.cos(a), 0, 0.7 * Math.sin(a)] as [number, number, number];
      }),
    [],
  );

  // Protons flowing down through the F0 channel (intermembrane space -> matrix).
  const protons = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let kk = 0; kk < 6; kk += 1) {
      const pr = (cycle / LOOP + kk / 6) % 1;
      out.push({ pos: [0.62, lerp(1.55, -1.5, pr), 0.25] });
    }
    return out;
  }, [cycle]);

  // ADP + Pi drifting into the active beta; fresh ATP drifting out.
  const adpIn = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const pr = (cycle / 4 + i / 3 + 0.5) % 1;
        const b = betaPos(i);
        return {
          pos: [lerp(b[0] - 1.9, b[0], smooth(pr)), lerp(b[1] - 0.4, b[1], smooth(pr)), lerp(b[2] - 0.7, b[2], smooth(pr))] as [
            number,
            number,
            number,
          ],
          op: 0.35 + pr * 0.65,
        };
      }),
    [cycle],
  );
  const atpOut = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const pr = (cycle / 4 + i / 3) % 1;
        const b = betaPos(i);
        return {
          pos: [lerp(b[0], b[0] + 1.35, pr), lerp(b[1], b[1] + 1.5, pr), lerp(b[2], b[2] + 0.7, pr)] as [number, number, number],
          op: 1 - pr,
        };
      }),
    [cycle],
  );

  return (
    <group>
      {/* ---- inner membrane slab ---- */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7, 0.35, 7]} />
        <meshStandardMaterial color="#fb7185" roughness={0.5} metalness={0.05} />
      </mesh>
      {showLabels && (
        <Html position={[3.15, -0.25, 2.2]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Inner membrane</span>
        </Html>
      )}

      {/* ---- F0 base + c-ring rotor (explode downward) ---- */}
      <PartGroup id="f0-base" position={[0, -explode * 1.1, 0]} onSelect={onSelect}>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.02, 1.02, 0.55, 28]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.12} {...emissiveProps(sel('f0-base'))} />
        </mesh>
        <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.02, 0.055, 10, 40]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.12} {...emissiveProps(sel('f0-base'))} />
        </mesh>
        {showLabels && <PartLabel position={[-2.15, -0.35, 0]} name="F0 base" />}
      </PartGroup>

      <PartGroup id="c-ring" position={[0, -explode * 1.1, 0]} onSelect={onSelect}>
        <group position={[0, -0.05, 0]} rotation={[0, rot, 0]}>
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 0.5, 24]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.35} metalness={0.15} {...emissiveProps(sel('c-ring'))} />
          </mesh>
          {ringSubs.map((p, i) => (
            <mesh key={i} position={p}>
              <boxGeometry args={[0.16, 0.52, 0.16]} />
              <meshStandardMaterial color="#fde68a" roughness={0.35} metalness={0.15} {...emissiveProps(sel('c-ring'))} />
            </mesh>
          ))}
          {/* marker bead so the spin is visible */}
          <mesh position={[0.7, 0.32, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshBasicMaterial color="#fff7ed" />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[2.05, 0.15, 0.6]} name="c-ring rotor" />}
      </PartGroup>

      {/* ---- gamma shaft (coupled to the rotor, explode downward) ---- */}
      <PartGroup id="gamma-shaft" position={[0, -explode * 1.1, 0]} onSelect={onSelect}>
        <group rotation={[0, rot, 0]}>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.14, 0.14, 2.1, 14]} />
            <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.15} {...emissiveProps(sel('gamma-shaft'))} />
          </mesh>
          <mesh position={[0.17, 2.0, 0]}>
            <sphereGeometry args={[0.2, 14, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.15} {...emissiveProps(sel('gamma-shaft'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[-1.85, 1.5, 0]} name="Gamma shaft" />}
      </PartGroup>

      {/* ---- proton channel through F0 ---- */}
      <PartGroup id="proton-channel" position={[0, -explode * 1.1, 0]} onSelect={onSelect}>
        <mesh position={[0.62, 0.55, 0.25]}>
          <cylinderGeometry args={[0.15, 0.15, 1.7, 14]} />
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={0.35}
            emissive={sel('proton-channel') ? '#38bdf8' : '#22d3ee'}
            emissiveIntensity={sel('proton-channel') ? 0.4 : 0.5}
            depthWrite={false}
          />
        </mesh>
        {protons.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.55, -1.35, 0.9]} name="Proton flow" />}
      </PartGroup>

      {/* ---- F1 catalytic head (explode upward) ---- */}
      <PartGroup id="f1-head" position={[0, explode * 1.6, 0]} onSelect={onSelect}>
        {ALPHA_ANGLES.map((a, i) => (
          <mesh key={`a${i}`} position={[1.02 * Math.cos(a), F1_Y, 1.02 * Math.sin(a)]}>
            <sphereGeometry args={[0.6, 24, 18]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.35} metalness={0.1} {...emissiveProps(sel('f1-head'))} />
          </mesh>
        ))}
        {BETA_ANGLES.map((a, i) => {
          const catalytic = i === activeBeta;
          return (
            <mesh key={`b${i}`} position={[1.02 * Math.cos(a), F1_Y, 1.02 * Math.sin(a)]} scale={catalytic ? 1.1 : 1}>
              <sphereGeometry args={[0.6, 24, 18]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive={sel('f1-head') ? '#38bdf8' : '#f59e0b'}
                emissiveIntensity={sel('f1-head') ? 0.4 : catalytic ? 0.95 : 0.25}
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>
          );
        })}
        {adpIn.map((p, i) => (
          <mesh key={`d${i}`} position={p.pos}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={p.op} roughness={0.4} />
          </mesh>
        ))}
        {atpOut.map((p, i) => (
          <mesh key={`t${i}`} position={p.pos}>
            <sphereGeometry args={[0.15, 12, 10]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.95} transparent opacity={p.op} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[2.0, 3.35, 0]} name="F1 head" />}
      </PartGroup>

      {/* ---- peripheral stalk (stator, explode upward) ---- */}
      <PartGroup id="peripheral-stalk" position={[0, explode * 1.1, 0]} onSelect={onSelect}>
        <mesh position={[1.35, 1.05, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 2.3, 12]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.2} {...emissiveProps(sel('peripheral-stalk'))} />
        </mesh>
        <mesh position={[1.28, 2.12, 0]}>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.2} {...emissiveProps(sel('peripheral-stalk'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.35, 2.35, -1.1]} name="Peripheral stalk" />}
      </PartGroup>

      {/* ---- ATP release marker ---- */}
      <PartGroup id="atp" position={[0, explode * 1.6, 0]} onSelect={onSelect}>
        {showLabels && <PartLabel position={[-2.0, 3.35, 0]} name="ATP out" />}
      </PartGroup>
    </group>
  );
}
