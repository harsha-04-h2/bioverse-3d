'use client';

import type { ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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
  position?: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position ?? [0, 0, 0]}
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

const N = 8;
const SPACING = 0.92;
const SEQ = ['A', 'G', 'C', 'T', 'A', 'T', 'G', 'C'];
const BASE_COLORS: Record<string, string> = {
  A: '#34d399',
  T: '#f87171',
  G: '#60a5fa',
  C: '#fbbf24',
};

const xOf = (i: number) => (i - (N - 1) / 2) * SPACING;

export default function PolynucleotideChain(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const x0 = xOf(0);
  const xN = xOf(N - 1);

  return (
    <group rotation={[0, 0, 0]}>
      {/* ---- Sugar-phosphate backbone: pentose sugars + phosphate bridges ---- */}
      <PartGroup id="backbone" onSelect={onSelect}>
        {SEQ.map((_, i) => {
          const off = explodeOffset([0, 1, 0], explode * 0.4);
          return (
            <mesh key={i} position={[xOf(i), off[1], 0]} rotation={[0, 0, Math.PI / 5]}>
              <cylinderGeometry args={[0.23, 0.23, 0.16, 5]} />
              <meshStandardMaterial
                color="#a78bfa"
                roughness={0.45}
                metalness={0.08}
                {...emissiveProps(sel('backbone'))}
              />
            </mesh>
          );
        })}
        {/* phosphate groups bridging 3' of one sugar to 5' of the next */}
        {SEQ.slice(0, N - 1).map((_, i) => {
          const off = explodeOffset([0, 1, 0], explode * 0.55);
          return (
            <mesh key={i} position={[xOf(i) + SPACING / 2, 0.08 + off[1], 0]}>
              <sphereGeometry args={[0.15, 20, 20]} />
              <meshStandardMaterial
                color="#f472b6"
                roughness={0.4}
                metalness={0.1}
                {...emissiveProps(sel('backbone'))}
              />
            </mesh>
          );
        })}
        {showLabels && (
          <PartLabel position={[x0 - 0.2, -0.95, 0]} name="Sugar–phosphate backbone" />
        )}
      </PartGroup>

      {/* ---- Phosphodiester bonds (the links between sugars via phosphate) ---- */}
      <PartGroup id="phosphodiester-bond" onSelect={onSelect}>
        {SEQ.slice(0, N - 1).map((_, i) => (
          <mesh
            key={i}
            position={[xOf(i) + SPACING / 2, 0.04, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.045, 0.045, SPACING - 0.34, 10]} />
            <meshStandardMaterial
              color="#f9a8d4"
              roughness={0.45}
              metalness={0.05}
              {...emissiveProps(sel('phosphodiester-bond'))}
            />
          </mesh>
        ))}
        {showLabels && (
          <PartLabel position={[xN + 0.35, 0.75, 0]} name="Phosphodiester bond" />
        )}
      </PartGroup>

      {/* ---- Nitrogenous bases projecting from each sugar ---- */}
      <PartGroup id="bases" onSelect={onSelect}>
        {SEQ.map((base, i) => {
          const bz = 0.38 + explode * 0.55;
          return (
            <group key={i}>
              {/* glycosidic connector */}
              <mesh position={[xOf(i), 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
                <meshStandardMaterial
                  color="#94a3b8"
                  roughness={0.5}
                  metalness={0.05}
                  {...emissiveProps(sel('bases'))}
                />
              </mesh>
              <mesh position={[xOf(i), 0, bz]}>
                <boxGeometry args={[0.3, 0.3, 0.13]} />
                <meshStandardMaterial
                  color={BASE_COLORS[base] ?? '#ffffff'}
                  roughness={0.4}
                  metalness={0.08}
                  {...emissiveProps(sel('bases'))}
                />
              </mesh>
            </group>
          );
        })}
        {showLabels && <PartLabel position={[0.2, 1.05, 0.9]} name="Nitrogenous bases" />}
      </PartGroup>

      {/* ---- 5' end: free phosphate ---- */}
      <PartGroup id="five-prime-end" onSelect={onSelect}>
        <mesh position={[x0 - SPACING / 2 - 0.12, 0, 0]}>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial
            color="#fb7185"
            roughness={0.35}
            metalness={0.15}
            {...emissiveProps(sel('five-prime-end'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[x0 - 1.15, 0.55, 0]} name="5' end" />}
      </PartGroup>

      {/* ---- 3' end: free hydroxyl ---- */}
      <PartGroup id="three-prime-end" onSelect={onSelect}>
        <mesh position={[xN + SPACING / 2 + 0.12, 0, 0]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial
            color="#f43f5e"
            roughness={0.35}
            metalness={0.15}
            {...emissiveProps(sel('three-prime-end'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[xN + 1.15, 0.55, 0]} name="3' end" />}
      </PartGroup>

      {/* base-letter caption (deterministic, decorative) */}
      {SEQ.map((base, i) => (
        <Html
          key={`bl${i}`}
          position={[xOf(i), 0, 0.38 + explode * 0.55]}
          center
          zIndexRange={[30, 0]}
          className="bv-label"
        >
          <span style={{ fontSize: 11, opacity: 0.9 }}>{base}</span>
        </Html>
      ))}
    </group>
  );
}
