'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
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

const SITES = [
  { id: 'a-site', name: 'A site', x: 0.38, color: '#fbbf24', base: [0.5, 0.5, 0.9] as [number, number, number] },
  { id: 'p-site', name: 'P site', x: 0.0, color: '#34d399', base: [0, 0.4, 1.0] as [number, number, number] },
  { id: 'e-site', name: 'E site', x: -0.38, color: '#60a5fa', base: [-0.5, 0.5, 0.9] as [number, number, number] },
];

export default function Ribosome(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // mRNA strand threading through the cleft between the subunits.
  const mrnaGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 10; k += 1) {
      pts.push(
        new THREE.Vector3(
          -2.6 + k * 0.52,
          -0.02 + 0.1 * Math.sin(k * 1.3),
          0.08 * Math.sin(k * 2.1 + 1),
        ),
      );
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.05, 10, false);
  }, []);

  useEffect(() => {
    return () => {
      mrnaGeo.dispose();
    };
  }, [mrnaGeo]);

  // Gentle ratchet-like rock of the two subunits (8 s loop).
  const rock = 0.045 * Math.sin((animTime * 2 * Math.PI) / 8);

  return (
    <group>
      {/* ---- Large subunit ---- */}
      <PartGroup id="large-subunit" position={explodeOffset([0, 1.0, 0], explode)} onSelect={onSelect}>
        <group rotation={[0, 0, rock]}>
          <mesh position={[0, 0.5, 0]} scale={[1.15, 0.95, 1.0]}>
            <sphereGeometry args={[1, 40, 32]} />
            <meshStandardMaterial color="#6366f1" roughness={0.42} metalness={0.08} {...emissiveProps(sel('large-subunit'))} />
          </mesh>
          {/* surface protuberances */}
          <mesh position={[0.55, 1.28, 0.1]}>
            <sphereGeometry args={[0.38, 24, 18]} />
            <meshStandardMaterial color="#818cf8" roughness={0.42} metalness={0.08} {...emissiveProps(sel('large-subunit'))} />
          </mesh>
          <mesh position={[-0.52, 1.22, -0.15]}>
            <sphereGeometry args={[0.3, 24, 18]} />
            <meshStandardMaterial color="#818cf8" roughness={0.42} metalness={0.08} {...emissiveProps(sel('large-subunit'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[0, 1.95, 0]} name="Large subunit" />}
      </PartGroup>

      {/* ---- Small subunit: two lobes ---- */}
      <PartGroup id="small-subunit" position={explodeOffset([0, -1.0, 0], explode)} onSelect={onSelect}>
        <group rotation={[0, 0, -rock]}>
          <mesh position={[-0.38, -0.52, 0.12]}>
            <sphereGeometry args={[0.55, 32, 24]} />
            <meshStandardMaterial color="#a5b4fc" roughness={0.42} metalness={0.08} {...emissiveProps(sel('small-subunit'))} />
          </mesh>
          <mesh position={[0.38, -0.56, -0.1]}>
            <sphereGeometry args={[0.44, 32, 24]} />
            <meshStandardMaterial color="#a5b4fc" roughness={0.42} metalness={0.08} {...emissiveProps(sel('small-subunit'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[0, -1.42, 0]} name="Small subunit" />}
      </PartGroup>

      {/* ---- mRNA threading through the cleft ---- */}
      <PartGroup id="mrna" position={explodeOffset([1.6, 0, 0], explode)} onSelect={onSelect}>
        <mesh geometry={mrnaGeo}>
          <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.08} {...emissiveProps(sel('mrna'))} />
        </mesh>
        {showLabels && <PartLabel position={[-2.1, 0.35, 0]} name="mRNA" />}
      </PartGroup>

      {/* ---- A / P / E sites: tRNA handoff pulses A -> P -> E (6 s loop) ---- */}
      {SITES.map((s, i) => (
        <PartGroup key={s.id} id={s.id} position={explodeOffset(s.base, explode)} onSelect={onSelect}>
          <mesh position={[s.x, 0.12, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={s.color}
              transparent
              opacity={0.88}
              emissive={sel(s.id) ? '#38bdf8' : s.color}
              emissiveIntensity={
                sel(s.id) ? 0.4 : 0.35 + 0.35 * Math.sin((animTime * 2 * Math.PI) / 6 - i * ((2 * Math.PI) / 3))
              }
              roughness={0.35}
              metalness={0}
            />
          </mesh>
          {showLabels && <PartLabel position={[s.x, 0.48, 0.1]} name={s.name} />}
        </PartGroup>
      ))}
    </group>
  );
}
