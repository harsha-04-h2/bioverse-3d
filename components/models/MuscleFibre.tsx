'use client';

import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
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

const FIBRE_R = 0.55;
const FIBRE_H = 6;

// Hexagonal bundle; fibre 0 sits at the front (+Z) and is the cut-open one.
const FIBRE_BASES: [number, number, number][] = [
  [0, 0, 1.3],
  [1.13, 0, 0.65],
  [1.13, 0, -0.65],
  [0, 0, -1.3],
  [-1.13, 0, -0.65],
  [-1.13, 0, 0.65],
  [0, 0, 0],
];
const CUT_INDEX = 0;

const STRIATION_COLORS = ['#dc2626', '#ef4444', '#b91c1c', '#f87171'];

export default function MuscleFibre(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const shiftOf = (base: [number, number, number]): [number, number, number] => {
    const o = explodeOffset(base, explode);
    return [base[0] + o[0], base[1] + o[1], base[2] + o[2]];
  };

  // Myofibrils inside the cut fibre: 1 centre + 8 in a ring.
  const myofibrils: [number, number, number][] = [[0, 0, 0]];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    myofibrils.push([Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3]);
  }

  const cutBase = FIBRE_BASES[CUT_INDEX];
  const cutPos = shiftOf(cutBase);

  return (
    <group>
      {/* ---- Intact muscle fibres (striated cylinders) ---- */}
      <PartGroup id="muscle-fibre" position={[0, 0, 0]} onSelect={onSelect}>
        {FIBRE_BASES.map((base, i) => {
          if (i === CUT_INDEX) return null;
          const p = shiftOf(base);
          const col = STRIATION_COLORS[i % STRIATION_COLORS.length];
          return (
            <group key={i} position={p}>
              <mesh>
                <cylinderGeometry args={[FIBRE_R, FIBRE_R, FIBRE_H, 28]} />
                <meshStandardMaterial color={col} roughness={0.55} metalness={0.02} {...emissiveProps(sel('muscle-fibre'))} />
              </mesh>
              {/* striation rings */}
              {[-2.1, -0.7, 0.7, 2.1].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                  <torusGeometry args={[FIBRE_R + 0.005, 0.022, 8, 40]} />
                  <meshStandardMaterial color="#7f1d1d" roughness={0.6} metalness={0} {...emissiveProps(sel('muscle-fibre'))} />
                </mesh>
              ))}
            </group>
          );
        })}
        {showLabels && (
          <PartLabel
            position={(() => {
              const p = shiftOf(FIBRE_BASES[1]);
              return [p[0] + 0.8, 2.6, p[2]] as [number, number, number];
            })()}
            name="Muscle fibre"
          />
        )}
      </PartGroup>

      {/* ---- Cut-open fibre: myofibrils exposed ---- */}
      <PartGroup id="myofibril" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={cutPos}>
          {myofibrils.map((m, i) => (
            <mesh key={i} position={m}>
              <cylinderGeometry args={[0.105, 0.105, FIBRE_H - 0.4, 14]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#fca5a5' : '#f87171'}
                roughness={0.5}
                metalness={0.05}
                {...emissiveProps(sel('myofibril'))}
              />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[cutPos[0] + 0.75, 3.35, cutPos[2]]} name="Myofibril" />}
      </PartGroup>

      {/* ---- Sarcolemma: translucent sheath over the lower half of the cut fibre ---- */}
      <PartGroup id="sarcolemma" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={cutPos}>
          <mesh position={[0, -1.35, 0]}>
            <cylinderGeometry args={[FIBRE_R + 0.04, FIBRE_R + 0.04, 3.3, 28, 1, true]} />
            <meshPhysicalMaterial
              color="#f9a8d4"
              transparent
              opacity={0.3}
              roughness={0.25}
              metalness={0}
              side={THREE.DoubleSide}
              depthWrite={false}
              {...emissiveProps(sel('sarcolemma'))}
            />
          </mesh>
          {/* torn rim where the sheath was cut */}
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[FIBRE_R + 0.04, 0.03, 8, 40, 4.6]} />
            <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.05} {...emissiveProps(sel('sarcolemma'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[cutPos[0] - 0.95, -2.2, cutPos[2] + 0.2]} name="Sarcolemma" />}
      </PartGroup>

      {/* ---- Nuclei: flattened, pressed against the fibre periphery ---- */}
      <PartGroup id="nucleus" position={[0, 0, 0]} onSelect={onSelect}>
        {[
          { base: cutBase, a: 0.7, y: -1.1, r: FIBRE_R - 0.08 },
          { base: cutBase, a: 2.4, y: -2.0, r: FIBRE_R - 0.08 },
          { base: cutBase, a: 4.2, y: -0.5, r: FIBRE_R - 0.08 },
          { base: FIBRE_BASES[5], a: 5.1, y: 1.4, r: FIBRE_R - 0.08 },
        ].map((n, i) => {
          const off = explodeOffset(n.base, explode);
          const p: [number, number, number] = [
            n.base[0] + off[0] + Math.cos(n.a) * n.r,
            n.y,
            n.base[2] + off[2] + Math.sin(n.a) * n.r,
          ];
          return (
            <mesh key={i} position={p} rotation={[0, -n.a, 0]} scale={[1, 0.5, 0.65]}>
              <sphereGeometry args={[0.22, 20, 16]} />
              <meshStandardMaterial color="#c4b5fd" roughness={0.4} metalness={0.05} {...emissiveProps(sel('nucleus'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[cutPos[0] + 0.9, -1.15, cutPos[2] - 0.4]} name="Nucleus" />}
      </PartGroup>

      {/* ---- Endomysium: translucent connective sheath around every fibre ---- */}
      <PartGroup id="endomysium" position={[0, 0, 0]} onSelect={onSelect}>
        {FIBRE_BASES.map((base, i) => (
          <mesh key={i} position={shiftOf(base)}>
            <cylinderGeometry args={[FIBRE_R + 0.14, FIBRE_R + 0.14, FIBRE_H + 0.25, 24, 1, true]} />
            <meshPhysicalMaterial
              color="#e7e5e4"
              transparent
              opacity={0.12}
              roughness={0.3}
              metalness={0}
              side={THREE.DoubleSide}
              depthWrite={false}
              {...emissiveProps(sel('endomysium'))}
            />
          </mesh>
        ))}
        {showLabels && (
          <PartLabel
            position={(() => {
              const p = shiftOf(FIBRE_BASES[3]);
              return [p[0] - 0.9, -2.9, p[2]] as [number, number, number];
            })()}
            name="Endomysium"
          />
        )}
      </PartGroup>
    </group>
  );
}
