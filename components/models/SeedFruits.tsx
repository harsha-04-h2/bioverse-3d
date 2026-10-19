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

const SEED_X = -2.7;
const APPLE_X = 0;
const STRAW_X = 2.7;

/** Achenes scattered on the strawberry receptacle surface. */
function Achenes({ selected }: { selected: boolean }): JSX.Element {
  const pts = useMemo<[number, number, number][]>(() => {
    // cone: apex down at y=-1.05, base rim at y=0.15, base radius 0.72
    const arr: [number, number, number][] = [];
    let placed = 0;
    let seed = 1;
    while (placed < 26 && seed < 500) {
      const yy = -0.95 + rand(seed) * 1.0; // -0.95..0.05
      const frac = (yy + 1.05) / 1.2; // 0 at apex → 1 at base
      const r = 0.72 * frac;
      const a = rand(seed + 500) * Math.PI * 2;
      arr.push([STRAW_X + Math.cos(a) * (r + 0.02), yy, Math.sin(a) * (r + 0.02)]);
      placed += 1;
      seed += 1;
    }
    return arr;
  }, []);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#fde68a" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

/** Apple seeds arranged in the 5-chambered core. */
function AppleSeeds({ selected }: { selected: boolean }): JSX.Element {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[APPLE_X + Math.cos(a) * 0.16, -0.05, Math.sin(a) * 0.16]} rotation={[0.3, a, 0]} scale={[1, 0.55, 1.4]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#78350f" roughness={0.5} metalness={0.05} {...emissiveProps(selected)} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Seed structure (coat, endosperm, embryo) plus two false fruits — apple
 * (fleshy thalamus around the core) and strawberry (achenes on a fleshy
 * receptacle) — Fig 1.15.
 */
export default function SeedFruits(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  return (
    <group>
      {/* ================= Seed ================= */}
      {/* seed coat: opened shell */}
      <PartGroup id="seed-coat" position={explodeOffset([SEED_X - 0.6, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[SEED_X, 0, 0]} scale={[1, 1.25, 0.9]}>
          <sphereGeometry args={[0.55, 28, 28, 0.6, 5.1]} />
          <meshStandardMaterial
            color="#b45309"
            roughness={0.55}
            metalness={0.05}
            side={THREE.DoubleSide}
            {...emissiveProps(sel('seed-coat'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[SEED_X - 0.85, 0.95, 0]} name="Seed coat" />}
      </PartGroup>

      {/* endosperm: food store */}
      <PartGroup id="endosperm" position={explodeOffset([SEED_X + 0.3, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[SEED_X, 0, 0]} scale={[0.78, 1.0, 0.7]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} metalness={0} {...emissiveProps(sel('endosperm'))} />
        </mesh>
        {showLabels && <PartLabel position={[SEED_X + 0.7, -0.75, 0]} name="Endosperm" />}
      </PartGroup>

      {/* embryo inside the seed */}
      <PartGroup id="seed-embryo" position={explodeOffset([SEED_X, 0.9, 0.5], explode)} onSelect={onSelect}>
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[SEED_X + s * 0.14, 0.15, 0.12]} rotation={[0, 0, s * -0.3]} scale={[0.5, 0.22, 0.6]}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color="#86efac" roughness={0.45} metalness={0.05} {...emissiveProps(sel('seed-embryo'))} />
          </mesh>
        ))}
        <mesh position={[SEED_X, -0.22, 0.1]}>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 10]} />
          <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('seed-embryo'))} />
        </mesh>
        {showLabels && <PartLabel position={[SEED_X + 0.05, 0.85, 0.35]} name="Embryo" />}
      </PartGroup>

      {/* ================= Apple (false fruit) ================= */}
      {/* fleshy thalamus: translucent so the core shows */}
      <PartGroup id="thalamus" position={explodeOffset([APPLE_X, 0.6, 0], explode)} onSelect={onSelect}>
        <mesh position={[APPLE_X, 0, 0]} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[1.0, 40, 40]} />
          <meshPhysicalMaterial
            color="#f87171"
            transparent
            opacity={0.4}
            roughness={0.35}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('thalamus'))}
          />
        </mesh>
        {/* core chamber wall */}
        <mesh position={[APPLE_X, -0.05, 0]}>
          <cylinderGeometry args={[0.32, 0.28, 0.55, 16, 1, true]} />
          <meshStandardMaterial
            color="#fecaca"
            transparent
            opacity={0.7}
            roughness={0.5}
            metalness={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('thalamus'))}
          />
        </mesh>
        {/* stalk + calyx */}
        <mesh position={[APPLE_X, 1.0, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.3, 10]} />
          <meshStandardMaterial color="#65a30d" roughness={0.55} metalness={0} {...emissiveProps(sel('thalamus'))} />
        </mesh>
        {showLabels && <PartLabel position={[APPLE_X - 1.35, 0.5, 0]} name="Fleshy thalamus" />}
      </PartGroup>

      {/* true seeds inside the core */}
      <PartGroup id="apple-seeds" position={explodeOffset([APPLE_X + 0.4, -0.6, 0.4], explode)} onSelect={onSelect}>
        <AppleSeeds selected={sel('apple-seeds')} />
        {showLabels && <PartLabel position={[APPLE_X + 0.75, -0.55, 0.3]} name="Seeds (true fruit)" />}
      </PartGroup>

      {/* ================= Strawberry (false fruit) ================= */}
      {/* fleshy receptacle: inverted cone */}
      <PartGroup id="receptacle" position={explodeOffset([STRAW_X, 0.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[STRAW_X, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.72, 1.2, 28]} />
          <meshStandardMaterial color="#ef4444" roughness={0.45} metalness={0.05} {...emissiveProps(sel('receptacle'))} />
        </mesh>
        {/* calyx leaves on top */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[STRAW_X + Math.cos(a) * 0.35, 0.22, Math.sin(a) * 0.35]}
              rotation={[Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1]}
            >
              <coneGeometry args={[0.12, 0.45, 8]} />
              <meshStandardMaterial color="#22c55e" roughness={0.5} metalness={0} {...emissiveProps(sel('receptacle'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[STRAW_X + 1.15, -0.35, 0]} name="Fleshy receptacle" />}
      </PartGroup>

      {/* achenes: the true fruits on the surface */}
      <PartGroup id="achenes" position={explodeOffset([STRAW_X - 0.5, -0.4, 0.5], explode)} onSelect={onSelect}>
        <Achenes selected={sel('achenes')} />
        {showLabels && <PartLabel position={[STRAW_X - 1.1, -0.95, 0]} name="Achenes (true fruits)" />}
      </PartGroup>
    </group>
  );
}
