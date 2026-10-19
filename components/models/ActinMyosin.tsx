'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import type { BioModelProps } from './types';

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

const ACTIN_Y = 1.1;
const ACTIN_X0 = -2.6;
const ACTIN_DX = 0.225;
const ACTIN_N = 25;
const HELIX_R = 0.17;

// G-actin subunits: two intertwined helical strands.
function fActinStrand(strand: 0 | 1): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < ACTIN_N; i += 1) {
    const a = i * 0.5 + strand * Math.PI;
    pts.push([ACTIN_X0 + i * ACTIN_DX, ACTIN_Y + HELIX_R * Math.cos(a), HELIX_R * Math.sin(a)]);
  }
  return pts;
}

// Tropomyosin: a slender thread winding along the F-actin groove.
function tropomyosinCurve(offset: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 48; i += 1) {
    const x = ACTIN_X0 - 0.1 + (i / 48) * (ACTIN_N * ACTIN_DX + 0.2);
    const a = x * 1.05 + offset + 0.55;
    pts.push(new THREE.Vector3(x, ACTIN_Y + 0.27 * Math.cos(a), 0.27 * Math.sin(a)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export default function ActinMyosin(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const strand0 = useMemo(() => fActinStrand(0), []);
  const strand1 = useMemo(() => fActinStrand(1), []);
  const tropoGeo0 = useMemo(() => new THREE.TubeGeometry(tropomyosinCurve(0), 96, 0.035, 8, false), []);
  const tropoGeo1 = useMemo(() => new THREE.TubeGeometry(tropomyosinCurve(Math.PI), 96, 0.035, 8, false), []);

  // Troponin complexes spaced along the filament.
  const troponinX = [-1.95, -0.65, 0.65, 1.95];

  const tropoLift = explode * 0.8;
  const troponinLift = explode * 1.4;
  const myosinDrop = -explode * 1.2;

  return (
    <group>
      {/* ---- F-actin: double-helical strand of G-actin subunits ---- */}
      <PartGroup id="f-actin" position={[0, 0, 0]} onSelect={onSelect}>
        {[strand0, strand1].map((strand, s) =>
          strand.map((p, i) => (
            <mesh key={`${s}-${i}`} position={p}>
              <sphereGeometry args={[0.155, 14, 14]} />
              <meshStandardMaterial
                color={s === 0 ? '#f87171' : '#ef4444'}
                roughness={0.45}
                metalness={0.05}
                {...emissiveProps(sel('f-actin'))}
              />
            </mesh>
          )),
        )}
        {showLabels && <PartLabel position={[2.75, ACTIN_Y + 0.35, 0]} name="F-actin" />}
      </PartGroup>

      {/* ---- Tropomyosin threads in the filament grooves ---- */}
      <PartGroup id="tropomyosin" position={[0, tropoLift, 0]} onSelect={onSelect}>
        {[tropoGeo0, tropoGeo1].map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.05} {...emissiveProps(sel('tropomyosin'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-2.5, ACTIN_Y - 0.6 + tropoLift, 0.3]} name="Tropomyosin" />}
      </PartGroup>

      {/* ---- Troponin complexes at intervals along the strand ---- */}
      <PartGroup id="troponin" position={[0, troponinLift, 0]} onSelect={onSelect}>
        {troponinX.map((x, k) => (
          <group key={k} position={[x, ACTIN_Y + 0.42, 0]}>
            {[
              [0, 0, 0],
              [0.16, 0.1, 0.08],
              [-0.14, 0.12, -0.06],
            ].map((o, j) => (
              <mesh key={j} position={o as [number, number, number]}>
                <sphereGeometry args={[0.1, 14, 14]} />
                <meshStandardMaterial color="#a78bfa" roughness={0.35} metalness={0.1} {...emissiveProps(sel('troponin'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[0.65, ACTIN_Y + 0.85 + troponinLift, 0]} name="Troponin" />}
      </PartGroup>

      {/* ---- Myosin monomer: long tail rod + two globular heads ---- */}
      <group position={[0, myosinDrop, 0]}>
        <PartGroup id="myosin-tail" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.3, -1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 3.8, 12]} />
            <meshStandardMaterial color="#2dd4bf" roughness={0.4} metalness={0.1} {...emissiveProps(sel('myosin-tail'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.6, -1.75, 0]} name="Myosin tail" />}
        </PartGroup>

        <PartGroup id="myosin-head" position={[0, 0, 0]} onSelect={onSelect}>
          {[
            [1.95, -1.12, 0.14],
            [1.95, -1.48, -0.14],
          ].map((p, i) => (
            <group key={i}>
              {/* short neck joining head to tail */}
              <mesh position={[1.72, -1.3 + (i === 0 ? 0.09 : -0.09), 0]} rotation={[0, 0, Math.PI / 2.4]}>
                <cylinderGeometry args={[0.05, 0.06, 0.5, 10]} />
                <meshStandardMaterial color="#5eead4" roughness={0.4} metalness={0.1} {...emissiveProps(sel('myosin-head'))} />
              </mesh>
              <mesh position={p as [number, number, number]}>
                <sphereGeometry args={[0.24, 20, 16]} />
                <meshStandardMaterial color="#14b8a6" roughness={0.35} metalness={0.1} {...emissiveProps(sel('myosin-head'))} />
              </mesh>
            </group>
          ))}
          {showLabels && <PartLabel position={[2.35, -0.85, 0]} name="Myosin head" />}
        </PartGroup>
      </group>
    </group>
  );
}
