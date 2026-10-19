'use client';

import { useMemo, type ReactNode } from 'react';
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

// Wedge cut facing +z: the missing wedge is centred on the +z axis.
const PHI = Math.PI * 2 * 0.78;
const PHI_START = -Math.PI / 2 - PHI / 2;

// Shelf-like cristae projecting inward from the inner membrane.
const CRISTAE_X = [-0.95, -0.32, 0.32, 0.95];

export default function Mitochondrion(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // A few free ribosome dots scattered in the matrix (deterministic).
  const matrixRibos = useMemo<[number, number, number][]>(
    () =>
      [
        [-0.55, 0.18, 0.3],
        [-0.15, -0.28, -0.2],
        [0.75, 0.22, -0.25],
        [0.05, 0.3, 0.35],
      ] as [number, number, number][],
    [],
  );

  return (
    <group>
      {/* ---- Outer membrane: rod-shaped shell, cut open at the front ---- */}
      <PartGroup id="outer-membrane" position={explodeOffset([0, 1.1, 0.25], explode)} onSelect={onSelect}>
        <mesh scale={[1.6, 0.85, 0.85]}>
          <sphereGeometry args={[1, 48, 32, PHI_START, PHI]} />
          <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('outer-membrane'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, 1.15, 0.25]} name="Outer membrane" />}
      </PartGroup>

      {/* ---- Inner membrane: smaller shell, same cutaway ---- */}
      <PartGroup id="inner-membrane" position={explodeOffset([0, -1.0, 0.2], explode)} onSelect={onSelect}>
        <mesh scale={[1.6, 0.85, 0.85]}>
          <sphereGeometry args={[0.86, 48, 32, PHI_START, PHI * 0.995]} />
          <meshStandardMaterial color="#fdba74" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('inner-membrane'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.15, -0.6, 0.55]} name="Inner membrane" />}
      </PartGroup>

      {/* ---- Cristae: shelf-like folds of the inner membrane ---- */}
      {CRISTAE_X.map((x, i) => (
        <PartGroup key={i} id="cristae" position={explodeOffset([x, 0.55, 0], explode)} onSelect={onSelect}>
          <mesh position={[x, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.5, 24, 1, true, Math.PI - 0.7, 1.4]} />
            <meshStandardMaterial color="#ea580c" roughness={0.45} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('cristae'))} />
          </mesh>
          {showLabels && i === 0 && <PartLabel position={[x, 0.72, 0]} name="Cristae" />}
        </PartGroup>
      ))}

      {/* ---- Matrix: translucent inner volume + free ribosomes ---- */}
      <PartGroup id="matrix" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh scale={[1.5, 0.7, 0.7]}>
          <sphereGeometry args={[0.72, 32, 24]} />
          <meshStandardMaterial
            color="#fed7aa"
            transparent
            opacity={0.26}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('matrix'))}
          />
        </mesh>
        {matrixRibos.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} metalness={0} {...emissiveProps(sel('matrix'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-0.62, -0.42, 0.35]} name="Matrix" />}
      </PartGroup>

      {/* ---- Mitochondrial DNA: small circular loop in the matrix (12 s spin) ---- */}
      <PartGroup id="mitochondrial-dna" position={explodeOffset([0.7, -0.5, 0.9], explode)} onSelect={onSelect}>
        <mesh position={[0.35, -0.12, 0.28]} rotation={[0.6, (animTime * 2 * Math.PI) / 12, 0.3]}>
          <torusGeometry args={[0.17, 0.022, 10, 40]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive={sel('mitochondrial-dna') ? '#38bdf8' : "#f59e0b"}
            emissiveIntensity={sel('mitochondrial-dna') ? 0.4 : 0.35}
            roughness={0.4}
            metalness={0}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.35, 0.22, 0.28]} name="Mitochondrial DNA" />}
      </PartGroup>
    </group>
  );
}
