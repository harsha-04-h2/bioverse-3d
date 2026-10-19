'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
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

const LOBE_X = 0.6;
const WALL_LAYERS = [
  { id: 'epidermis', name: 'Epidermis', radius: 0.85, tube: 0.075, color: '#fbbf24', z: 0 },
  { id: 'endothecium', name: 'Endothecium', radius: 0.7, tube: 0.075, color: '#f97316', z: 1 },
  { id: 'middle-layers', name: 'Middle layers', radius: 0.55, tube: 0.07, color: '#fb7185', z: 2 },
] as const;

// Four microsporangia: two per lobe, stacked vertically
const SPORANGIA: [number, number][] = [
  [-LOBE_X, 0.22],
  [-LOBE_X, -0.22],
  [LOBE_X, 0.22],
  [LOBE_X, -0.22],
];

/**
 * Transverse section of a dithecous anther (Fig 1.3). Concentric wall layers
 * around two lobes; each lobe holds two microsporangia lined by tapetum.
 * Explode separates the layers along z.
 */
export default function AntherTS(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const motherCells = useMemo<[number, number, number][][]>(() => {
    // 5 mother cells per sporangium, deterministic
    return SPORANGIA.map(([sx, sy], s) => {
      const arr: [number, number, number][] = [];
      for (let i = 0; i < 5; i += 1) {
        const a = rand(s * 40 + i * 7 + 1) * Math.PI * 2;
        const rr = rand(s * 40 + i * 7 + 2) * 0.08;
        arr.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, (rand(s * 40 + i * 7 + 3) - 0.5) * 0.2]);
      }
      return arr;
    });
  }, []);

  return (
    <group>
      {/* ---- Wall layers (per lobe, concentric rings) ---- */}
      {WALL_LAYERS.map((layer) => (
        <PartGroup
          key={layer.id}
          id={layer.id}
          position={[0, 0, explode * layer.z * 0.55]}
          onSelect={onSelect}
        >
          {[-LOBE_X, LOBE_X].map((lx) => (
            <mesh key={lx} position={[lx, 0, 0]}>
              <torusGeometry args={[layer.radius, layer.tube, 12, 48]} />
              <meshStandardMaterial color={layer.color} roughness={0.45} metalness={0.05} {...emissiveProps(sel(layer.id))} />
            </mesh>
          ))}
          {showLabels && (
            <PartLabel
              position={layer.id === 'epidermis' ? [-1.62, 0.95, explode * layer.z * 0.55] : layer.id === 'endothecium' ? [1.62, 0.95, explode * layer.z * 0.55] : [-1.62, -0.95, explode * layer.z * 0.55]}
              name={layer.name}
            />
          )}
        </PartGroup>
      ))}

      {/* ---- Tapetum: innermost ring lining each sporangium ---- */}
      <PartGroup id="tapetum" position={[0, 0, explode * 3 * 0.55]} onSelect={onSelect}>
        {SPORANGIA.map(([sx, sy], i) => (
          <mesh key={i} position={[sx, sy, 0]}>
            <torusGeometry args={[0.18, 0.06, 12, 32]} />
            <meshStandardMaterial color="#c084fc" roughness={0.45} metalness={0.05} {...emissiveProps(sel('tapetum'))} />
          </mesh>
        ))}
        {showLabels && (
          <PartLabel position={[1.05, -0.62, explode * 3 * 0.55]} name="Tapetum" />
        )}
      </PartGroup>

      {/* ---- Microspore mother cells inside each sporangium ---- */}
      <PartGroup id="mother-cells" position={[0, 0, explode * 4 * 0.55]} onSelect={onSelect}>
        {motherCells.map((cells, s) =>
          cells.map((p, i) => (
            <mesh key={`${s}-${i}`} position={p}>
              <sphereGeometry args={[0.06, 14, 14]} />
              <meshStandardMaterial color="#e9d5ff" roughness={0.45} metalness={0} {...emissiveProps(sel('mother-cells'))} />
            </mesh>
          )),
        )}
        {showLabels && (
          <PartLabel position={[-0.15, 0.62, explode * 4 * 0.55]} name="Microspore mother cells" />
        )}
      </PartGroup>

      {/* ---- Connective strand (decorative, between lobes) ---- */}
      <mesh position={[0, 0, explode * 0.5 * 0.55]}>
        <octahedronGeometry args={[0.16]} />
        <meshStandardMaterial color="#84cc16" roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}
