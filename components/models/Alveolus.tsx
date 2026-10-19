'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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
  scale,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  scale?: number | [number, number, number];
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

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

const SAC_R = 1.6;
const CAP_R = 1.82;
const FRONT_GAP = 1.5; // radians of wall removed at the front (+z), the cutaway

/** Capillary loop as two half-tori: oxygenated red half + deoxygenated blue half. */
function CapillaryLoop({
  rotation,
  selected,
}: {
  rotation: [number, number, number];
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group rotation={rotation}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[CAP_R, 0.17, 12, 64, Math.PI]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} {...em} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[CAP_R, 0.17, 12, 64, Math.PI]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.1} {...em} />
      </mesh>
    </group>
  );
}

const LOOP_ROTATIONS: [number, number, number][] = [
  [Math.PI / 2, 0, 0.25],
  [Math.PI / 2 + 0.55, 0.35, -0.2],
  [0.5, 0.9, Math.PI / 2],
];

export default function Alveolus(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  // Red blood cells riding along the first capillary loop.
  const rbcs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return {
          position: [CAP_R * Math.cos(a), CAP_R * Math.sin(a), 0] as [number, number, number],
          rotZ: a + Math.PI / 2,
        };
      }),
    [],
  );

  const capScale = 1 + explode * 0.14;

  return (
    <group>
      {/* ---- alveolar sac: cup-shaped wall, open at the front (cutaway) ---- */}
      <PartGroup id="alveolar-wall" position={[0, 0, 0]} scale={1 + explode * 0.05} onSelect={onSelect}>
        <mesh>
          {/* front gap centered at +z: phi = PI/2 gives z = r sin(phi) */}
          <sphereGeometry
            args={[SAC_R, 56, 36, Math.PI / 2 + FRONT_GAP / 2, Math.PI * 2 - FRONT_GAP, 0, Math.PI]}
          />
          <meshStandardMaterial
            color="#f9a8d4"
            transparent
            opacity={0.8}
            roughness={0.45}
            metalness={0.02}
            side={THREE.DoubleSide}
            {...emissiveProps(sel('alveolar-wall'))}
          />
        </mesh>
        {/* inner epithelial lining */}
        <mesh>
          <sphereGeometry
            args={[SAC_R - 0.09, 48, 32, Math.PI / 2 + FRONT_GAP / 2, Math.PI * 2 - FRONT_GAP, 0, Math.PI]}
          />
          <meshStandardMaterial
            color="#f472b6"
            transparent
            opacity={0.35}
            roughness={0.5}
            metalness={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('alveolar-wall'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[2.05, 0.95, 0]} name="Alveolar wall" />}
      </PartGroup>

      {/* ---- capillary network hugging the sac ---- */}
      <PartGroup id="capillary" position={[0, 0, 0]} scale={capScale} onSelect={onSelect}>
        {LOOP_ROTATIONS.map((rot, i) => (
          <CapillaryLoop key={i} rotation={rot} selected={sel('capillary')} />
        ))}
        {showLabels && <PartLabel position={[-2.2, -0.85, 0.4]} name="Capillary" />}
      </PartGroup>

      {/* ---- red blood cells inside the capillary ---- */}
      <PartGroup
        id="rbc"
        position={[0, 0, 0]}
        scale={capScale}
        onSelect={onSelect}
      >
        <group rotation={LOOP_ROTATIONS[0]}>
          {rbcs.map((r, i) => (
            <mesh key={i} position={r.position} rotation={[0, 0, r.rotZ]} scale={[1, 0.38, 1]}>
              <sphereGeometry args={[0.11, 18, 18]} />
              <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.08} {...emissiveProps(sel('rbc'))} />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[1.35, 1.75, 0]} name="RBC" />}
      </PartGroup>

      {/* ---- alveolar sac interior (air space) ---- */}
      <PartGroup id="alveolar-sac" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, -0.1, 0.35]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshPhysicalMaterial
            color="#fce7f3"
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('alveolar-sac'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.1, -1.15, 1.35]} name="Alveolar sac" />}
      </PartGroup>
    </group>
  );
}
