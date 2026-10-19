'use client';

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

const CYCLE = 8; // seconds per contraction/relaxation loop
const RELAXED_HALF = 2.2; // Z-line at ±2.2 when relaxed
const CONTRACTED_HALF = 1.25; // Z-line at ±1.25 when contracted
const ACTIN_LEN = 1.5; // thin filament length (constant)
const MYOSIN_HALF = 0.9; // thick filament half-length (constant)

const ACTIN_RING: [number, number][] = [];
for (let i = 0; i < 6; i += 1) {
  const a = (i / 6) * Math.PI * 2;
  ACTIN_RING.push([Math.cos(a) * 0.45, Math.sin(a) * 0.45]);
}

const DISC_ROT: [number, number, number] = [0, 0, Math.PI / 2];

export default function SlidingFilament(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  const p = (((t % CYCLE) + CYCLE) % CYCLE) / CYCLE;
  const c = 0.5 - 0.5 * Math.cos(2 * Math.PI * p); // 0 relaxed -> 1 contracted -> 0
  const contracting = Math.sin(2 * Math.PI * p) > 0;

  // The textbook-correct motion: Z-lines move together; filament lengths do not change.
  const halfLen = RELAXED_HALF + (CONTRACTED_HALF - RELAXED_HALF) * c;

  const iBandWidth = Math.max(0.05, halfLen - MYOSIN_HALF);
  const iBandCenter = (halfLen + MYOSIN_HALF) / 2;
  const hZoneWidth = Math.max(0.06, 2 * (halfLen - ACTIN_LEN));

  const stateText =
    c > 0.8 ? 'Contracted' : c < 0.2 ? 'Relaxed' : contracting ? 'Contracting…' : 'Relaxing…';

  return (
    <group>
      {/* ---- Z-lines + their anchored thin filaments (move as one unit) ---- */}
      <PartGroup id="z-line" position={[0, 0, 0]} onSelect={onSelect}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * halfLen, 0, 0]}>
            <mesh rotation={DISC_ROT}>
              <cylinderGeometry args={[1.0, 1.0, 0.14, 40]} />
              <meshStandardMaterial color="#8b5cf6" roughness={0.45} metalness={0.1} {...emissiveProps(sel('z-line'))} />
            </mesh>
            {ACTIN_RING.map(([ry, rz], i) => (
              <mesh key={i} position={[-side * ACTIN_LEN / 2, ry, rz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, ACTIN_LEN, 10]} />
                <meshStandardMaterial color="#f87171" roughness={0.45} metalness={0.05} {...emissiveProps(sel('z-line'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[-halfLen, 1.35, 0]} name="Z-line" />}
      </PartGroup>

      {/* ---- Thick filaments: fixed at the centre, constant length ---- */}
      <group position={[0, 0, 0]}>
        {[
          [0.32, 0],
          [-0.32, 0],
          [0, 0.32],
          [0, -0.32],
        ].map(([ry, rz], i) => (
          <mesh key={i} position={[0, ry, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, MYOSIN_HALF * 2, 14]} />
            <meshStandardMaterial color="#2dd4bf" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
        {/* M-line */}
        <mesh rotation={DISC_ROT}>
          <cylinderGeometry args={[0.85, 0.85, 0.06, 36]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.5} roughness={0.3} depthWrite={false} />
        </mesh>
      </group>

      {/* ---- I-band markers: shrink as Z-lines move together ---- */}
      <PartGroup id="i-band" position={[0, 0, 0]} onSelect={onSelect}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * iBandCenter, -1.55, 0]} scale={[iBandWidth, 1, 1]}>
            <boxGeometry args={[1, 0.14, 0.5]} />
            <meshStandardMaterial
              color="#fbbf24"
              transparent
              opacity={0.55}
              roughness={0.4}
              {...emissiveProps(sel('i-band'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-iBandCenter, -1.95, 0]} name="I-band" />}
      </PartGroup>

      {/* ---- A-band marker: constant width the whole cycle ---- */}
      <PartGroup id="a-band" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, -1.85, 0]}>
          <boxGeometry args={[MYOSIN_HALF * 2, 0.14, 0.5]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.55}
            roughness={0.4}
            {...emissiveProps(sel('a-band'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, -2.25, 0]} name="A-band" />}
      </PartGroup>

      {/* ---- H-zone marker: narrows as actin tips slide together ---- */}
      <PartGroup id="h-zone" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, -1.55, 0]} scale={[hZoneWidth, 1, 1]}>
          <boxGeometry args={[1, 0.2, 0.56]} />
          <meshStandardMaterial
            color="#a78bfa"
            transparent
            opacity={0.7}
            roughness={0.4}
            {...emissiveProps(sel('h-zone'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, -1.1, 0.55]} name="H-zone" />}
      </PartGroup>

      {/* ---- Contraction state indicator, driven by animTime ---- */}
      {showLabels && (
        <Html position={[0, 2.2, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{stateText}</span>
        </Html>
      )}
    </group>
  );
}
