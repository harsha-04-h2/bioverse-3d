'use client';

import { type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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

const STACK = 6;
const yOf = (i: number) => -0.7 + i * 0.28;

/** One curved Golgi cisterna: a shallow bowl plate, bowed with the stack. */
function Cisterna({
  index,
  selected,
}: {
  index: number;
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <mesh
      position={[0, yOf(index), 0]}
      rotation={[(index % 2 === 0 ? 0.03 : -0.03), 0, (index - (STACK - 1) / 2) * 0.07]}
      scale={[1, 0.34, 0.88]}
    >
      <sphereGeometry args={[1.35, 48, 16, 0, Math.PI * 2, 0, 0.52]} />
      <meshStandardMaterial color="#34d399" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...em} />
    </mesh>
  );
}

// Transport vesicles budding at the rims of the middle cisternae.
const TRANSPORT: { angle: number; stack: number }[] = [
  { angle: 1.7, stack: 1 },
  { angle: 4.1, stack: 1 },
  { angle: 0.6, stack: 2 },
  { angle: 3.4, stack: 3 },
  { angle: 2.4, stack: 4 },
  { angle: 5.3, stack: 4 },
];

export default function GolgiApparatus(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  return (
    <group>
      {/* ---- Cisternae stack: cis face (bottom) -> trans face (top) ---- */}
      {Array.from({ length: STACK }, (_, i) => {
        const partId = i === 0 ? 'cis-face' : i === STACK - 1 ? 'trans-face' : 'cisterna';
        return (
          <PartGroup key={i} id={partId} position={explodeOffset([0, yOf(i), 0], explode)} onSelect={onSelect}>
            <Cisterna index={i} selected={sel(partId)} />
            {showLabels && i === 0 && <PartLabel position={[0, -0.62, 0]} name="Cis face" />}
            {showLabels && i === 3 && <PartLabel position={[1.05, 0.15, 0]} name="Cisterna" />}
            {showLabels && i === STACK - 1 && <PartLabel position={[0, 0.68, 0]} name="Trans face" />}
          </PartGroup>
        );
      })}

      {/* ---- Transport vesicles budding at cisterna rims (3 s pulse loop) ---- */}
      <PartGroup id="transport-vesicle" position={explodeOffset([1.2, 0.3, 0.5], explode)} onSelect={onSelect}>
        {TRANSPORT.map((v, k) => {
          const pulse = 1 + 0.16 * Math.sin((animTime * 2 * Math.PI) / 3 + k * 1.3);
          return (
            <mesh
              key={k}
              position={[0.8 * Math.cos(v.angle), yOf(v.stack) + 0.36, 0.72 * Math.sin(v.angle)]}
              scale={pulse}
            >
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshStandardMaterial color="#6ee7b7" roughness={0.4} metalness={0.08} {...emissiveProps(sel('transport-vesicle'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[-0.35, 0.35, 0.85]} name="Transport vesicle" />}
      </PartGroup>

      {/* ---- Secretory vesicles leaving the trans face (5 s drift loop) ---- */}
      <PartGroup id="secretory-vesicle" position={explodeOffset([-1.0, 1.5, 0.4], explode)} onSelect={onSelect}>
        {[0, 1, 2, 3].map((k) => {
          const drift = 0.18 * Math.sin((animTime * 2 * Math.PI) / 5 + k * 1.7);
          return (
            <mesh key={k} position={[-0.85 + k * 0.55, 1.25 + k * 0.3 + drift, 0.3 - k * 0.15]}>
              <sphereGeometry args={[0.13, 20, 20]} />
              <meshStandardMaterial color="#10b981" roughness={0.38} metalness={0.08} {...emissiveProps(sel('secretory-vesicle'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[0.55, 2.35, 0]} name="Secretory vesicle" />}
      </PartGroup>
    </group>
  );
}
