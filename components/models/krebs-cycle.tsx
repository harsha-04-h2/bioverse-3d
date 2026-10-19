'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Loop length in seconds - everything is driven from animTime. */
const LOOP = 24;

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

const R = 2.7;

const npos = (i: number): [number, number, number] => {
  const a = Math.PI / 2 - (i * Math.PI * 2) / 8;
  return [R * Math.cos(a), R * Math.sin(a), 0];
};

const outward = (p: [number, number, number]): [number, number, number] => {
  const l = Math.hypot(p[0], p[1]) || 1;
  return [p[0] / l, p[1] / l, 0];
};

// [enzyme name] - intermediate names live in the label descriptions.
const STEPS: string[] = [
  'Citrate synthase',
  'Aconitase',
  'Isocitrate dehydrogenase',
  'Alpha-ketoglutarate dehydrogenase',
  'Succinyl-CoA synthetase',
  'Succinate dehydrogenase',
  'Fumarase',
  'Malate dehydrogenase',
];

const PROD_COLORS: Record<string, string> = {
  co2: '#f8fafc',
  nadh: '#a3e635',
  fadh2: '#4ade80',
  gtp: '#fbbf24',
};

export default function KrebsCycle(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // 0..8 across the loop: step k is active while fp in [k, k+1).
  const fp = (((animTime % LOOP) + LOOP) % LOOP / LOOP) * 8;
  const activeIdx = Math.min(7, Math.floor(fp));

  const ringPoints = useMemo(() => [...Array(9)].map((_, i) => npos(i % 8)), []);

  // Direction arrows on each edge of the ring.
  const arrows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = new THREE.Vector3(...npos(i));
        const b = new THREE.Vector3(...npos((i + 1) % 8));
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return { pos: [mid.x, mid.y, mid.z] as [number, number, number], quat };
      }),
    [],
  );

  // The glowing carrier travelling around the ring.
  const ck = Math.min(7, Math.floor(fp));
  const cl = smooth(fp - ck);
  const cA = npos(ck);
  const cB = npos((ck + 1) % 8);
  const carrier: [number, number, number] = [lerp(cA[0], cB[0], cl), lerp(cA[1], cB[1], cl), 0];

  // Acetyl-CoA flying into step 1 at the start of each turn.
  const acetylW = fp - 0;
  const acetyl =
    acetylW >= 0 && acetylW <= 1
      ? (() => {
          const p = npos(0);
          const o = outward(p);
          const d = smooth(acetylW);
          return {
            pos: [lerp(p[0] + o[0] * 2.3, p[0], d), lerp(p[1] + o[1] * 2.3, p[1], d), 0] as [number, number, number],
            op: 1,
          };
        })()
      : null;

  // Harvested products released at their steps.
  const prods = useMemo(() => {
    const out: { pos: [number, number, number]; color: string; op: number }[] = [];
    const push = (idx: number, kind: keyof typeof PROD_COLORS) => {
      const w = fp - idx;
      if (w < 0 || w > 1) return;
      const p = npos(idx);
      const o = outward(p);
      const d = smooth(w) * 1.7;
      out.push({
        pos: [p[0] + o[0] * d, p[1] + o[1] * d + w * 0.45, p[2]],
        color: PROD_COLORS[kind],
        op: 1 - w * 0.25,
      });
    };
    push(2, 'co2');
    push(3, 'co2');
    push(2, 'nadh');
    push(3, 'nadh');
    push(7, 'nadh');
    push(5, 'fadh2');
    push(4, 'gtp');
    return out;
  }, [fp]);

  // Oxaloacetate regeneration flash when the carrier returns to step 1.
  const regen = fp > 7 || fp < 0.6 ? 0.5 + 0.5 * Math.sin(animTime * 6) : 0;

  return (
    <group>
      {/* ---- mitochondrial matrix backdrop ---- */}
      <PartGroup id="mitochondrial-matrix" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, 0, -0.6]}>
          <sphereGeometry args={[4.5, 32, 24]} />
          <meshStandardMaterial
            color="#86efac"
            transparent
            opacity={0.1}
            roughness={0.6}
            depthWrite={false}
            {...emissiveProps(sel('mitochondrial-matrix'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[3.7, -2.4, 0]} name="Mitochondrial matrix" />}
      </PartGroup>

      {/* ---- the ring: explode scales the radius outward ---- */}
      <group scale={1 + explode * 0.3}>
        <Line points={ringPoints} color="#38bdf8" transparent opacity={0.5} lineWidth={1.5} />
        {arrows.map((a, i) => (
          <mesh key={i} position={a.pos} quaternion={a.quat}>
            <coneGeometry args={[0.09, 0.24, 10]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>
        ))}

        {/* acetyl-CoA input */}
        <PartGroup id="acetyl-coa" position={[0, 0, 0]} onSelect={onSelect}>
          {acetyl && (
            <mesh position={acetyl.pos}>
              <sphereGeometry args={[0.17, 14, 12]} />
              <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.9} />
            </mesh>
          )}
          {/* invisible hit target so the input step is always clickable */}
          <mesh position={[0, 3.9, 0]}>
            <sphereGeometry args={[0.45, 12, 10]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {showLabels && <PartLabel position={[0, 4.1, 0]} name="Acetyl-CoA in" />}
        </PartGroup>

        {/* the eight enzyme steps */}
        {STEPS.map((enzyme, i) => {
          const p = npos(i);
          const o = outward(p);
          const active = i === activeIdx;
          const isRegenNode = i === 0;
          const glow = active ? 0.85 : isRegenNode ? regen * 0.5 : 0.1;
          return (
            <PartGroup key={i} id={`step-${i + 1}`} position={[0, 0, 0]} onSelect={onSelect}>
              <mesh position={p} scale={active ? 1.22 : 1}>
                <sphereGeometry args={[0.36, 24, 18]} />
                <meshStandardMaterial
                  color="#0ea5e9"
                  emissive={sel(`step-${i + 1}`) ? '#38bdf8' : '#fbbf24'}
                  emissiveIntensity={sel(`step-${i + 1}`) ? 0.4 : glow}
                  roughness={0.35}
                  metalness={0.15}
                />
              </mesh>
              {showLabels && <PartLabel position={[p[0] + o[0] * 0.95, p[1] + o[1] * 0.95, 0]} name={enzyme} />}
            </PartGroup>
          );
        })}

        {/* travelling carrier */}
        <mesh position={carrier}>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshBasicMaterial color="#fef9c3" />
        </mesh>

        {/* harvested products */}
        {prods.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.7} transparent opacity={p.op} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
