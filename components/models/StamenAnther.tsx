'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Explode offset for a part: normalize(base) * explode * 1.4. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

/** Emissive highlight applied to a part's materials when it is selected. */
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

function PartGroup({
  id,
  position,
  scale,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  scale?: number;
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position}
      scale={scale ?? 1}
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

const LOBE_L: [number, number, number] = [-0.38, 1.0, 0];
const LOBE_R: [number, number, number] = [0.38, 1.0, 0];

/** Pollen-grain dots inside one microsporangium (sac center, axis along y). */
function PollenDots({ center, seedBase, selected }: { center: [number, number, number]; seedBase: number; selected: boolean }): JSX.Element {
  const dots = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 12; i += 1) {
      const a = rand(seedBase + i * 3) * Math.PI * 2;
      const rr = rand(seedBase + i * 3 + 1) * 0.085;
      const y = center[1] + (rand(seedBase + i * 3 + 2) - 0.5) * 0.6;
      arr.push([center[0] + Math.cos(a) * rr, y, center[2] + Math.sin(a) * rr]);
    }
    return arr;
  }, [center, seedBase]);
  return (
    <group>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Stamen with dithecous anther (Fig 1.2). Left lobe intact; right lobe is a
 * longitudinal cutaway exposing the two microsporangia (pollen sacs) of that lobe.
 */
export default function StamenAnther(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const filCurve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, -1.9, 0),
        new THREE.Vector3(0.28, -0.9, 0.12),
        new THREE.Vector3(0, 0.38, 0),
      ),
    [],
  );

  // sac centers inside the right (cut) lobe: two microsporangia side by side
  const sacCenters: [number, number, number][] = [
    [LOBE_R[0] - 0.16, LOBE_R[1], LOBE_R[2]],
    [LOBE_R[0] + 0.16, LOBE_R[1], LOBE_R[2]],
  ];

  return (
    <group>
      {/* ---- Filament ---- */}
      <PartGroup id="filament" position={explodeOffset([0, -1, 0], explode)} onSelect={onSelect}>
        <mesh>
          <tubeGeometry args={[filCurve, 24, 0.11, 12, false]} />
          <meshStandardMaterial color="#a3b18a" roughness={0.55} metalness={0} {...emissiveProps(sel('filament'))} />
        </mesh>
        {/* connective joining filament to anther */}
        <mesh position={[0, 1.66, 0]}>
          <boxGeometry args={[0.62, 0.16, 0.3]} />
          <meshStandardMaterial color="#8a9a6b" roughness={0.55} metalness={0} {...emissiveProps(sel('filament'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.75, -1.35, 0]} name="Filament" />}
      </PartGroup>

      {/* ---- Left lobe: intact ---- */}
      <PartGroup id="anther-lobe" position={explodeOffset([-1, 0.35, 0], explode)} onSelect={onSelect}>
        <mesh position={LOBE_L}>
          <capsuleGeometry args={[0.34, 1.0, 8, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.05} {...emissiveProps(sel('anther-lobe'))} />
        </mesh>
        {/* dehiscence slit hint */}
        <mesh position={[LOBE_L[0], LOBE_L[1], 0.335]}>
          <boxGeometry args={[0.045, 0.9, 0.02]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} metalness={0} {...emissiveProps(sel('anther-lobe'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.25, 1.15, 0]} name="Anther lobe" />}
      </PartGroup>

      {/* ---- Right lobe: longitudinal cutaway ---- */}
      <PartGroup id="anther-lobe" position={explodeOffset([1, 0.35, 0], explode)} onSelect={onSelect}>
        {/* lobe wall with a front opening (theta gap faces +z) */}
        <mesh position={LOBE_R}>
          <cylinderGeometry args={[0.34, 0.34, 1.0, 24, 1, true, Math.PI * 0.55, Math.PI * 0.9]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.45}
            metalness={0.05}
            side={THREE.DoubleSide}
            {...emissiveProps(sel('anther-lobe'))}
          />
        </mesh>
        {/* wall-thickness rings top and bottom */}
        {[LOBE_R[1] + 0.5, LOBE_R[1] - 0.5].map((y, i) => (
          <mesh key={i} position={[LOBE_R[0], y, LOBE_R[2]]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.34, 24, 1, Math.PI * 0.55, Math.PI * 0.9]} />
            <meshStandardMaterial
              color="#d97706"
              roughness={0.5}
              metalness={0.05}
              side={THREE.DoubleSide}
              {...emissiveProps(sel('anther-lobe'))}
            />
          </mesh>
        ))}
        {/* septum between the two sacs */}
        <mesh position={[LOBE_R[0], LOBE_R[1], LOBE_R[2] - 0.05]}>
          <boxGeometry args={[0.05, 0.9, 0.42]} />
          <meshStandardMaterial color="#d97706" roughness={0.55} metalness={0} {...emissiveProps(sel('anther-lobe'))} />
        </mesh>
      </PartGroup>

      {/* ---- Pollen sacs (microsporangia) of the cut lobe ---- */}
      <PartGroup id="pollen-sac" position={explodeOffset([1.4, 0.6, 0.6], explode)} onSelect={onSelect}>
        {sacCenters.map((c, i) => (
          <group key={i}>
            <mesh position={c}>
              <capsuleGeometry args={[0.15, 0.66, 6, 18]} />
              <meshStandardMaterial
                color="#fde68a"
                transparent
                opacity={0.55}
                roughness={0.4}
                metalness={0}
                depthWrite={false}
                {...emissiveProps(sel('pollen-sac'))}
              />
            </mesh>
            <PollenDots center={c} seedBase={100 + i * 50} selected={sel('pollen-sac')} />
          </group>
        ))}
        {showLabels && <PartLabel position={[1.35, 0.55, 0.35]} name="Pollen sacs (microsporangia)" />}
      </PartGroup>
    </group>
  );
}
