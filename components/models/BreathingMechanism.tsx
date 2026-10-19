'use client';

import { useMemo, type ReactNode } from 'react';
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

function PartGroup({
  id,
  position,
  scale,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  scale?: number | [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position}
      scale={scale ?? 1}
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

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

/** Rib arc in the XZ plane with the opening at the back (-z). */
function ribGeometry(R: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const gap = 1.6;
  const N = 56;
  for (let i = 0; i <= N; i += 1) {
    const th = gap / 2 - Math.PI / 2 + (i / N) * (Math.PI * 2 - gap);
    pts.push(new THREE.Vector3(R * Math.cos(th), 0, R * Math.sin(th)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 72, 0.055, 10, false);
}

const RIB_COUNT = 6;
const RIB_RADII = [0.82, 0.98, 1.1, 1.16, 1.12, 1.0];
const RIB_Y = [1.55, 1.22, 0.88, 0.54, 0.2, -0.14];

export default function BreathingMechanism(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  // 8 s loop: 4 s inspiration, 4 s expiration, smoothstepped for smooth motion.
  const phase = ((t % 8) + 8) % 8;
  const inspiring = phase < 4;
  const u = inspiring ? phase / 4 : (phase - 4) / 4;
  const s = u * u * (3 - 2 * u);
  const breath = inspiring ? s : 1 - s; // 0 = end-expiration, 1 = full inspiration

  const ribGeos = useMemo(() => RIB_RADII.map((r) => ribGeometry(r)), []);

  const ribScale = 1 + 0.11 * breath + explode * 0.18;
  const ribLift = 0.16 * breath;

  return (
    <group>
      {/* stage label */}
      {showLabels && (
        <Html position={[0, 2.75, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{inspiring ? 'Inspiration' : 'Expiration'}</span>
        </Html>
      )}

      {/* ---- rib cage + sternum + spine ---- */}
      <PartGroup id="ribs" position={explodeOffset([0, 0.4, 0], explode * 0.4)} scale={ribScale} onSelect={onSelect}>
        {ribGeos.map((geo, i) => (
          <mesh key={i} position={[0, RIB_Y[i] + ribLift, 0]} rotation={[0.1, 0, 0]} geometry={geo}>
            <meshStandardMaterial color="#e7c9a8" roughness={0.5} metalness={0.06} {...emissiveProps(sel('ribs'))} />
          </mesh>
        ))}
        {/* sternum: vertical bar at the front */}
        <mesh position={[0, 0.7 + ribLift, 1.02]}>
          <boxGeometry args={[0.24, 1.95, 0.15]} />
          <meshStandardMaterial color="#d9b48f" roughness={0.5} metalness={0.06} {...emissiveProps(sel('ribs'))} />
        </mesh>
        {/* spine: vertical bar at the back */}
        <mesh position={[0, 0.7, -1.0]}>
          <cylinderGeometry args={[0.13, 0.15, 2.1, 14]} />
          <meshStandardMaterial color="#c9a37e" roughness={0.5} metalness={0.06} {...emissiveProps(sel('ribs'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.55, 1.5, 0.5]} name="Ribs" />}
      </PartGroup>

      {/* ---- lungs: volume indicator ---- */}
      <PartGroup id="lungs" position={explodeOffset([0, 0.6, 0], explode * 0.5)} onSelect={onSelect}>
        {[-1, 1].map((side) => {
          const ex = explodeOffset([side * 0.9, 0, 0], explode);
          const k = 0.88 + 0.24 * breath;
          return (
            <mesh
              key={side}
              position={[side * 0.62 + ex[0], 0.55, 0]}
              scale={[0.72 * k, 1.02 * k, 0.6 * k]}
            >
              <sphereGeometry args={[1, 32, 32]} />
              <meshPhysicalMaterial
                color="#f2a3a3"
                transparent
                opacity={0.42}
                roughness={0.3}
                metalness={0}
                depthWrite={false}
                {...emissiveProps(sel('lungs'))}
              />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[-1.15, 0.1, 0.9]} name="Lungs" />}
      </PartGroup>

      {/* ---- diaphragm dome: contracts & flattens on inspiration ---- */}
      <PartGroup id="diaphragm" position={explodeOffset([0, -1.5, 0], explode)} onSelect={onSelect}>
        <mesh
          position={[0, -1.05 - 0.34 * breath, 0]}
          scale={[1 + 0.06 * breath, 1 - 0.48 * breath, 1 + 0.06 * breath]}
        >
          <sphereGeometry args={[1.55, 40, 20, 0, Math.PI * 2, 0, 1.15]} />
          <meshStandardMaterial color="#d4596b" roughness={0.5} metalness={0.05} {...emissiveProps(sel('diaphragm'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.75, -1.6, 0.3]} name="Diaphragm" />}
      </PartGroup>

      {/* caption of what the muscles are doing */}
      {showLabels && (
        <Html position={[0, -2.55, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>
            {inspiring ? 'Diaphragm contracts · ribs lift' : 'Diaphragm relaxes · ribs fall'}
          </span>
        </Html>
      )}
    </group>
  );
}
