'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Microsporogenesis timeline (seconds, total 40):
   mmc 0–8 (microspore mother cell → meiosis), tetrad 8–16,
   released 16–24 (tetrad splits), vacuolate 24–32,
   pollen-grain 32–40 (mature 2-celled pollen grain) */

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.45 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

function StageLabel({ name }: { name: string }): JSX.Element {
  return (
    <Html position={[0, 2.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

const STAGE_IDS = ['mmc', 'tetrad', 'released', 'vacuolate', 'pollen-grain'];
const STAGE_NAMES = [
  'Microspore mother cell → meiosis',
  'Microspore tetrad',
  'Released microspores',
  'Vacuolate microspore',
  'Mature 2-celled pollen grain',
];

function stageIndex(t: number): number {
  if (t < 8) return 0;
  if (t < 16) return 1;
  if (t < 24) return 2;
  if (t < 32) return 3;
  return 4;
}

// Tetrahedral arrangement (unit), scaled by caller
const TETRA: [number, number, number][] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
].map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l] as [number, number, number];
});

function Nucleus({ position, r, color, selected }: { position: [number, number, number]; r: number; color: string; selected: boolean }): JSX.Element {
  return (
    <mesh position={position}>
      <sphereGeometry args={[r, 20, 20]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
    </mesh>
  );
}

/** Stage 0: big MMC, nucleus divides 1 → 2 → 4 across the stage. */
function MmcStage({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const n2 = smooth((k - 0.35) / 0.25); // meiosis I
  const n4 = smooth((k - 0.65) / 0.25); // meiosis II
  const nucs: [number, number, number][] = [];
  if (n4 > 0.02) {
    for (let i = 0; i < 4; i += 1) {
      nucs.push([TETRA[i][0] * 0.38 * n4, TETRA[i][1] * 0.38 * n4, TETRA[i][2] * 0.38 * n4]);
    }
  } else if (n2 > 0.02) {
    nucs.push([-0.3 * n2, 0, 0], [0.3 * n2, 0, 0]);
  } else {
    nucs.push([0, 0, 0]);
  }
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.95, 40, 40]} />
        <meshStandardMaterial color="#fef3c7" transparent opacity={0.85} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[0.95, 40, 40]} />
        <meshPhysicalMaterial color="#fde68a" transparent opacity={0.22} roughness={0.3} metalness={0} depthWrite={false} {...emissiveProps(selected)} />
      </mesh>
      {nucs.map((p, i) => (
        <Nucleus key={i} position={p} r={0.3} color="#a78bfa" selected={selected} />
      ))}
    </group>
  );
}

/** Stage 1: four cells in a tetrahedral tetrad. Stage 2: they drift apart. */
function TetradStage({ k, released, selected }: { k: number; released: boolean; selected: boolean }): JSX.Element {
  const spread = released ? lerp(0.62, 1.75, smooth(k)) : 0.62 + 0.1 * smooth(k);
  const fade = released ? 1 - smooth((k - 0.7) / 0.3) : 1;
  return (
    <group>
      {TETRA.map((dir, i) => {
        const p: [number, number, number] = [dir[0] * spread, dir[1] * spread, dir[2] * spread];
        const dim = released && i > 0 ? fade : 1;
        if (dim <= 0.01) return null;
        return (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="#fef3c7" transparent opacity={0.85 * dim} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
            </mesh>
            <mesh scale={1.05}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.28 * dim} roughness={0.3} metalness={0} depthWrite={false} {...emissiveProps(selected)} />
            </mesh>
            <Nucleus position={[0, 0, 0]} r={0.16} color="#a78bfa" selected={selected} />
          </group>
        );
      })}
    </group>
  );
}

/** Stage 3: single microspore; vacuole grows, nucleus pushed to the wall. */
function VacuolateStage({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const vacR = lerp(0.06, 0.48, smooth(k));
  const nucX = lerp(-0.2, -0.48, smooth(k));
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.72, 40, 40]} />
        <meshStandardMaterial color="#fef3c7" transparent opacity={0.8} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      {/* vacuole */}
      <mesh position={[0.08, 0.05, 0]}>
        <sphereGeometry args={[vacR, 32, 32]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.55} roughness={0.2} metalness={0} depthWrite={false} {...emissiveProps(selected)} />
      </mesh>
      {/* nucleus pushed to periphery */}
      <Nucleus position={[nucX, 0.12, 0.1]} r={0.17} color="#a78bfa" selected={selected} />
    </group>
  );
}

/** Stage 4: mature pollen grain — spiny exine, vegetative nucleus + generative cell. */
function PollenGrainStage({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const spines = useMemo<{ p: [number, number, number]; q: THREE.Quaternion }[]>(() => {
    const arr: { p: [number, number, number]; q: THREE.Quaternion }[] = [];
    for (let i = 0; i < 36; i += 1) {
      const th = rand(i * 5 + 1) * Math.PI * 2;
      const ph = Math.acos(2 * rand(i * 5 + 2) - 1);
      const r = 0.78;
      const p: [number, number, number] = [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)];
      const n = new THREE.Vector3(p[0], p[1], p[2]).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      arr.push({ p, q });
    }
    return arr;
  }, []);
  const grow = 0.5 + 0.5 * smooth(k * 2);
  return (
    <group scale={grow}>
      {/* exine wall */}
      <mesh>
        <sphereGeometry args={[0.78, 40, 40]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.55} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      {spines.map((s, i) => (
        <mesh key={i} position={s.p} quaternion={s.q}>
          <coneGeometry args={[0.035, 0.14, 8]} />
          <meshStandardMaterial color="#d97706" roughness={0.55} metalness={0.05} {...emissiveProps(selected)} />
        </mesh>
      ))}
      {/* vegetative nucleus: large, diffuse */}
      <mesh position={[0.15, 0.1, 0.1]} scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color="#c4b5fd" transparent opacity={0.9} roughness={0.4} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      {/* generative cell: small spindle hugging the wall */}
      <mesh position={[-0.42, -0.15, 0.05]} rotation={[0, 0, 1.1]}>
        <capsuleGeometry args={[0.11, 0.28, 6, 16]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      {/* two germ pores */}
      {[
        [0, 0.79, 0.08],
        [0.55, -0.5, 0.28],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} scale={[1, 1, 0.4]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

export default function Microsporogenesis(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const stageStart = [0, 8, 16, 24, 32][si];
  const k = clamp01((t - stageStart) / 8);
  const sel = (id: string) => selectedId === id;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(STAGE_IDS[si]);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <StageLabel name={STAGE_NAMES[si]} />
      {si === 0 && <MmcStage k={k} selected={sel('mmc')} />}
      {si === 1 && <TetradStage k={k} released={false} selected={sel('tetrad')} />}
      {si === 2 && <TetradStage k={k} released selected={sel('released')} />}
      {si === 3 && <VacuolateStage k={k} selected={sel('vacuolate')} />}
      {si === 4 && <PollenGrainStage k={k} selected={sel('pollen-grain')} />}
      {showLabels && si === 4 && (
        <group>
          <PartLabel position={[1.35, 0.55, 0]} name="Vegetative cell" />
          <PartLabel position={[-1.15, -0.75, 0]} name="Generative cell" />
        </group>
      )}
      {showLabels && si === 1 && <PartLabel position={[0, -1.35, 0]} name="Callose-walled tetrad" />}
      {showLabels && si === 3 && <PartLabel position={[0.9, 0.75, 0]} name="Vacuole" />}
    </group>
  );
}
