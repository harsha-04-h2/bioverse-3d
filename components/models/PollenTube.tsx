'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Pollen–pistil interaction timeline (seconds, total 40):
   germination 0–6 (grain lands, hydrates), tube-growth 6–22 (down the style),
   ovary-entry 22–34 (turns to the ovule), gamete-release 34–40 (micropyle entry) */

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

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function StageLabel({ name }: { name: string }): JSX.Element {
  return (
    <Html position={[0, 2.7, 0]} center zIndexRange={[40, 0]} className="bv-label">
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

const STAGE_IDS = ['germination', 'tube-growth', 'ovary-entry', 'gamete-release'];
const STAGE_NAMES = [
  'Pollen lands on stigma — germination',
  'Pollen tube grows through the style',
  'Tube turns toward the ovule',
  'Micropyle entry — gametes released',
];

function stageIndex(t: number): number {
  if (t < 6) return 0;
  if (t < 22) return 1;
  if (t < 34) return 2;
  return 3;
}

// Tube path: stigma → style → ovary → micropyle → egg apparatus
const PATH_PTS: [number, number, number][] = [
  [0, 1.95, 0],
  [0.06, 1.3, 0.04],
  [-0.05, 0.5, -0.04],
  [0.04, -0.35, 0.03],
  [0.1, -0.62, 0],
  [0.1, -0.95, 0],
];

function useTubePath() {
  return useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(PATH_PTS.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const pts = curve.getPoints(70);
    return pts.map((v) => [v.x, v.y, v.z] as [number, number, number]);
  }, []);
}

function StigmaPapillae({ selected }: { selected: boolean }): JSX.Element {
  const dots = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 14; i += 1) {
      const a = rand(i * 3 + 1) * Math.PI * 2;
      const rr = 0.1 + rand(i * 3 + 2) * 0.32;
      arr.push([Math.cos(a) * rr, 1.72 + rand(i * 3 + 3) * 0.16, Math.sin(a) * rr]);
    }
    return arr;
  }, []);
  return (
    <group>
      <mesh position={[0, 1.55, 0]} scale={[1.15, 0.55, 1.15]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

export default function PollenTube(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;
  const tubePts = useTubePath();

  // Tube growth progress: starts at t=4, reaches the egg at t=34
  const prog = smooth((t - 4) / 30);
  const nSeg = Math.floor(prog * 70);
  const tip: [number, number, number] = nSeg >= 70 ? tubePts[70] : tubePts[Math.max(0, nSeg)];

  // Pollen grain: sits on stigma, hydrates (pulses) 0–4s
  const hydrate = t < 4 ? 1 + 0.08 * Math.sin(t * 6) : 1;

  // Gamete release 34–40: two male gametes leave the burst tip toward the egg
  const rel = smooth((t - 34) / 5);
  const g1: [number, number, number] = [lerp(tip[0], 0.1, rel), lerp(tip[1], -1.08, rel), lerp(tip[2], 0, rel)];
  const g2: [number, number, number] = [lerp(tip[0], 0.32, rel * 0.9), lerp(tip[1], -1.0, rel * 0.9), lerp(tip[2], 0.1, rel * 0.9)];
  const tipBurst = t >= 34 ? Math.max(0.01, 1 - rel * 1.2) : 1;

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

      {/* ---- Stigma ---- */}
      <PartGroup id="stigma" position={[0, 0, 0]} onSelect={onSelect}>
        <StigmaPapillae selected={sel('stigma')} />
        {showLabels && <PartLabel position={[-1.15, 1.7, 0]} name="Stigma" />}
      </PartGroup>

      {/* ---- Pollen grain ---- */}
      <PartGroup id="pollen-grain" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={[0, 1.95, 0]} scale={hydrate}>
          <mesh>
            <sphereGeometry args={[0.26, 24, 24]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.55} metalness={0.05} {...emissiveProps(sel('pollen-grain'))} />
          </mesh>
          {[
            [0.2, 0.12, 0.1],
            [-0.18, 0.15, -0.08],
            [0, -0.2, 0.14],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0} {...emissiveProps(sel('pollen-grain'))} />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[1.05, 2.15, 0]} name="Pollen grain" />}
      </PartGroup>

      {/* ---- Style with transmitting tissue ---- */}
      <PartGroup id="style" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.35, 0.42, 1.9, 20]} />
          <meshPhysicalMaterial
            color="#bbf7d0"
            transparent
            opacity={0.32}
            roughness={0.3}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('style'))}
          />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.17, 0.2, 1.9, 16]} />
          <meshStandardMaterial
            color="#86efac"
            transparent
            opacity={0.45}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('style'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.05, 0.45, 0]} name="Style" />}
      </PartGroup>

      {/* ---- Ovary (translucent, holds the ovule) ---- */}
      <mesh position={[0, -1.05, 0]} scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshPhysicalMaterial color="#86efac" transparent opacity={0.3} roughness={0.3} metalness={0} depthWrite={false} />
      </mesh>

      {/* ---- Ovule with micropyle ---- */}
      <PartGroup id="ovule" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0.1, -1.08, 0]} scale={[0.72, 0.95, 0.72]}>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial color="#fef9c3" transparent opacity={0.85} roughness={0.5} metalness={0} {...emissiveProps(sel('ovule'))} />
        </mesh>
        {/* integument ridges */}
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.1, -0.82 - i * 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3 - i * 0.05, 0.045, 10, 28]} />
            <meshStandardMaterial color="#fde68a" roughness={0.5} metalness={0} {...emissiveProps(sel('ovule'))} />
          </mesh>
        ))}
        {/* funicle stalk */}
        <mesh position={[-0.25, -1.25, 0]} rotation={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.05, 0.06, 0.5, 10]} />
          <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('ovule'))} />
        </mesh>
        {/* embryo sac hint inside ovule */}
        <mesh position={[0.1, -1.08, 0]} scale={[0.45, 0.7, 0.45]}>
          <sphereGeometry args={[0.3, 20, 20]} />
          <meshPhysicalMaterial color="#ddd6fe" transparent opacity={0.4} roughness={0.3} metalness={0} depthWrite={false} {...emissiveProps(sel('ovule'))} />
        </mesh>
        <mesh position={[0.1, -1.28, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#fda4af" roughness={0.45} metalness={0} {...emissiveProps(sel('ovule'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.15, -1.15, 0]} name="Ovule" />}
      </PartGroup>

      {/* ---- Micropyle opening ---- */}
      <PartGroup id="micropyle" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0.1, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.032, 10, 20]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} metalness={0} {...emissiveProps(sel('micropyle'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, -0.62, 0]} name="Micropyle" />}
      </PartGroup>

      {/* ---- Growing pollen tube ---- */}
      <PartGroup id="pollen-tube" position={[0, 0, 0]} onSelect={onSelect}>
        {tubePts.slice(0, Math.max(0, nSeg)).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#fde047" roughness={0.45} metalness={0} {...emissiveProps(sel('pollen-tube'))} />
          </mesh>
        ))}
        {nSeg > 0 && (
          <mesh position={tip} scale={tipBurst}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0} {...emissiveProps(sel('pollen-tube'))} />
          </mesh>
        )}
        {showLabels && nSeg > 20 && <PartLabel position={[tip[0] + 0.75, tip[1], tip[2]]} name="Pollen tube" />}
      </PartGroup>

      {/* ---- Male gametes (released at the end) ---- */}
      {t >= 34 && (
        <PartGroup id="male-gametes" position={[0, 0, 0]} onSelect={onSelect}>
          {[g1, g2].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.09, 14, 14]} />
              <meshStandardMaterial color="#f43f5e" roughness={0.4} metalness={0.05} {...emissiveProps(sel('male-gametes'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[g1[0] + 0.7, g1[1] - 0.1, 0]} name="Male gametes" />}
        </PartGroup>
      )}
    </group>
  );
}
