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

/** Explode offset: base direction normalized * explode * 1.4. */
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

const BONE = '#e9dfc8';
const CAVITY = '#2b2b30';

function BoneMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={BONE} roughness={0.6} metalness={0.02} {...em} />;
}

/** Mandible: U-shaped jaw tube. Slightly separated below the cranium (mouth ajar). */
function useMandibleCurve(): THREE.CatmullRomCurve3 {
  return useMemo(() => {
    const pts: [number, number, number][] = [
      [-0.72, 0.42, 0.42], // left joint (near ear)
      [-0.68, -0.1, 0.52],
      [-0.38, -0.42, 0.66],
      [0, -0.52, 0.72], // chin
      [0.38, -0.42, 0.66],
      [0.68, -0.1, 0.52],
      [0.72, 0.42, 0.42], // right joint
    ];
    return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  }, []);
}

export default function Skull(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  const mandibleCurve = useMandibleCurve();

  // subtle surface jitter on the cranium for a less-perfect look
  const craniumGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 48, 32);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const n = 1 + (rand(i) - 0.5) * 0.03;
      pos.setXYZ(i, pos.getX(i) * n, pos.getY(i) * n, pos.getZ(i) * n);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      {/* ---- Cranium: rounded braincase ---- */}
      <PartGroup id="cranium" position={explodeOffset([0, 1, -0.15], explode)} onSelect={onSelect}>
        <mesh geometry={craniumGeo} position={[0, 1.25, -0.05]} scale={[0.95, 1.05, 1.0]}>
          <BoneMat selected={sel('cranium')} />
        </mesh>
        {/* brow ridge hint */}
        <mesh position={[0, 1.02, 0.78]} rotation={[0.15, 0, 0]} scale={[1, 0.45, 0.6]}>
          <sphereGeometry args={[0.55, 24, 16]} />
          <BoneMat selected={sel('cranium')} />
        </mesh>
        {showLabels && <PartLabel position={[0, 2.6, -0.1]} name="Cranium" />}
      </PartGroup>

      {/* ---- Eye sockets: dark inset cups with bony rims ---- */}
      <PartGroup id="eye-socket" position={explodeOffset([0, 0.4, 1], explode)} onSelect={onSelect}>
        {([-1, 1] as const).map((s) => (
          <group key={s} position={[0.37 * s, 0.78, 0.78]}>
            <mesh>
              <sphereGeometry args={[0.26, 24, 16]} />
              <meshStandardMaterial color={CAVITY} roughness={0.9} metalness={0} {...emissiveProps(sel('eye-socket'))} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.27, 0.055, 10, 28]} />
              <BoneMat selected={sel('eye-socket')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.15, 1.1, 0.85]} name="Eye socket" />}
      </PartGroup>

      {/* ---- Nasal cavity: dark triangular opening ---- */}
      <PartGroup id="nasal-cavity" position={explodeOffset([0.3, 0, 1], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.42, 0.92]} rotation={[Math.PI, Math.PI / 4, 0]}>
          <coneGeometry args={[0.15, 0.34, 4]} />
          <meshStandardMaterial color={CAVITY} roughness={0.9} metalness={0} {...emissiveProps(sel('nasal-cavity'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.85, 0.32, 1.0]} name="Nasal cavity" />}
      </PartGroup>

      {/* ---- Zygomatic (cheek) bones: curved bars at the sides ---- */}
      <PartGroup id="zygomatic" position={explodeOffset([1, 0.1, 0.3], explode)} onSelect={onSelect}>
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[0.84 * s, 0.52, 0.5]} rotation={[0.2, 0, 1.25 * s]}>
            <capsuleGeometry args={[0.09, 0.42, 8, 16]} />
            <BoneMat selected={sel('zygomatic')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.45, 0.5, 0.55]} name="Zygomatic bone" />}
      </PartGroup>

      {/* ---- Maxilla: upper jaw mass ---- */}
      <PartGroup id="maxilla" position={explodeOffset([-0.3, -0.2, 1], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.12, 0.58]} scale={[0.62, 0.4, 0.45]}>
          <sphereGeometry args={[1, 32, 24]} />
          <BoneMat selected={sel('maxilla')} />
        </mesh>
        {showLabels && <PartLabel position={[-1.05, -0.1, 0.8]} name="Maxilla" />}
      </PartGroup>

      {/* ---- Mandible: lower jaw, slightly separated ---- */}
      <PartGroup id="mandible" position={explodeOffset([0, -1, 0.35], explode)} onSelect={onSelect}>
        <mesh>
          <tubeGeometry args={[mandibleCurve, 40, 0.13, 12, false]} />
          <BoneMat selected={sel('mandible')} />
        </mesh>
        {/* chin boss */}
        <mesh position={[0, -0.5, 0.72]} scale={[1.1, 0.8, 0.9]}>
          <sphereGeometry args={[0.14, 20, 16]} />
          <BoneMat selected={sel('mandible')} />
        </mesh>
        {showLabels && <PartLabel position={[1.05, -0.85, 0.7]} name="Mandible" />}
      </PartGroup>
    </group>
  );
}
