'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

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

/** Ovulation sub-loop (seconds, total 30): growth 0–8, rupture 8–11, release 11–20, reset 20–30. */
function ovulationState(p: number) {
  const swell = 1 + 0.12 * smooth(p / 8);
  const ruptured = smooth((p - 8) / 3);
  const drift = smooth((p - 11) / 9);
  const fadeOut = smooth((p - 20) / 10);
  return {
    swell,
    follicleOp: 1 - 0.75 * ruptured,
    ovumX: 0.85 + drift * 1.5,
    ovumY: -0.35 + drift * 0.95,
    ovumOp: ruptured * (1 - 0.92 * fadeOut),
    lutein: smooth((p - 20) / 8),
  };
}

/**
 * Ovary section with follicle development stages (NCERT Fig 2.7). Clockwise:
 * primordial → primary → secondary → tertiary → Graafian follicle, which
 * ruptures (animated ovulation loop) to release the ovum; the remnant becomes
 * the corpus luteum and later the pale corpus albicans.
 */
export default function OvaryFollicles(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const p = ((animTime % 30) + 30) % 30;
  const ov = ovulationState(p);

  const primordial = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => [
        -1.0 + (rand(i * 7 + 1) - 0.5) * 0.35,
        -0.35 + (rand(i * 7 + 2) - 0.5) * 0.35,
      ] as [number, number]),
    []
  );
  const corona = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return [Math.cos(a) * 0.24, Math.sin(a) * 0.24] as [number, number];
      }),
    []
  );

  return (
    <group>
      {/* ovary stroma — sectioned shell with a wedge cut away */}
      <mesh position={[0, 0, -0.35]} scale={[1.7, 1.15, 1.0]}>
        <sphereGeometry args={[1, 48, 32, Math.PI * 0.15, Math.PI * 1.5, 0, Math.PI]} />
        <meshStandardMaterial
          color="#e3a6a1"
          transparent
          opacity={0.5}
          roughness={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ---- primordial follicles ---- */}
      <PartGroup id="primordial" position={explodeOffset([-1.0, -0.35, 0.3], explode)} onSelect={onSelect}>
        {primordial.map((pt, i) => (
          <mesh key={i} position={[pt[0], pt[1], 0.3]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.45} {...emissiveProps(sel('primordial'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.55, 0.15, 0.3]} name="Primordial follicles" />}
      </PartGroup>

      {/* ---- primary follicle ---- */}
      <PartGroup id="primary" position={explodeOffset([-0.55, -0.8, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[-0.55, -0.8, 0.3]}>
          <sphereGeometry args={[0.15, 20, 14]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.45} {...emissiveProps(sel('primary'))} />
        </mesh>
        <mesh position={[-0.55, -0.8, 0.38]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.45} {...emissiveProps(sel('primary'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, -1.25, 0.3]} name="Primary follicle" />}
      </PartGroup>

      {/* ---- secondary follicle ---- */}
      <PartGroup id="secondary" position={explodeOffset([-0.1, -0.9, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[-0.1, -0.9, 0.3]}>
          <sphereGeometry args={[0.26, 24, 18]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.45} {...emissiveProps(sel('secondary'))} />
        </mesh>
        <mesh position={[-0.1, -0.86, 0.3]}>
          <sphereGeometry args={[0.1, 14, 10]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} roughness={0.3} {...emissiveProps(sel('secondary'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.35, -1.25, 0.3]} name="Secondary follicle" />}
      </PartGroup>

      {/* ---- tertiary follicle ---- */}
      <PartGroup id="tertiary" position={explodeOffset([0.4, -0.7, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[0.4, -0.7, 0.3]}>
          <sphereGeometry args={[0.34, 24, 18]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.45} {...emissiveProps(sel('tertiary'))} />
        </mesh>
        <mesh position={[0.4, -0.62, 0.3]}>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0.75} roughness={0.3} {...emissiveProps(sel('tertiary'))} />
        </mesh>
        <mesh position={[0.52, -0.78, 0.38]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.45} {...emissiveProps(sel('tertiary'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.95, -1.1, 0.3]} name="Tertiary follicle" />}
      </PartGroup>

      {/* ---- Graafian follicle + animated ovulation ---- */}
      <PartGroup id="graafian" position={explodeOffset([0.85, -0.3, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[0.85, -0.3, 0.3]} scale={ov.swell}>
          <sphereGeometry args={[0.48, 28, 20]} />
          <meshStandardMaterial
            color="#2563eb"
            transparent
            opacity={ov.follicleOp}
            roughness={0.45}
            {...emissiveProps(sel('graafian') || sel('ovulation'))}
          />
        </mesh>
        <mesh position={[0.85, -0.14, 0.3]} scale={ov.swell}>
          <sphereGeometry args={[0.28, 18, 14]} />
          <meshPhysicalMaterial
            color="#bfdbfe"
            transparent
            opacity={0.5 * ov.follicleOp}
            roughness={0.2}
            depthWrite={false}
            {...emissiveProps(sel('graafian') || sel('ovulation'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[1.5, 0.35, 0.3]} name="Graafian follicle" />}
      </PartGroup>

      {/* ---- released ovum (ovulation event) ---- */}
      <PartGroup id="ovulation" position={explodeOffset([1.6, 0.15, 0.3], explode)} onSelect={onSelect}>
        <group position={[ov.ovumX, ov.ovumY, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.16, 20, 14]} />
            <meshStandardMaterial
              color="#fbbf24"
              transparent
              opacity={ov.ovumOp}
              roughness={0.4}
              {...emissiveProps(sel('ovulation'))}
            />
          </mesh>
          {corona.map((c, i) => (
            <mesh key={i} position={[c[0], c[1], 0]}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshStandardMaterial
                color="#fde68a"
                transparent
                opacity={ov.ovumOp}
                roughness={0.5}
                {...emissiveProps(sel('ovulation'))}
              />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[2.15, 0.9, 0.3]} name="Ovulation" />}
      </PartGroup>

      {/* ---- corpus luteum ---- */}
      <PartGroup id="corpus-luteum" position={explodeOffset([0.7, 0.5, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[0.7, 0.5, 0.3]} scale={1 + 0.06 * ov.lutein}>
          <sphereGeometry args={[0.4, 24, 18]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.55} {...emissiveProps(sel('corpus-luteum'))} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[0.7 + Math.cos(a) * 0.36, 0.5 + Math.sin(a) * 0.36, 0.3]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#d97706" roughness={0.55} {...emissiveProps(sel('corpus-luteum'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[0.7, 1.15, 0.3]} name="Corpus luteum" />}
      </PartGroup>

      {/* ---- corpus albicans ---- */}
      <PartGroup id="corpus-albicans" position={explodeOffset([0.05, 0.8, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[0.05, 0.8, 0.3]}>
          <sphereGeometry args={[0.27, 20, 14]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} {...emissiveProps(sel('corpus-albicans'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.55, 1.15, 0.3]} name="Corpus albicans" />}
      </PartGroup>
    </group>
  );
}
