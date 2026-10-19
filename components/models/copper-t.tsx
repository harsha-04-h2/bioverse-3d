'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Explode offset: base direction * explode. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.8);
  return [v.x, v.y, v.z];
}

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
  children: React.ReactNode;
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

/** Tapered tube between two points (fallopian tubes). */
function TubeBetween({ a, b, r0, r1, color, opacity }: { a: [number, number, number]; b: [number, number, number]; r0: number; r1: number; color: string; opacity: number }): JSX.Element {
  const { position, rotation, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const length = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quat);
    const mid = va.clone().add(vb).multiplyScalar(0.5);
    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[r1, r0, length, 14]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.45} depthWrite={false} />
    </mesh>
  );
}

/** Pear-shaped uterus body via lathe — translucent so the device inside stays visible. */
function UterusBody({ selected }: { selected: boolean }): JSX.Element {
  const geometry = useMemo(() => {
    const profile: [number, number][] = [
      [0.001, -1.95],
      [0.24, -1.85],
      [0.3, -1.5],
      [0.34, -1.15],
      [0.5, -0.8],
      [0.72, -0.4],
      [0.9, 0.0],
      [0.98, 0.4],
      [0.92, 0.8],
      [0.75, 1.15],
      [0.5, 1.42],
      [0.22, 1.58],
      [0.001, 1.64],
    ];
    const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#f472b6"
        transparent
        opacity={0.3}
        roughness={0.35}
        metalness={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        {...emissiveProps(selected)}
      />
    </mesh>
  );
}

/** Copper wire wound as a helix around the stem. */
function CopperCoil({ selected }: { selected: boolean }): JSX.Element {
  const geometry = useMemo(() => {
    const turns = 13;
    const yTop = 0.95;
    const yBot = -0.95;
    const radius = 0.115;
    const pts: THREE.Vector3[] = [];
    const steps = turns * 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ang = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(ang) * radius, yTop + (yBot - yTop) * t, Math.sin(ang) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 320, 0.038, 10, false);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#c87f3f"
        metalness={0.95}
        roughness={0.3}
        emissive={selected ? '#38bdf8' : '#000000'}
        emissiveIntensity={selected ? 0.45 : 0}
      />
    </mesh>
  );
}

const T_ARMS_Y = 1.12;
const T_ARMS_HALF = 0.78;

export default function CopperT(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  return (
    <group>
      {/* ---- Uterus context: translucent body + fallopian tubes ---- */}
      <PartGroup id="uterus" position={explodeOffset([0, 0, -1.1], explode)} onSelect={onSelect}>
        <UterusBody selected={sel('uterus')} />
        {/* Cervix hint: short opaque band at the bottom */}
        <mesh position={[0, -1.72, 0]}>
          <cylinderGeometry args={[0.3, 0.26, 0.42, 20]} />
          <meshStandardMaterial color="#f9a8d4" transparent opacity={0.55} roughness={0.45} depthWrite={false} {...emissiveProps(sel('uterus'))} />
        </mesh>
        <TubeBetween a={[-0.72, 1.18, 0]} b={[-1.45, 1.62, 0]} r0={0.14} r1={0.1} color="#f9a8d4" opacity={0.5} />
        <TubeBetween a={[0.72, 1.18, 0]} b={[1.45, 1.62, 0]} r0={0.14} r1={0.1} color="#f9a8d4" opacity={0.5} />
        {showLabels && <PartLabel position={[1.35, 0.35, 0]} name="Uterus" />}
        {showLabels && <PartLabel position={[-1.75, 1.85, 0]} name="Fallopian tube" />}
        {showLabels && <PartLabel position={[0, -2.15, 0]} name="Cervix" />}
      </PartGroup>

      {/* ---- T frame: vertical stem ---- */}
      <PartGroup id="stem" position={explodeOffset([0, -1, 0.25], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.062, 0.062, 2.3, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.05} {...emissiveProps(sel('stem'))} />
        </mesh>
        {/* Retrieval string hanging into the cervix */}
        <mesh position={[0, -1.32, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.45, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} {...emissiveProps(sel('stem'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.55, -0.55, 0]} name="Stem" />}
      </PartGroup>

      {/* ---- Copper coil wound around the stem ---- */}
      <PartGroup id="copper-coil" position={explodeOffset([0.85, 0, 0.4], explode)} onSelect={onSelect}>
        <CopperCoil selected={sel('copper-coil')} />
        {showLabels && <PartLabel position={[0.75, 0.55, 0]} name="Copper wire coil" />}
      </PartGroup>

      {/* ---- T-arms: flexible horizontal bar resting at the fundus ---- */}
      <PartGroup id="t-arms" position={explodeOffset([0, 1, 0.25], explode)} onSelect={onSelect}>
        <mesh position={[-T_ARMS_HALF / 2, T_ARMS_Y, 0]} rotation={[0, 0, Math.PI / 2 - 0.12]}>
          <cylinderGeometry args={[0.058, 0.058, T_ARMS_HALF, 14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.05} {...emissiveProps(sel('t-arms'))} />
        </mesh>
        <mesh position={[T_ARMS_HALF / 2, T_ARMS_Y, 0]} rotation={[0, 0, Math.PI / 2 + 0.12]}>
          <cylinderGeometry args={[0.058, 0.058, T_ARMS_HALF, 14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.05} {...emissiveProps(sel('t-arms'))} />
        </mesh>
        <mesh position={[0, T_ARMS_Y, 0]}>
          <sphereGeometry args={[0.075, 14, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.05} {...emissiveProps(sel('t-arms'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.15, 1.45, 0]} name="T-arms" />}
      </PartGroup>

      {/* Fundus annotation: correct placement marker */}
      {showLabels && <PartLabel position={[0, 2.05, 0]} name="Fundus — T sits at the top" />}
    </group>
  );
}
