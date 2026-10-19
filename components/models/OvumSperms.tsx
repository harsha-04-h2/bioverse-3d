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

function MiniSperm({ sway }: { sway: number }): JSX.Element {
  return (
    <group rotation={[0, 0, sway]}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.22, 12]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.45} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.01, 0.9, 8]} />
        <meshStandardMaterial color="#bfdbfe" roughness={0.45} />
      </mesh>
    </group>
  );
}

/**
 * Ovum surrounded by sperm (NCERT Fig 2.10). The ovum is wrapped by the zona
 * pellucida and an outer corona radiata of follicle cells; several sperm
 * approach it, one of which has penetrated the zona — the fertilising sperm.
 */
export default function OvumSperms(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const corona = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const th = rand(i * 11 + 1) * Math.PI * 2;
        const ph = rand(i * 11 + 2) * Math.PI;
        const r = 1.28;
        const px = r * Math.sin(ph) * Math.cos(th);
        const py = r * Math.cos(ph);
        const pz = r * Math.sin(ph) * Math.sin(th);
        return {
          pos: [px, py, pz] as [number, number, number],
          rot: [ph, 0, th] as [number, number, number],
        };
      }),
    []
  );

  const approaching = useMemo(
    () =>
      [
        { pos: [-1.9, 1.1, 0.6] as [number, number, number], seed: 5 },
        { pos: [1.9, 0.7, -0.8] as [number, number, number], seed: 12 },
        { pos: [-0.7, -2.0, 0.9] as [number, number, number], seed: 23 },
        { pos: [0.4, 2.1, -0.5] as [number, number, number], seed: 34 },
      ],
    []
  );

  const sway = (seed: number) => Math.sin(animTime * 3.5 + seed) * 0.1;

  const orient = (pos: [number, number, number]): [number, number, number] => {
    const ang = Math.atan2(0 - pos[1], 0 - pos[0]);
    return [0, 0, ang + Math.PI];
  };

  return (
    <group>
      {/* ---- ovum ---- */}
      <PartGroup id="ovum" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[0.8, 40, 28]} />
          <meshStandardMaterial color="#fcd9a8" roughness={0.45} metalness={0.02} {...emissiveProps(sel('ovum'))} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.34, 24, 18]} />
          <meshStandardMaterial color="#d97706" roughness={0.45} {...emissiveProps(sel('ovum'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, -1.85, 0]} name="Ovum" />}
      </PartGroup>

      {/* ---- zona pellucida ---- */}
      <PartGroup id="zona-pellucida" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh scale={1 + explode * 0.25}>
          <sphereGeometry args={[1.02, 40, 28]} />
          <meshPhysicalMaterial
            color="#a5b4fc"
            transparent
            opacity={0.3}
            roughness={0.15}
            depthWrite={false}
            {...emissiveProps(sel('zona-pellucida'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.7, 0.15, 0]} name="Zona pellucida" />}
      </PartGroup>

      {/* ---- corona radiata ---- */}
      <PartGroup id="corona-radiata" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        {corona.map((c, i) => (
          <mesh key={i} position={c.pos} rotation={c.rot} scale={1 + explode * 0.45}>
            <capsuleGeometry args={[0.07, 0.3, 6, 12]} />
            <meshStandardMaterial color="#fde68a" roughness={0.5} {...emissiveProps(sel('corona-radiata'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.85, -0.6, 0]} name="Corona radiata" />}
      </PartGroup>

      {/* ---- approaching sperm ---- */}
      <PartGroup id="sperm" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        {approaching.map((s, i) => (
          <group
            key={i}
            position={[s.pos[0] * (1 + explode * 0.3), s.pos[1] * (1 + explode * 0.3), s.pos[2] * (1 + explode * 0.3)]}
          >
            <group rotation={orient(s.pos)}>
              <MiniSperm sway={sway(s.seed)} />
            </group>
          </group>
        ))}
        {/* fertilising sperm — head embedded in the zona */}
        <group position={[0.62, 0.72, 0]} rotation={[0, 0, -0.9]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.22, 12]} />
            <meshStandardMaterial color="#60a5fa" roughness={0.4} {...emissiveProps(sel('sperm'))} />
          </mesh>
          <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2 + sway(99)]}>
            <cylinderGeometry args={[0.025, 0.01, 1.0, 8]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.45} {...emissiveProps(sel('sperm'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[2.35, 1.25, 0]} name="Spermatozoa" />}
      </PartGroup>
    </group>
  );
}
