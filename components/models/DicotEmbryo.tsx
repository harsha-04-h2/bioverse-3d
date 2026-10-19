'use client';

import { type ReactNode } from 'react';
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

const DX = -1.8; // dicot embryo center x
const GX = 1.8; // grass embryo center x

/**
 * Mature dicot embryo (plumule, 2 cotyledons, hypocotyl, radicle) beside a
 * grass embryo (scutellum, coleoptile, coleorhiza) — Fig 1.14.
 */
export default function DicotEmbryo(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  void rand;

  return (
    <group>
      {showLabels && (
        <Html position={[DX, 1.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Dicot embryo</span>
        </Html>
      )}
      {showLabels && (
        <Html position={[GX, 1.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Grass embryo</span>
        </Html>
      )}

      {/* ================= Dicot embryo ================= */}
      {/* cotyledons: two fleshy seed leaves */}
      <PartGroup id="cotyledon" position={explodeOffset([DX - 0.5, 0.6, 0], explode)} onSelect={onSelect}>
        {[-1, 1].map((s, i) => (
          <mesh
            key={i}
            position={[DX + s * 0.34, 0.62, 0]}
            rotation={[0, 0, s * -0.35]}
            scale={[0.62, 0.26, 0.8]}
          >
            <sphereGeometry args={[0.55, 28, 28]} />
            <meshStandardMaterial color="#86efac" roughness={0.45} metalness={0.05} {...emissiveProps(sel('cotyledon'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[DX - 1.15, 0.85, 0]} name="Cotyledons" />}
      </PartGroup>

      {/* plumule: shoot tip between the cotyledons */}
      <PartGroup id="plumule" position={explodeOffset([DX, 1.3, 0], explode)} onSelect={onSelect}>
        <mesh position={[DX, 0.92, 0]}>
          <coneGeometry args={[0.13, 0.34, 14]} />
          <meshStandardMaterial color="#22c55e" roughness={0.45} metalness={0.05} {...emissiveProps(sel('plumule'))} />
        </mesh>
        {showLabels && <PartLabel position={[DX + 0.75, 1.15, 0]} name="Plumule" />}
      </PartGroup>

      {/* hypocotyl: stem below the cotyledons */}
      <PartGroup id="hypocotyl" position={explodeOffset([DX, -0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[DX, -0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.13, 0.7, 14]} />
          <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('hypocotyl'))} />
        </mesh>
        {showLabels && <PartLabel position={[DX + 0.8, -0.05, 0]} name="Hypocotyl" />}
      </PartGroup>

      {/* radicle: embryonic root tip */}
      <PartGroup id="radicle" position={explodeOffset([DX, -1.1, 0], explode)} onSelect={onSelect}>
        <mesh position={[DX, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.5, 14]} />
          <meshStandardMaterial color="#65a30d" roughness={0.5} metalness={0} {...emissiveProps(sel('radicle'))} />
        </mesh>
        {showLabels && <PartLabel position={[DX - 0.8, -0.75, 0]} name="Radicle" />}
      </PartGroup>

      {/* ================= Grass embryo ================= */}
      {/* scutellum: single shield-shaped cotyledon */}
      <PartGroup id="scutellum" position={explodeOffset([GX - 0.6, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[GX - 0.28, 0.15, 0]} rotation={[0, 0, 0.35]} scale={[0.55, 0.2, 0.65]}>
          <sphereGeometry args={[0.55, 28, 28]} />
          <meshStandardMaterial color="#fde047" roughness={0.45} metalness={0.05} {...emissiveProps(sel('scutellum'))} />
        </mesh>
        {showLabels && <PartLabel position={[GX - 1.2, 0.35, 0]} name="Scutellum" />}
      </PartGroup>

      {/* plumule inside the coleoptile */}
      <PartGroup id="plumule" position={explodeOffset([GX + 0.5, 0.9, 0], explode)} onSelect={onSelect}>
        <mesh position={[GX + 0.28, 0.62, 0]}>
          <coneGeometry args={[0.09, 0.28, 12]} />
          <meshStandardMaterial color="#22c55e" roughness={0.45} metalness={0.05} {...emissiveProps(sel('plumule'))} />
        </mesh>
      </PartGroup>

      {/* coleoptile: hollow sheath over the plumule */}
      <PartGroup id="coleoptile" position={explodeOffset([GX + 0.6, 0.5, 0], explode)} onSelect={onSelect}>
        <mesh position={[GX + 0.28, 0.5, 0]}>
          <cylinderGeometry args={[0.17, 0.19, 0.6, 16, 1, true]} />
          <meshStandardMaterial
            color="#bbf7d0"
            transparent
            opacity={0.6}
            roughness={0.45}
            metalness={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('coleoptile'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[GX + 1.05, 0.65, 0]} name="Coleoptile" />}
      </PartGroup>

      {/* coleorhiza: sheath over the radicle */}
      <PartGroup id="coleorhiza" position={explodeOffset([GX + 0.6, -0.5, 0], explode)} onSelect={onSelect}>
        <mesh position={[GX + 0.28, -0.32, 0]}>
          <cylinderGeometry args={[0.18, 0.15, 0.42, 16, 1, true]} />
          <meshStandardMaterial
            color="#d9f99d"
            transparent
            opacity={0.6}
            roughness={0.45}
            metalness={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('coleorhiza'))}
          />
        </mesh>
        <mesh position={[GX + 0.28, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.09, 0.3, 12]} />
          <meshStandardMaterial color="#65a30d" roughness={0.5} metalness={0} {...emissiveProps(sel('coleorhiza'))} />
        </mesh>
        {showLabels && <PartLabel position={[GX + 1.05, -0.4, 0]} name="Coleorhiza" />}
      </PartGroup>

      {/* grass embryo axis */}
      <mesh position={[GX + 0.28, 0.1, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.35, 12]} />
        <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
