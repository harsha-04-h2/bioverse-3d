'use client';

import { type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Megasporogenesis → embryo sac timeline (seconds, total 40):
   mmc 0–6, meiosis 6–12 (linear tetrad, 3 degenerate), functional-megaspore 12–18,
   mitotic-divisions 18–26 (2→4→8 nucleate), embryo-sac 26–40 (mature 7-celled) */

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
    <Html position={[0, 2.6, 0]} center zIndexRange={[40, 0]} className="bv-label">
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

const STAGE_IDS = ['mmc', 'meiosis', 'functional-megaspore', 'mitotic-divisions', 'embryo-sac'];
const STAGE_NAMES = [
  'Megaspore mother cell',
  'Meiosis → linear tetrad',
  'Functional megaspore',
  'Free-nuclear divisions (2→4→8)',
  'Mature embryo sac (7-celled)',
];

function stageIndex(t: number): number {
  if (t < 6) return 0;
  if (t < 12) return 1;
  if (t < 18) return 2;
  if (t < 26) return 3;
  return 4;
}

/** Translucent embryo-sac wall. */
function SacWall({ scaleY, r, selected }: { scaleY: number; r: number; selected: boolean }): JSX.Element {
  return (
    <mesh scale={[1, scaleY, 1]}>
      <sphereGeometry args={[r, 36, 36]} />
      <meshPhysicalMaterial
        color="#ddd6fe"
        transparent
        opacity={0.18}
        roughness={0.25}
        metalness={0}
        depthWrite={false}
        {...emissiveProps(selected)}
      />
    </mesh>
  );
}

function Nuclei({
  positions,
  r,
  color,
  selected,
}: {
  positions: [number, number, number][];
  r: number;
  color: string;
  selected: boolean;
}): JSX.Element {
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

/** Stage 0: MMC — large cell with a big nucleus. */
function Mmc({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  return (
    <group>
      <mesh scale={[1, 1.25, 1]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#fef3c7" transparent opacity={0.85} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22 + 0.03 * Math.sin(k * 6), 20, 20]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
    </group>
  );
}

/** Stage 1: linear tetrad of 4 megaspores; micropylar (bottom) 3 degenerate. */
function Meiosis({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const fade = 1 - smooth((k - 0.55) / 0.4);
  return (
    <group>
      {[0.78, 0.26, -0.26, -0.78].map((y, i) => {
        const functional = i === 0; // chalazal (top) megaspore survives
        const op = functional ? 0.95 : 0.95 * fade + 0.15;
        const col = functional ? '#fde68a' : '#d6d3d1';
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.26, 24, 24]} />
              <meshStandardMaterial color={col} transparent opacity={op} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
            </mesh>
            {!functional && (
              <mesh rotation={[0, 0, 0.7]}>
                <boxGeometry args={[0.3, 0.05, 0.05]} />
                <meshStandardMaterial color="#78716c" transparent opacity={fade} roughness={0.6} metalness={0} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** Stage 2: functional megaspore enlarges. */
function Functional({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const r = lerp(0.3, 0.58, smooth(k));
  return (
    <group>
      <SacWall scaleY={1.35} r={r} selected={selected} />
      <mesh scale={[1, 1.2, 1]}>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color="#fde68a" transparent opacity={0.85} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
    </group>
  );
}

/** Stage 3: three free-nuclear mitoses → 2, then 4, then 8 nuclei. */
function Divisions({ k, selected }: { k: number; selected: boolean }): JSX.Element {
  const r = 0.62;
  let nucs: [number, number, number][];
  if (k < 0.35) {
    nucs = [
      [0, 0.45, 0],
      [0, -0.45, 0],
    ];
  } else if (k < 0.7) {
    nucs = [
      [0.14, 0.55, 0],
      [-0.14, 0.55, 0],
      [0.14, -0.55, 0],
      [-0.14, -0.55, 0],
    ];
  } else {
    nucs = [
      [0.2, 0.62, 0.05],
      [-0.2, 0.62, -0.05],
      [0.05, 0.45, 0.2],
      [-0.05, 0.45, -0.2],
      [0.2, -0.62, -0.05],
      [-0.2, -0.62, 0.05],
      [0.05, -0.45, -0.2],
      [-0.05, -0.45, 0.2],
    ];
  }
  return (
    <group>
      <SacWall scaleY={1.35} r={r} selected={selected} />
      <mesh scale={[1, 1.3, 1]}>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color="#fef9c3" transparent opacity={0.6} roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      <Nuclei positions={nucs} r={0.09} color="#7c3aed" selected={selected} />
    </group>
  );
}

/** Stage 4: mature 7-celled embryo sac. Micropylar end at bottom. */
function MatureSac({ k, selected, showLabels }: { k: number; selected: boolean; showLabels: boolean }): JSX.Element {
  const pop = 0.4 + 0.6 * smooth(k * 3);
  const fuse = smooth((k - 0.15) / 0.5); // polar nuclei drift together
  return (
    <group scale={pop}>
      <SacWall scaleY={1.5} r={0.72} selected={selected} />
      {/* egg apparatus at micropylar end */}
      <mesh position={[0, -0.88, 0]}>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshStandardMaterial color="#fda4af" roughness={0.45} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.78, 0]}>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.45} metalness={0} {...emissiveProps(selected)} />
          </mesh>
          {/* filiform apparatus: striated thickening below each synergid */}
          <mesh position={[x, -0.95, 0]}>
            <coneGeometry args={[0.09, 0.16, 12]} />
            <meshStandardMaterial color="#be123c" roughness={0.55} metalness={0} {...emissiveProps(selected)} />
          </mesh>
        </group>
      ))}
      {/* central cell: two polar nuclei fusing */}
      <mesh position={[0, lerp(0.18, 0.02, fuse), 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      <mesh position={[0, lerp(-0.3, -0.08, fuse), 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      {/* antipodals at chalazal end */}
      {[-0.22, 0, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.98, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#c4b5fd" roughness={0.45} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
      {showLabels && (
        <group>
          <PartLabel position={[0.75, -0.88, 0]} name="Egg cell" />
          <PartLabel position={[-0.95, -0.7, 0]} name="Synergids" />
          <PartLabel position={[0.85, 0.1, 0]} name="Polar nuclei (central cell)" />
          <PartLabel position={[0.7, 1.05, 0]} name="Antipodals" />
        </group>
      )}
    </group>
  );
}

export default function EmbryoSac(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const stageStart = [0, 6, 12, 18, 26][si];
  const stageLen = [6, 6, 6, 8, 14][si];
  const k = clamp01((t - stageStart) / stageLen);
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
      {si === 0 && <Mmc k={k} selected={sel('mmc')} />}
      {si === 1 && <Meiosis k={k} selected={sel('meiosis')} />}
      {si === 2 && <Functional k={k} selected={sel('functional-megaspore')} />}
      {si === 3 && <Divisions k={k} selected={sel('mitotic-divisions')} />}
      {si === 4 && <MatureSac k={k} selected={sel('embryo-sac')} showLabels={showLabels} />}
      {showLabels && si === 1 && <PartLabel position={[0.85, 0.78, 0]} name="Functional (chalazal) megaspore" />}
    </group>
  );
}
