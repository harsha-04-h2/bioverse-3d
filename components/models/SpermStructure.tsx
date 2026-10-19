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

/**
 * Sperm structure (NCERT Fig 2.6). Head carries the haploid nucleus capped by
 * the enzyme-filled acrosome; the neck anchors the tail; the middle piece is
 * packed with mitochondria that power the tail's swimming motion.
 */
export default function SpermStructure(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const mitoHelixGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 5;
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * Math.PI * 2 * turns;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.125, 1.1 - (i / 60) * 0.72, Math.sin(a) * 0.125));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 120, 0.035, 8, false);
  }, []);

  const tailGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.38, 0),
      new THREE.Vector3(0.03, -0.2, 0),
      new THREE.Vector3(-0.03, -0.8, 0),
      new THREE.Vector3(0.02, -1.4, 0),
      new THREE.Vector3(0, -1.7, 0),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.038, 8, false);
  }, []);

  const endPieceGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.7, 0),
      new THREE.Vector3(0.02, -1.95, 0),
      new THREE.Vector3(0, -2.15, 0),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.018, 8, false);
  }, []);

  const tailSway = Math.sin(animTime * 3) * 0.05;

  return (
    <group>
      {/* ---- acrosome ---- */}
      <PartGroup id="acrosome" position={explodeOffset([0, 1.85, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.78, 0]} scale={[1, 1, 0.72]}>
          <sphereGeometry args={[0.3, 24, 16, 0, Math.PI * 2, 0, 1.15]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.05} {...emissiveProps(sel('acrosome'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.85, 1.95, 0]} name="Acrosome" />}
      </PartGroup>

      {/* ---- nucleus ---- */}
      <PartGroup id="nucleus" position={explodeOffset([0, 1.5, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.5, 0]} scale={[0.86, 1.35, 0.58]}>
          <sphereGeometry args={[0.3, 28, 20]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.05} {...emissiveProps(sel('nucleus'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.95, 1.5, 0]} name="Nucleus" />}
      </PartGroup>

      {/* ---- neck ---- */}
      <PartGroup id="neck" position={explodeOffset([0, 1.18, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.18, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.16, 14]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.45} metalness={0.05} {...emissiveProps(sel('neck'))} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#6d28d9" roughness={0.45} {...emissiveProps(sel('neck'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.85, 1.15, 0]} name="Neck" />}
      </PartGroup>

      {/* ---- middle piece ---- */}
      <PartGroup id="middle-piece" position={explodeOffset([0, 0.72, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.74, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.78, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.45} metalness={0.05} {...emissiveProps(sel('middle-piece'))} />
        </mesh>
        <mesh geometry={mitoHelixGeo}>
          <meshStandardMaterial color="#0ea5e9" roughness={0.4} metalness={0.1} {...emissiveProps(sel('middle-piece'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.05, 0.72, 0]} name="Middle piece (mitochondria)" />}
      </PartGroup>

      {/* ---- tail ---- */}
      <PartGroup id="tail" position={explodeOffset([0, -0.9, 0], explode)} onSelect={onSelect}>
        <group rotation={[0, 0, tailSway]}>
          <mesh geometry={tailGeo}>
            <meshStandardMaterial color="#93c5fd" roughness={0.45} metalness={0.05} {...emissiveProps(sel('tail'))} />
          </mesh>
          <mesh geometry={endPieceGeo}>
            <meshStandardMaterial color="#bfdbfe" roughness={0.45} metalness={0.05} {...emissiveProps(sel('tail'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[0.9, -1.1, 0]} name="Tail" />}
      </PartGroup>
    </group>
  );
}
