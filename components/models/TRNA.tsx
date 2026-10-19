'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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

function ClickGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position?: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position ?? [0, 0, 0]}
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

const COL_C = '#fbbf24';
const COL_A = '#34d399';
const COL_STEM = '#38bdf8';

export default function TRNA(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const geos = useMemo(
    () => ({
      stem3: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, 1.9, 0)]),
        16,
        0.07,
        10,
        false,
      ),
      stem5: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0.3, 0.2, 0), new THREE.Vector3(0.3, 1.9, 0)]),
        16,
        0.07,
        10,
        false,
      ),
      arm: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.15, 0.25, 0),
          new THREE.Vector3(0.5, -0.45, 0.06),
          new THREE.Vector3(0.8, -1.05, 0.02),
          new THREE.Vector3(0.92, -1.48, 0),
        ]),
        40,
        0.07,
        10,
        false,
      ),
    }),
    [],
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const explodeY = explode * 0.5;

  return (
    <group rotation={[0, animTime * 0.25, 0]}>
      {/* ---- acceptor stem: paired 3' and 5' strands ---- */}
      <ClickGroup id="acceptor-stem" onSelect={onSelect}>
        <mesh geometry={geos.stem3} position={[0, explodeY, 0]}>
          <meshStandardMaterial color={COL_STEM} roughness={0.4} metalness={0.1} {...emissiveProps(sel('acceptor-stem'))} />
        </mesh>
        <mesh geometry={geos.stem5} position={[0, explodeY, 0]}>
          <meshStandardMaterial color={COL_STEM} roughness={0.4} metalness={0.1} {...emissiveProps(sel('acceptor-stem'))} />
        </mesh>
        {[0.55, 0.95, 1.35].map((y) => (
          <mesh key={y} position={[0.15, y + explodeY, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.3, 0.08, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(sel('acceptor-stem'))} />
          </mesh>
        ))}
        {/* 5' end marker */}
        <mesh position={[0.3, 1.98 + explodeY, 0]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} {...emissiveProps(sel('acceptor-stem'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, 1.15, 0]} name="Acceptor stem" />}
      </ClickGroup>

      {/* ---- 3' CCA end ---- */}
      <ClickGroup id="cca-end" onSelect={onSelect}>
        {[
          { y: 2.02, c: COL_C, n: 'C' },
          { y: 2.24, c: COL_C, n: 'C' },
          { y: 2.46, c: COL_A, n: 'A' },
        ].map((b, i) => (
          <mesh key={i} position={[0, b.y + explodeY + explode * 0.3, 0]}>
            <sphereGeometry args={[0.12, 14, 14]} />
            <meshStandardMaterial color={b.c} roughness={0.4} {...emissiveProps(sel('cca-end'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-0.85, 2.5, 0]} name="3′ CCA end" />}
      </ClickGroup>

      {/* ---- amino acid attached to the 3' end ---- */}
      <ClickGroup id="amino-acid" onSelect={onSelect}>
        <mesh position={[0.12, 2.72 + explodeY + explode * 0.6, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} {...emissiveProps(sel('amino-acid'))} />
        </mesh>
        <mesh position={[-0.1, 2.86 + explodeY + explode * 0.6, 0.06]}>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.4} {...emissiveProps(sel('amino-acid'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.95, 2.85, 0]} name="Amino acid" />}
      </ClickGroup>

      {/* ---- anticodon arm + loop ---- */}
      <ClickGroup id="anticodon-loop" onSelect={onSelect}>
        <mesh geometry={geos.arm}>
          <meshStandardMaterial color="#60a5fa" roughness={0.4} metalness={0.1} {...emissiveProps(sel('anticodon-loop'))} />
        </mesh>
        <mesh position={[0.92, -1.72, 0]}>
          <torusGeometry args={[0.24, 0.07, 10, 28]} />
          <meshStandardMaterial color="#818cf8" roughness={0.4} metalness={0.1} {...emissiveProps(sel('anticodon-loop'))} />
        </mesh>
        {/* the three anticodon bases */}
        {[200, 250, 290].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <mesh key={deg} position={[0.92 + Math.cos(a) * 0.24, -1.72 + Math.sin(a) * 0.24, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#f87171" roughness={0.4} {...emissiveProps(sel('anticodon-loop'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[1.85, -1.75, 0]} name="Anticodon loop" />}
      </ClickGroup>

      {/* ---- D arm (small side loop near the elbow) ---- */}
      <ClickGroup id="d-arm" onSelect={onSelect}>
        <mesh position={[0.42, -0.42, 0.12]} rotation={[0, Math.PI / 2.4, 0]}>
          <torusGeometry args={[0.17, 0.055, 10, 24]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.45} {...emissiveProps(sel('d-arm'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.15, -0.5, 0]} name="D arm" />}
      </ClickGroup>

      {/* ---- TψC arm (small loop on the acceptor-stem leg) ---- */}
      <ClickGroup id="t-arm" onSelect={onSelect}>
        <mesh position={[0.15, 0.72 + explodeY, 0.14]} rotation={[0, Math.PI / 2.4, 0]}>
          <torusGeometry args={[0.17, 0.055, 10, 24]} />
          <meshStandardMaterial color="#2dd4bf" roughness={0.45} {...emissiveProps(sel('t-arm'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.95, 0.72, 0]} name="TψC arm" />}
      </ClickGroup>
    </group>
  );
}
