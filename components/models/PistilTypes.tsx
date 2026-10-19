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

function TitleLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
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

const SX = -1.7; // syncarpous center x
const AX = 1.7; // apocarpous center x

/** Papillae dots on the Hibiscus stigma branches. */
function StigmaPapillae({ selected }: { selected: boolean }): JSX.Element {
  const dots = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let b = 0; b < 5; b += 1) {
      const a = (b / 5) * Math.PI * 2;
      for (let j = 0; j < 3; j += 1) {
        const r = 0.32 + j * 0.1;
        arr.push([
          SX + Math.cos(a) * r + (rand(b * 20 + j) - 0.5) * 0.1,
          1.15 + j * 0.16,
          Math.sin(a) * r + (rand(b * 20 + j + 50) - 0.5) * 0.1,
        ]);
      }
    }
    return arr;
  }, []);
  return (
    <group>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

/** Ovules on the central placenta inside the syncarpous ovary. */
function Ovules({ selected }: { selected: boolean }): JSX.Element {
  const pts = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * Math.PI * 2 + 0.3;
      const ring = i < 5 ? 0 : 1;
      arr.push([
        SX + Math.cos(a) * (0.16 + ring * 0.14),
        -1.12 + ring * 0.3 + (rand(i * 7) - 0.5) * 0.1,
        Math.sin(a) * (0.16 + ring * 0.14),
      ]);
    }
    return arr;
  }, []);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.095, 14, 14]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.45} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Syncarpous (Hibiscus: fused carpels) vs apocarpous (Papaver-like: free carpels)
 * pistils, side by side (Fig 1.7).
 */
export default function PistilTypes(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const apocarpels = useMemo(() => {
    const arr: { x: number; z: number }[] = [];
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      arr.push({ x: AX + Math.cos(a) * 0.42, z: Math.sin(a) * 0.42 });
    }
    return arr;
  }, []);

  return (
    <group>
      {showLabels && <TitleLabel position={[SX, 2.1, 0]} name="Syncarpous — Hibiscus" />}
      {showLabels && <TitleLabel position={[AX, 2.1, 0]} name="Apocarpous — Papaver-like" />}

      {/* ================= Syncarpous (Hibiscus) ================= */}
      {/* stigma: 5-branched */}
      <PartGroup id="stigma" position={explodeOffset([SX, 1.4, 0], explode)} onSelect={onSelect}>
        {[0, 1, 2, 3, 4].map((b) => {
          const a = (b / 5) * Math.PI * 2;
          return (
            <mesh
              key={b}
              position={[SX + Math.cos(a) * 0.22, 1.06, Math.sin(a) * 0.22]}
              rotation={[Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55]}
            >
              <cylinderGeometry args={[0.055, 0.075, 0.5, 10]} />
              <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0} {...emissiveProps(sel('stigma'))} />
            </mesh>
          );
        })}
        <StigmaPapillae selected={sel('stigma')} />
        {showLabels && <PartLabel position={[SX - 0.95, 1.55, 0]} name="Stigma (5-branched)" />}
      </PartGroup>

      {/* style: single, long */}
      <PartGroup id="style" position={explodeOffset([SX, 0.3, 0], explode)} onSelect={onSelect}>
        <mesh position={[SX, 0.25, 0]}>
          <cylinderGeometry args={[0.11, 0.13, 1.5, 14]} />
          <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('style'))} />
        </mesh>
        {showLabels && <PartLabel position={[SX - 0.85, 0.35, 0]} name="Style" />}
      </PartGroup>

      {/* ovary: 5 fused carpels, translucent so ovules show */}
      <PartGroup id="ovary" position={explodeOffset([SX, -0.9, 0], explode)} onSelect={onSelect}>
        {[0, 1, 2, 3, 4].map((b) => {
          const a = (b / 5) * Math.PI * 2;
          return (
            <mesh key={b} position={[SX + Math.cos(a) * 0.26, -0.9, Math.sin(a) * 0.26]}>
              <sphereGeometry args={[0.4, 24, 24]} />
              <meshStandardMaterial
                color="#84cc16"
                transparent
                opacity={0.55}
                roughness={0.45}
                metalness={0}
                depthWrite={false}
                {...emissiveProps(sel('ovary'))}
              />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[SX - 1.05, -1.05, 0]} name="Ovary (5 fused carpels)" />}
      </PartGroup>

      {/* ovules inside the syncarpous ovary */}
      <PartGroup id="ovule" position={explodeOffset([SX + 0.7, -0.9, 0.4], explode)} onSelect={onSelect}>
        <Ovules selected={sel('ovule')} />
        {showLabels && <PartLabel position={[SX + 0.75, -0.6, 0.3]} name="Ovules" />}
      </PartGroup>

      {/* ================= Apocarpous (Papaver-like) ================= */}
      {/* separate stigmas */}
      <PartGroup id="stigma" position={explodeOffset([AX, 0.2, 0], explode)} onSelect={onSelect}>
        {apocarpels.map((c, i) => (
          <mesh key={i} position={[c.x, 0.12, c.z]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0} {...emissiveProps(sel('stigma'))} />
          </mesh>
        ))}
      </PartGroup>

      {/* separate styles */}
      <PartGroup id="style" position={explodeOffset([AX, -0.25, 0], explode)} onSelect={onSelect}>
        {apocarpels.map((c, i) => (
          <mesh key={i} position={[c.x, -0.28, c.z]}>
            <cylinderGeometry args={[0.06, 0.07, 0.7, 10]} />
            <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('style'))} />
          </mesh>
        ))}
      </PartGroup>

      {/* separate ovaries */}
      <PartGroup id="ovary" position={explodeOffset([AX, -0.85, 0], explode)} onSelect={onSelect}>
        {apocarpels.map((c, i) => (
          <mesh key={i} position={[c.x, -0.88, c.z]}>
            <sphereGeometry args={[0.3, 20, 20]} />
            <meshStandardMaterial
              color="#84cc16"
              transparent
              opacity={0.7}
              roughness={0.45}
              metalness={0}
              depthWrite={false}
              {...emissiveProps(sel('ovary'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[AX + 1.0, -0.85, 0]} name="Free ovaries" />}
      </PartGroup>
    </group>
  );
}
