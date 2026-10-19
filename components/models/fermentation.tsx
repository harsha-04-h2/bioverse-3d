'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Loop length in seconds - everything is driven from animTime. */
const LOOP = 16;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Explode offset for a part: base + normalize(base) * explode * 1.4. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

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

const HEAD: [number, number, number] = [0, 3.2, 0];

const YEAST_PTS: [number, number, number][] = [
  [0, 3.2, 0],
  [-0.85, 2.15, 0.1],
  [-1.4, 0.75, 0],
  [-1.9, -1.25, 0],
  [-2.3, -3.4, 0],
];
const MUSCLE_PTS: [number, number, number][] = [
  [0, 3.2, 0],
  [0.85, 2.15, -0.1],
  [1.4, 0.75, 0],
  [1.9, -1.25, 0],
  [2.3, -3.4, 0],
];

const ETHANOL_POS: [number, number, number] = [-2.3, -3.4, 0];
const LACTATE_POS: [number, number, number] = [2.3, -3.4, 0];

export default function Fermentation(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const yCurve = useMemo(
    () => new THREE.CatmullRomCurve3(YEAST_PTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
    [],
  );
  const mCurve = useMemo(
    () => new THREE.CatmullRomCurve3(MUSCLE_PTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
    [],
  );
  const yTube = useMemo(() => new THREE.TubeGeometry(yCurve, 48, 0.15, 10, false), [yCurve]);
  const mTube = useMemo(() => new THREE.TubeGeometry(mCurve, 48, 0.15, 10, false), [mCurve]);
  const yConv = useMemo(() => yCurve.getPoint(0.45), [yCurve]);
  const mConv = useMemo(() => mCurve.getPoint(0.5), [mCurve]);

  // Pyruvate particles: 0-8.8s ride the yeast branch, later ones the muscle branch.
  const parts = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    const cyc = (animTime % LOOP + LOOP) % LOOP;
    for (let j = 0; j < 11; j += 1) {
      const start = 0.4 + j * 1.4;
      const curve = start < 8.8 ? yCurve : mCurve;
      const local = (cyc - start + LOOP) % LOOP;
      if (local < 3.2) {
        const p = curve.getPoint(clamp01(local / 3.2));
        out.push({ pos: [p.x, p.y, p.z] });
      }
    }
    return out;
  }, [animTime, yCurve, mCurve]);

  // CO2 bubbles rising from the yeast branch decarboxylation step.
  const co2 = useMemo(() => {
    const out: { pos: [number, number, number]; op: number }[] = [];
    const cyc = (animTime % LOOP + LOOP) % LOOP;
    for (let j = 0; j < 6; j += 1) {
      const start = 0.4 + j * 1.4;
      const local = (cyc - start + LOOP) % LOOP;
      if (local > 1.3 && local < 3.1) {
        const r = (local - 1.3) / 1.8;
        out.push({
          pos: [
            yConv.x + 0.18 * Math.sin(j * 2.3 + r * 4),
            yConv.y + r * 1.7,
            yConv.z + 0.12 * Math.cos(j * 1.7 + r * 3),
          ],
          op: 1 - r,
        });
      }
    }
    return out;
  }, [animTime, yConv]);

  // NAD+ streaming back up to the branch point from both conversion sites.
  const nadReturn = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    const cyc = (animTime % LOOP + LOOP) % LOOP;
    const head = new THREE.Vector3(HEAD[0], HEAD[1], HEAD[2]);
    for (let kk = 0; kk < 6; kk += 1) {
      const pr = (cyc / LOOP + kk / 6) % 1;
      const from = kk % 2 === 0 ? yConv : mConv;
      out.push({
        pos: [lerp(from.x, head.x, pr), lerp(from.y, head.y, pr), lerp(from.z, head.z, pr)],
      });
    }
    return out;
  }, [animTime, yConv, mConv]);

  const headPulse = 1 + 0.1 * Math.sin(animTime * 3);

  return (
    <group>
      {/* ---- pyruvate branch point ---- */}
      <PartGroup id="pyruvate" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={HEAD} scale={headPulse}>
          <sphereGeometry args={[0.42, 24, 18]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.35} metalness={0.1} {...emissiveProps(sel('pyruvate'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, 4.05, 0]} name="Pyruvate" />}
      </PartGroup>

      {/* ---- yeast branch: alcoholic fermentation ---- */}
      <PartGroup id="yeast-cell" position={explodeOffset([-1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[-2.85, -1.6, -1.6]} scale={[1.5, 2.3, 1.2]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.13} roughness={0.6} depthWrite={false} {...emissiveProps(sel('yeast-cell'))} />
        </mesh>
        <mesh geometry={yTube}>
          <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.06} {...emissiveProps(sel('yeast-cell'))} />
        </mesh>
        {showLabels && <PartLabel position={[-3.35, 0.7, -0.7]} name="Yeast cell" />}
      </PartGroup>

      <PartGroup id="acetaldehyde" position={explodeOffset([-1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[yConv.x, yConv.y, yConv.z]}>
          <sphereGeometry args={[0.3, 20, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.35} metalness={0.1} {...emissiveProps(sel('acetaldehyde'))} />
        </mesh>
        {showLabels && <PartLabel position={[yConv.x - 1.15, yConv.y + 0.35, yConv.z]} name="Acetaldehyde" />}
      </PartGroup>

      <PartGroup id="ethanol" position={explodeOffset([-1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={ETHANOL_POS} scale={1 + 0.12 * Math.sin(animTime * 2.4)}>
          <sphereGeometry args={[0.3, 20, 16]} />
          <meshStandardMaterial
            color="#4ade80"
            emissive={sel('ethanol') ? '#38bdf8' : '#22c55e'}
            emissiveIntensity={sel('ethanol') ? 0.4 : 0.45}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.3, -4.2, 0]} name="Ethanol + CO2" />}
      </PartGroup>

      {/* ---- muscle branch: lactic-acid fermentation ---- */}
      <PartGroup id="muscle-fibre" position={explodeOffset([1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[2.85, -1.6, -1.6]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.85, 2.6, 8, 16]} />
          <meshStandardMaterial color="#f43f5e" transparent opacity={0.13} roughness={0.6} depthWrite={false} {...emissiveProps(sel('muscle-fibre'))} />
        </mesh>
        <mesh geometry={mTube}>
          <meshStandardMaterial color="#fb7185" roughness={0.45} metalness={0.06} {...emissiveProps(sel('muscle-fibre'))} />
        </mesh>
        {showLabels && <PartLabel position={[3.35, 0.7, -0.7]} name="Muscle fibre" />}
      </PartGroup>

      <PartGroup id="lactate" position={explodeOffset([1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={LACTATE_POS} scale={1 + 0.12 * Math.sin(animTime * 2.4 + 1.5)}>
          <sphereGeometry args={[0.34, 20, 16]} />
          <meshStandardMaterial
            color="#fb7185"
            emissive={sel('lactate') ? '#38bdf8' : '#f43f5e'}
            emissiveIntensity={sel('lactate') ? 0.4 : 0.45}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {showLabels && <PartLabel position={[2.3, -4.2, 0]} name="Lactate" />}
      </PartGroup>

      {/* ---- pyruvate particles riding the branches ---- */}
      {parts.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color="#ddd6fe" />
        </mesh>
      ))}

      {/* ---- CO2 bubbles from the yeast branch ---- */}
      {co2.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={p.op * 0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* ---- NAD+ regeneration stream ---- */}
      <PartGroup id="nad-regen" position={[0, 0, 0]} onSelect={onSelect}>
        {nadReturn.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshStandardMaterial color="#22d3ee" emissive={sel('nad-regen') ? '#38bdf8' : '#22d3ee'} emissiveIntensity={sel('nad-regen') ? 1.3 : 0.9} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.35, 2.6, 0]} name="NAD+ regenerated" />}
      </PartGroup>
    </group>
  );
}
