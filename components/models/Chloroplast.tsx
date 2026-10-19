'use client';

import { useMemo, type ReactNode } from 'react';
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

// Wedge cut facing +z: the missing wedge is centred on the +z axis.
const PHI = Math.PI * 2 * 0.8;
const PHI_START = -Math.PI / 2 - PHI / 2;

const GRANA: [number, number, number][] = [
  [-0.72, 0.02, 0.12],
  [0.12, 0.06, -0.28],
  [0.82, -0.04, 0.18],
];
const DISCS = 7;

export default function Chloroplast(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Stroma lamellae: thin connectors spanning between neighbouring grana stacks.
  const lamellae = useMemo(
    () =>
      ([
        [GRANA[0], GRANA[1]],
        [GRANA[1], GRANA[2]],
      ] as [typeof GRANA[number], typeof GRANA[number]][]).map(([a, b]) => {
        const va = new THREE.Vector3(a[0], 0.18, a[2]);
        const vb = new THREE.Vector3(b[0], 0.18, b[2]);
        const dir = vb.clone().sub(va);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        const euler = new THREE.Euler().setFromQuaternion(quat);
        const mid = va.clone().add(vb).multiplyScalar(0.5);
        return {
          position: [mid.x, mid.y, mid.z] as [number, number, number],
          rotation: [euler.x, euler.y, euler.z] as [number, number, number],
          length: len,
        };
      }),
    [],
  );

  return (
    <group>
      {/* ---- Double envelope, cut open at the front ---- */}
      <PartGroup id="outer-envelope" position={explodeOffset([0, 1.1, 0.25], explode)} onSelect={onSelect}>
        <mesh scale={[1.5, 0.8, 0.8]}>
          <sphereGeometry args={[1, 48, 32, PHI_START, PHI]} />
          <meshStandardMaterial color="#86efac" roughness={0.4} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('outer-envelope'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, 1.12, 0.2]} name="Outer envelope" />}
      </PartGroup>
      <PartGroup id="inner-envelope" position={explodeOffset([0, -1.0, 0.2], explode)} onSelect={onSelect}>
        <mesh scale={[1.5, 0.8, 0.8]}>
          <sphereGeometry args={[0.9, 48, 32, PHI_START, PHI * 0.995]} />
          <meshStandardMaterial color="#4ade80" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('inner-envelope'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.1, -0.62, 0.5]} name="Inner envelope" />}
      </PartGroup>

      {/* ---- Stroma: translucent inner volume ---- */}
      <PartGroup id="stroma" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh scale={[1.42, 0.66, 0.66]}>
          <sphereGeometry args={[0.78, 32, 24]} />
          <meshStandardMaterial
            color="#bbf7d0"
            transparent
            opacity={0.28}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('stroma'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-0.35, -0.42, 0.42]} name="Stroma" />}
      </PartGroup>

      {/* ---- Grana: stacks of thylakoid discs (4 s photosynthetic shimmer) ---- */}
      {GRANA.map((g, gi) => (
        <PartGroup key={gi} id="granum" position={explodeOffset([g[0] * 1.4, 0.45, g[2]], explode)} onSelect={onSelect}>
          <group position={g}>
            {Array.from({ length: DISCS }, (_, j) => {
              const shimmer = 0.22 + 0.22 * Math.sin((animTime * 2 * Math.PI) / 4 + gi * 2.1 + j * 0.35);
              const disc = (
                <mesh position={[0, -0.21 + j * 0.07, 0]}>
                  <cylinderGeometry args={[0.26, 0.26, 0.045, 32]} />
                  <meshStandardMaterial
                    color="#16a34a"
                    emissive="#22c55e"
                    emissiveIntensity={shimmer + (sel('granum') ? 0.5 : 0)}
                    roughness={0.4}
                    metalness={0.1}
                  />
                </mesh>
              );
              // The middle disc of the first stack is the clickable "thylakoid".
              return j === 3 && gi === 0 ? (
                <PartGroup key={j} id="thylakoid" position={[0, 0, 0]} onSelect={onSelect}>
                  <mesh position={[0, -0.21 + j * 0.07, 0]}>
                    <cylinderGeometry args={[0.26, 0.26, 0.045, 32]} />
                    <meshStandardMaterial
                      color="#16a34a"
                      emissive={sel('thylakoid') ? '#38bdf8' : "#22c55e"}
                      emissiveIntensity={sel('thylakoid') ? 0.4 : shimmer}
                      roughness={0.4}
                      metalness={0.1}
                    />
                  </mesh>
                </PartGroup>
              ) : (
                <group key={j}>{disc}</group>
              );
            })}
            {showLabels && gi === 0 && <PartLabel position={[-0.1, 0.62, 0]} name="Granum" />}
            {showLabels && gi === 0 && <PartLabel position={[0.52, 0.02, 0]} name="Thylakoid" />}
          </group>
        </PartGroup>
      ))}

      {/* ---- Stroma lamellae: thin tubules linking the grana ---- */}
      <PartGroup id="stroma-lamella" position={explodeOffset([0, 0.8, 0], explode)} onSelect={onSelect}>
        {lamellae.map((l, k) => (
          <mesh key={k} position={l.position} rotation={l.rotation}>
            <cylinderGeometry args={[0.028, 0.028, l.length, 12]} />
            <meshStandardMaterial color="#4ade80" roughness={0.42} metalness={0.08} {...emissiveProps(sel('stroma-lamella'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.45, 0.52, -0.1]} name="Stroma lamella" />}
      </PartGroup>

      {/* ---- Starch grain: stored carbohydrate in the stroma ---- */}
      <PartGroup id="starch-grain" position={explodeOffset([0.8, 0.6, 0.8], explode)} onSelect={onSelect}>
        <mesh position={[0.45, 0.32, 0.25]} scale={[0.24, 0.17, 0.17]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} metalness={0} {...emissiveProps(sel('starch-grain'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.45, 0.62, 0.25]} name="Starch grain" />}
      </PartGroup>
    </group>
  );
}
