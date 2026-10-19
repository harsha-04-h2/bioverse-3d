'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
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

const AMPULLA: [number, number, number] = [0.65, 0, 0];
const NIPPLE: [number, number, number] = [1.4, 0, 0];

/**
 * Mammary gland — sectional view (NCERT Fig 2.4). Milk is secreted by the
 * alveoli, carried inward by lactiferous ducts, stored briefly in the ampulla,
 * and released through the nipple. Adipose tissue fills the surrounding stroma.
 */
export default function MammaryGland(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const clusters = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const cx = -1.55 + rand(i * 11 + 1) * 0.9;
        const cy = -0.85 + rand(i * 11 + 2) * 1.7;
        const cz = (rand(i * 11 + 3) - 0.5) * 0.7;
        const cells = Array.from({ length: 9 }, (_, j) => {
          const th = rand(i * 51 + j * 7 + 1) * Math.PI * 2;
          const ph = rand(i * 51 + j * 7 + 2) * Math.PI;
          const r = 0.1 + rand(i * 51 + j * 7 + 3) * 0.12;
          return {
            x: cx + r * Math.sin(ph) * Math.cos(th),
            y: cy + r * Math.sin(ph) * Math.sin(th),
            z: cz + r * Math.cos(ph),
          };
        });
        return { center: [cx, cy, cz] as [number, number, number], cells };
      }),
    []
  );

  const ductGeos = useMemo(
    () =>
      clusters.map((c) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(...c.center),
          new THREE.Vector3((c.center[0] + 0.15) / 2, c.center[1] * 0.55, c.center[2] * 0.5),
          new THREE.Vector3(0.15, c.center[1] * 0.15, 0),
        ]);
        return new THREE.TubeGeometry(curve, 24, 0.055, 8, false);
      }),
    [clusters]
  );

  const adipose = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        pos: [
          -1.7 + rand(i * 13 + 1) * 2.4,
          -1.25 + rand(i * 13 + 2) * 2.5,
          (rand(i * 13 + 3) - 0.5) * 1.1,
        ] as [number, number, number],
        r: 0.22 + rand(i * 13 + 4) * 0.16,
        rot: [rand(i * 13 + 5) * Math.PI, rand(i * 13 + 6) * Math.PI, 0] as [number, number, number],
      })),
    []
  );

  return (
    <group>
      {/* ---- alveoli clusters ---- */}
      <PartGroup id="alveoli" position={explodeOffset([-1.1, 0, 0], explode)} onSelect={onSelect}>
        {clusters.map((c, i) => (
          <group key={i}>
            {c.cells.map((p, j) => (
              <mesh key={j} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.085, 14, 10]} />
                <meshStandardMaterial color="#f9a8d4" roughness={0.45} metalness={0.03} {...emissiveProps(sel('alveoli'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.9, 1.25, 0]} name="Alveoli" />}
      </PartGroup>

      {/* ---- lactiferous ducts ---- */}
      <PartGroup id="lactiferous-duct" position={explodeOffset([-0.35, 0, 0], explode)} onSelect={onSelect}>
        {ductGeos.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial color="#f472b6" roughness={0.45} metalness={0.05} {...emissiveProps(sel('lactiferous-duct'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-0.35, -1.15, 0]} name="Lactiferous ducts" />}
      </PartGroup>

      {/* ---- ampulla ---- */}
      <PartGroup id="ampulla" position={explodeOffset(AMPULLA, explode)} onSelect={onSelect}>
        <mesh position={AMPULLA} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.13, 0.5, 8, 16]} />
          <meshStandardMaterial color="#ec4899" roughness={0.45} metalness={0.05} {...emissiveProps(sel('ampulla'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.65, 0.75, 0]} name="Ampulla" />}
      </PartGroup>

      {/* ---- nipple ---- */}
      <PartGroup id="nipple" position={explodeOffset(NIPPLE, explode)} onSelect={onSelect}>
        <mesh position={NIPPLE} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.21, 0.5, 24]} />
          <meshStandardMaterial color="#be7b6e" roughness={0.55} metalness={0.02} {...emissiveProps(sel('nipple'))} />
        </mesh>
        <mesh position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.07, 32]} />
          <meshStandardMaterial color="#d99a8c" roughness={0.55} metalness={0.02} {...emissiveProps(sel('nipple'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.75, 0.6, 0]} name="Nipple" />}
      </PartGroup>

      {/* ---- adipose tissue ---- */}
      <PartGroup id="adipose-tissue" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        {adipose.map((a, i) => (
          <mesh key={i} position={a.pos} rotation={a.rot}>
            <icosahedronGeometry args={[a.r, 1]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} metalness={0} {...emissiveProps(sel('adipose-tissue'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.2, 1.5, 0]} name="Adipose tissue" />}
      </PartGroup>
    </group>
  );
}
