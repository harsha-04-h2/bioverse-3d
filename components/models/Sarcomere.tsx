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

const Z_HALF = 2.4; // Z-lines at x = ±2.4
const ACTIN_LEN = 1.5;
const MYOSIN_HALF = 0.9; // thick filaments span ±0.9

// Six thin filaments per half-sarcomere in a hexagonal ring (radius 0.45).
const ACTIN_RING: [number, number][] = [];
for (let i = 0; i < 6; i += 1) {
  const a = (i / 6) * Math.PI * 2;
  ACTIN_RING.push([Math.cos(a) * 0.45, Math.sin(a) * 0.45]);
}

// Four thick filaments in a square (radius 0.32).
const MYOSIN_POS: [number, number][] = [
  [0.32, 0],
  [-0.32, 0],
  [0, 0.32],
  [0, -0.32],
];

const DISC_ROT: [number, number, number] = [0, 0, Math.PI / 2]; // cylinder axis Y -> X

export default function Sarcomere(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const zL: [number, number, number] = [-Z_HALF - explode * 1.1, 0, 0];
  const zR: [number, number, number] = [Z_HALF + explode * 1.1, 0, 0];
  const actinShift = explode * 0.5;

  return (
    <group>
      {/* ---- Z-lines (Z-discs) ---- */}
      <PartGroup id="z-line" position={[0, 0, 0]} onSelect={onSelect}>
        {[zL, zR].map((p, i) => (
          <mesh key={i} position={p} rotation={DISC_ROT}>
            <cylinderGeometry args={[1.0, 1.0, 0.14, 40]} />
            <meshStandardMaterial color="#8b5cf6" roughness={0.45} metalness={0.1} {...emissiveProps(sel('z-line'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[zL[0], 1.35, 0]} name="Z-line" />}
      </PartGroup>

      {/* ---- Thin (actin) filaments, anchored at each Z-line, pointing inward ---- */}
      <PartGroup id="actin" position={[0, 0, 0]} onSelect={onSelect}>
        {[-1, 1].map((side) =>
          ACTIN_RING.map(([ry, rz], i) => (
            <mesh
              key={`${side}-${i}`}
              position={[side * (Z_HALF - ACTIN_LEN / 2) + side * actinShift, ry, rz]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.05, 0.05, ACTIN_LEN, 10]} />
              <meshStandardMaterial color="#f87171" roughness={0.45} metalness={0.05} {...emissiveProps(sel('actin'))} />
            </mesh>
          )),
        )}
        {showLabels && <PartLabel position={[-Z_HALF + 0.75 + actinShift, -0.75, 0.45]} name="Actin (thin filament)" />}
      </PartGroup>

      {/* ---- Thick (myosin) filaments with myosin-head knobs, centred ---- */}
      <PartGroup id="myosin" position={[0, 0, 0]} onSelect={onSelect}>
        {MYOSIN_POS.map(([ry, rz], i) => (
          <group key={i}>
            <mesh position={[0, ry, rz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, MYOSIN_HALF * 2, 14]} />
              <meshStandardMaterial color="#2dd4bf" roughness={0.4} metalness={0.1} {...emissiveProps(sel('myosin'))} />
            </mesh>
            {/* myosin heads along the bare-zone-free length */}
            {[-0.6, -0.3, 0.3, 0.6].map((hx) => (
              <mesh
                key={hx}
                position={[hx, ry + Math.sign(ry || 1) * 0.17, rz + (ry === 0 ? Math.sign(rz || 1) * 0.17 : 0)]}
              >
                <sphereGeometry args={[0.075, 12, 12]} />
                <meshStandardMaterial color="#5eead4" roughness={0.35} metalness={0.1} {...emissiveProps(sel('myosin'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[0, 0.95, 0.35]} name="Myosin (thick filament)" />}
      </PartGroup>

      {/* ---- M-line: thin disc at the sarcomere centre ---- */}
      <PartGroup id="m-line" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, 0, 0]} rotation={DISC_ROT}>
          <cylinderGeometry args={[0.85, 0.85, 0.06, 36]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transparent
            opacity={0.55}
            roughness={0.3}
            metalness={0.1}
            {...emissiveProps(sel('m-line'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, -1.05, 0]} name="M-line" />}
      </PartGroup>

      {/* ---- Band markers below the model ---- */}
      <PartGroup id="i-band" position={[0, 0, 0]} onSelect={onSelect}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * ((Z_HALF + MYOSIN_HALF) / 2), -1.55, 0]}>
            <boxGeometry args={[Z_HALF - MYOSIN_HALF, 0.14, 0.5]} />
            <meshStandardMaterial
              color="#fbbf24"
              transparent
              opacity={0.55}
              roughness={0.4}
              {...emissiveProps(sel('i-band'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-((Z_HALF + MYOSIN_HALF) / 2), -1.95, 0]} name="I-band" />}
      </PartGroup>

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

      <PartGroup id="h-zone" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, -1.55, 0]}>
          <boxGeometry args={[0.7, 0.2, 0.56]} />
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
    </group>
  );
}
