'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function emissiveProps(selected: boolean) {
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
  zOffset,
  onSelect,
  children,
}: {
  id: string;
  zOffset: number;
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={[0, 0, zOffset]}
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

/** Explode fans the concentric layers out along +z so each ring can be inspected. */
const LAYER_Z: Record<string, number> = {
  'leydig-cells': -1.75,
  'basement-membrane': -1.15,
  spermatogonia: -0.6,
  spermatocytes: -0.1,
  spermatids: 0.4,
  spermatozoa: 0.9,
  'sertoli-cells': 1.4,
  lumen: 1.9,
};

function ringPositions(count: number, radius: number, seedBase: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand(seedBase + i) * 0.25;
    const r = radius + (rand(seedBase + i + 500) - 0.5) * 0.06;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

/**
 * Seminiferous tubule cross-section (NCERT Fig 2.2). The germinal epithelium is
 * stratified: spermatogonia sit on the basement membrane, then primary
 * spermatocytes, then spermatids, with maturing spermatozoa released toward
 * the central lumen. Sertoli cells span the wall; Leydig cells sit outside in
 * the interstitial tissue.
 */
export default function SeminiferousTubule(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  const zo = (id: string) => (LAYER_Z[id] ?? 0) * explode;

  const spermatogonia = useMemo(() => ringPositions(14, 0.8, 11), []);
  const spermatocytes = useMemo(() => ringPositions(10, 0.6, 77), []);
  const spermatids = useMemo(() => ringPositions(10, 0.42, 133), []);
  const spermatozoa = useMemo(() => ringPositions(10, 0.3, 201), []);
  const leydig = useMemo(() => ringPositions(7, 1.35, 301), []);
  const sertoli = useMemo(() => {
    const arr: { a: number; jitter: number }[] = [];
    for (let i = 0; i < 6; i++) arr.push({ a: (i / 6) * Math.PI * 2 + 0.3, jitter: rand(i * 9 + 2) * 0.2 });
    return arr;
  }, []);

  return (
    <group>
      {/* tubule wall hint (context) */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 1.6, 48, 1, true]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} roughness={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ---- interstitial tissue + Leydig cells ---- */}
      <PartGroup id="leydig-cells" zOffset={zo('leydig-cells')} onSelect={onSelect}>
        {leydig.map(([x, y], i) => (
          <group key={i} position={[x, y, 0]}>
            {[0, 1, 2].map((j) => (
              <mesh key={j} position={[(rand(i * 13 + j * 7) - 0.5) * 0.28, (rand(i * 13 + j * 7 + 3) - 0.5) * 0.28, 0]}>
                <sphereGeometry args={[0.11, 16, 12]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.55} metalness={0.02} {...emissiveProps(sel('leydig-cells'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[0, 1.75, 0]} name="Interstitial (Leydig) cells" />}
      </PartGroup>

      {/* ---- basement membrane ---- */}
      <PartGroup id="basement-membrane" zOffset={zo('basement-membrane')} onSelect={onSelect}>
        <mesh>
          <torusGeometry args={[1.0, 0.05, 12, 64]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.05} {...emissiveProps(sel('basement-membrane'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.35, -1.05, 0]} name="Basement membrane" />}
      </PartGroup>

      {/* ---- spermatogonia ---- */}
      <PartGroup id="spermatogonia" zOffset={zo('spermatogonia')} onSelect={onSelect}>
        {spermatogonia.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatogonia'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.35, 0.55, 0]} name="Spermatogonia" />}
      </PartGroup>

      {/* ---- primary spermatocytes ---- */}
      <PartGroup id="spermatocytes" zOffset={zo('spermatocytes')} onSelect={onSelect}>
        {spermatocytes.map(([x, y], i) => (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.19, 18, 14]} />
              <meshStandardMaterial color="#818cf8" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatocytes'))} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.1, 14, 10]} />
              <meshStandardMaterial color="#4f46e5" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatocytes'))} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.15, -0.85, 0]} name="Primary spermatocytes" />}
      </PartGroup>

      {/* ---- spermatids ---- */}
      <PartGroup id="spermatids" zOffset={zo('spermatids')} onSelect={onSelect}>
        {spermatids.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshStandardMaterial color="#c084fc" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatids'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.15, 0.85, 0]} name="Spermatids" />}
      </PartGroup>

      {/* ---- spermatozoa ---- */}
      <PartGroup id="spermatozoa" zOffset={zo('spermatozoa')} onSelect={onSelect}>
        {spermatozoa.map(([x, y], i) => {
          const a = Math.atan2(y, x);
          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, a - Math.PI / 2]}>
              <mesh position={[0, 0.1, 0]}>
                <coneGeometry args={[0.06, 0.14, 12]} />
                <meshStandardMaterial color="#f0abfc" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatozoa'))} />
              </mesh>
              <mesh position={[0, -0.16, 0]}>
                <cylinderGeometry args={[0.015, 0.008, 0.4, 8]} />
                <meshStandardMaterial color="#e9d5ff" roughness={0.45} metalness={0.05} {...emissiveProps(sel('spermatozoa'))} />
              </mesh>
            </group>
          );
        })}
        {showLabels && <PartLabel position={[0.85, -0.55, 0]} name="Spermatozoa" />}
      </PartGroup>

      {/* ---- Sertoli cells ---- */}
      <PartGroup id="sertoli-cells" zOffset={zo('sertoli-cells')} onSelect={onSelect}>
        {sertoli.map((s, i) => (
          <mesh
            key={i}
            position={[Math.cos(s.a) * 0.58, Math.sin(s.a) * 0.58, 0]}
            rotation={[0, 0, s.a + Math.PI / 2 + s.jitter]}
          >
            <coneGeometry args={[0.17, 0.62, 14]} />
            <meshStandardMaterial color="#6ee7b7" roughness={0.5} metalness={0.03} {...emissiveProps(sel('sertoli-cells'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0, -1.7, 0]} name="Sertoli cells" />}
      </PartGroup>

      {/* ---- lumen ---- */}
      <PartGroup id="lumen" zOffset={zo('lumen')} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[0.26, 24, 18]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transparent
            opacity={0.3}
            roughness={0.2}
            depthWrite={false}
            {...emissiveProps(sel('lumen'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.55, 0.35, 0]} name="Lumen" />}
      </PartGroup>
    </group>
  );
}
