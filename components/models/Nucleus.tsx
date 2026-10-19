'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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
const PHI = Math.PI * 2 * 0.82;
const PHI_START = -Math.PI / 2 - PHI / 2;
const ENVELOPE_R = 1.4;

/** Nuclear pore complexes: small rings dotted on the envelope, kept clear of the cut wedge. */
function usePores(count: number) {
  return useMemo(() => {
    const pores: { position: [number, number, number]; rotation: [number, number, number] }[] = [];
    let seed = 7;
    const zAxis = new THREE.Vector3(0, 0, 1);
    while (pores.length < count && seed < 500) {
      const u = rand(seed);
      const v = rand(seed + 1000);
      const theta = Math.acos(2 * u - 1);
      const phi = v * Math.PI * 2;
      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi),
      );
      // keep clear of the +z cut wedge
      if (dir.z > 0.8) {
        seed += 1;
        continue;
      }
      const quat = new THREE.Quaternion().setFromUnitVectors(zAxis, dir.clone().normalize());
      const euler = new THREE.Euler().setFromQuaternion(quat);
      pores.push({
        position: [dir.x * ENVELOPE_R, dir.y * ENVELOPE_R, dir.z * ENVELOPE_R],
        rotation: [euler.x, euler.y, euler.z],
      });
      seed += 1;
    }
    return pores;
  }, [count]);
}

const CHROMATIN_BASES: [number, number, number][] = [
  [0.8, 0.3, -0.5],
  [-0.7, 0.5, 0.4],
  [0.5, -0.7, 0.5],
  [-0.5, -0.4, -0.7],
];

export default function Nucleus(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const pores = usePores(12);

  // Chromatin threads: tangled curves floating in the nucleoplasm.
  const chromatinGeos = useMemo(() => {
    return CHROMATIN_BASES.map((_, ci) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 6; k += 1) {
        const r = 0.25 + rand(ci * 40 + k * 3) * 0.55;
        const a = rand(ci * 40 + k * 3 + 500) * Math.PI * 2;
        const b = rand(ci * 40 + k * 3 + 900) * Math.PI - Math.PI / 2;
        pts.push(
          new THREE.Vector3(
            r * Math.cos(a) * Math.cos(b),
            r * Math.sin(b) * 0.8,
            r * Math.sin(a) * Math.cos(b),
          ),
        );
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.035, 8, false);
    });
  }, []);

  useEffect(() => {
    return () => {
      chromatinGeos.forEach((g) => g.dispose());
    };
  }, [chromatinGeos]);

  return (
    <group>
      {/* ---- Double nuclear envelope, cut open at the front ---- */}
      <PartGroup id="nuclear-envelope" position={explodeOffset([0, 1.2, 0.3], explode)} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[ENVELOPE_R, 48, 32, PHI_START, PHI]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('nuclear-envelope'))} />
        </mesh>
        {/* nuclear pore complexes ride with the outer envelope (6 s pulse loop) */}
        <PartGroup id="nuclear-pore" position={[0, 0, 0]} onSelect={onSelect}>
          {pores.map((p, i) => (
            <mesh key={i} position={p.position} rotation={p.rotation}>
              <torusGeometry args={[0.09, 0.028, 10, 24]} />
              <meshStandardMaterial
                color="#7c3aed"
                emissive={sel('nuclear-pore') ? '#38bdf8' : "#a78bfa"}
                emissiveIntensity={sel('nuclear-pore') ? 0.4 : 0.25 + 0.25 * Math.sin((animTime * 2 * Math.PI) / 6 + i * 0.9)}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
          ))}
          {showLabels && pores.length > 0 && (
            <PartLabel
              position={[pores[0].position[0], pores[0].position[1] + 0.35, pores[0].position[2]]}
              name="Nuclear pore"
            />
          )}
        </PartGroup>
        {showLabels && <PartLabel position={[0, 1.78, 0.3]} name="Nuclear envelope" />}
      </PartGroup>
      <PartGroup id="nuclear-envelope" position={explodeOffset([0, -1.1, 0.2], explode)} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[1.28, 48, 32, PHI_START, PHI * 0.995]} />
          <meshStandardMaterial color="#c4b5fd" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('nuclear-envelope'))} />
        </mesh>
      </PartGroup>

      {/* ---- Nucleoplasm: translucent inner volume ---- */}
      <PartGroup id="nucleoplasm" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[1.12, 40, 32]} />
          <meshStandardMaterial
            color="#ddd6fe"
            transparent
            opacity={0.3}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('nucleoplasm'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.05, -0.55, 0.7]} name="Nucleoplasm" />}
      </PartGroup>

      {/* ---- Nucleolus: dense sphere ---- */}
      <PartGroup id="nucleolus" position={explodeOffset([0.9, 0.6, 0.9], explode)} onSelect={onSelect}>
        <mesh position={[0.35, 0.3, 0.25]}>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.45} metalness={0.05} {...emissiveProps(sel('nucleolus'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.35, 1.05, 0.25]} name="Nucleolus" />}
      </PartGroup>

      {/* ---- Chromatin threads ---- */}
      {CHROMATIN_BASES.map((base, i) => (
        <PartGroup key={i} id="chromatin" position={explodeOffset(base, explode)} onSelect={onSelect}>
          <mesh geometry={chromatinGeos[i]}>
            <meshStandardMaterial color="#f472b6" roughness={0.45} metalness={0.05} {...emissiveProps(sel('chromatin'))} />
          </mesh>
          {showLabels && i === 0 && <PartLabel position={[0.95, 0.65, -0.45]} name="Chromatin" />}
        </PartGroup>
      ))}
    </group>
  );
}
