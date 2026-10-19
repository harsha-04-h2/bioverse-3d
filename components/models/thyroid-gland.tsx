'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 19.3 — thyroid straddling the trachea.
   Left unit: ventral view (isthmus crosses the front of the trachea).
   Right unit: dorsal view (posterior face toward the viewer, showing the four
   parathyroid glands embedded on the back of the lobes).
   Tracheal rings are true C-shapes, open posteriorly like real cartilage. */

const RING_ARC = 4.8; // C-ring arc; gap centred posteriorly
const GAP_CENTER = RING_ARC + (Math.PI * 2 - RING_ARC) / 2;
const RING_RZ = -Math.PI / 2 - GAP_CENTER; // rotate gap to -z, then lay flat

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

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

const RINGS = 10;

function Trachea({ selectedId, onSelect, showLabels, caption, dorsal, explode }: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showLabels: boolean;
  caption: string;
  dorsal: boolean;
  explode: number;
}): JSX.Element {
  const sel = (id: string) => selectedId === id;
  const ringYs = useMemo(() => Array.from({ length: RINGS }, (_, i) => 1.7 - i * 0.42), []);
  return (
    <group>
      <PartGroup id="trachea" position={[0, 0, 0]} onSelect={onSelect}>
        {ringYs.map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, RING_RZ]}>
            <torusGeometry args={[0.55, 0.085, 10, 36, RING_ARC]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.35} metalness={0.05} {...emissiveProps(sel('trachea'))} />
          </mesh>
        ))}
        {/* posterior membranous wall bridging the C gaps */}
        <mesh position={[0, -0.2, -0.48]}>
          <boxGeometry args={[0.85, 4.1, 0.05]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.5} {...emissiveProps(sel('trachea'))} />
        </mesh>
        {/* larynx hint above */}
        <mesh position={[0, 2.35, 0]} scale={[1, 1.15, 0.85]}>
          <coneGeometry args={[0.5, 0.9, 4]} />
          <meshStandardMaterial color="#bfdbfe" roughness={0.4} transparent opacity={0.9} />
        </mesh>
        {showLabels && <PartLabel position={[1.35, -1.6, 0]} name="Trachea (C-rings)" />}
      </PartGroup>

      {/* thyroid lobes hugging the trachea */}
      {[-1, 1].map((s) => (
        <PartGroup
          key={s}
          id={s < 0 ? 'left-lobe' : 'right-lobe'}
          position={explodeOffset([s, 0.1, 0.15], explode)}
          onSelect={onSelect}
        >
          <mesh position={[s * 0.66, 0.35, 0.12]} scale={[0.72, 1.5, 0.7]}>
            <sphereGeometry args={[0.42, 26, 20]} />
            <meshStandardMaterial color="#c0564a" roughness={0.45} {...emissiveProps(sel(s < 0 ? 'left-lobe' : 'right-lobe'))} />
          </mesh>
          {showLabels && !dorsal && (
            <PartLabel position={[s * 1.55, 0.9, 0.1]} name={s < 0 ? 'Left lobe' : 'Right lobe'} />
          )}
        </PartGroup>
      ))}

      {/* isthmus across the front */}
      <PartGroup id="isthmus" position={explodeOffset([0, 0, 1], explode)} onSelect={onSelect}>
        <mesh position={[0, -0.42, 0.5]} scale={[1, 1, 1]}>
          <boxGeometry args={[1.05, 0.3, 0.28]} />
          <meshStandardMaterial color="#b04a40" roughness={0.45} {...emissiveProps(sel('isthmus'))} />
        </mesh>
        {showLabels && !dorsal && <PartLabel position={[0, -1.05, 0.55]} name="Isthmus" />}
      </PartGroup>

      {/* parathyroids on the posterior face (visible in dorsal view) */}
      <PartGroup id="parathyroid" position={explodeOffset([0, 0, -1], explode)} onSelect={onSelect}>
        {[
          [-0.66, 0.72, -0.28],
          [0.66, 0.72, -0.28],
          [-0.66, -0.05, -0.28],
          [0.66, -0.05, -0.28],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.115, 14, 12]} />
            <meshStandardMaterial
              color="#fbcfe8"
              emissive={sel('parathyroid') ? '#38bdf8' : '#f9a8d4'}
              emissiveIntensity={sel('parathyroid') ? 0.4 : 0.35}
              roughness={0.4}
            />
          </mesh>
        ))}
        {showLabels && dorsal && <PartLabel position={[1.35, 0.7, -0.3]} name="Parathyroid glands (×4)" />}
      </PartGroup>

      {showLabels && <PartLabel position={[0, -2.75, 0]} name={caption} />}
    </group>
  );
}

export default function ThyroidGland(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  return (
    <group>
      {/* ventral view */}
      <group position={[-2.3, 0, 0]}>
        <Trachea selectedId={selectedId} onSelect={onSelect} showLabels={showLabels} caption="Ventral view" dorsal={false} explode={explode} />
      </group>
      {/* dorsal view: rotated so the posterior face looks at the viewer */}
      <group position={[2.3, 0, 0]} rotation={[0, Math.PI, 0]}>
        <Trachea selectedId={selectedId} onSelect={onSelect} showLabels={showLabels} caption="Dorsal view" dorsal={true} explode={explode} />
      </group>
    </group>
  );
}
