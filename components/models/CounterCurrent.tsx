'use client';

import { useMemo } from 'react';
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

function SmallLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
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
  children: React.ReactNode;
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

type Pt = [number, number, number];

function tubeFromPoints(points: Pt[], radius: number, segs = 80): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 10, false);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Animation loop length in seconds — everything is driven from animTime. */
const LOOP = 12;

// Medullary osmotic gradient bands, deepening toward the papilla (bottom).
const BANDS = [
  { y: 1.725, color: '#fef9c3', osm: '300 mOsm/L' },
  { y: 0.575, color: '#fde68a', osm: '600 mOsm/L' },
  { y: -0.575, color: '#fbbf24', osm: '900 mOsm/L' },
  { y: -1.725, color: '#b45309', osm: '1200 mOsm/L' },
];

export default function CounterCurrent(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const cycle = (animTime % LOOP) / LOOP;

  const descGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.55, 2.3, 0],
          [-0.55, 1.2, 0],
          [-0.55, 0.0, 0],
          [-0.55, -1.2, 0],
          [-0.55, -1.9, 0],
        ],
        0.14,
      ),
    [],
  );
  const hairpinGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.55, -1.9, 0],
          [-0.3, -2.25, 0],
          [0, -2.32, 0],
          [0.3, -2.25, 0],
          [0.55, -1.9, 0],
        ],
        0.14,
        40,
      ),
    [],
  );
  const ascGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [0.55, -1.9, 0],
          [0.55, -1.0, 0],
          [0.55, 0.0, 0],
          [0.55, 1.0, 0],
          [0.55, 2.3, 0],
        ],
        0.14,
      ),
    [],
  );
  const vasaDescGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-1.25, 2.4, 0],
          [-1.25, 1.0, 0],
          [-1.25, -0.5, 0],
          [-1.25, -1.7, 0],
        ],
        0.06,
        60,
      ),
    [],
  );
  const vasaHairGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-1.25, -1.7, 0],
          [-1.1, -1.95, 0],
          [-0.95, -1.7, 0],
        ],
        0.06,
        24,
      ),
    [],
  );
  const vasaAscGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.95, -1.7, 0],
          [-0.95, -0.5, 0],
          [-0.95, 1.0, 0],
          [-0.95, 2.4, 0],
        ],
        0.06,
        60,
      ),
    [],
  );

  // NaCl pumped out of the ascending limb into the interstitium, drifting down.
  const nacl = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let j = 0; j < 14; j += 1) {
      const prog = (cycle + j / 14) % 1;
      out.push({
        pos: [
          0.55 + 0.16 + 0.5 * Math.sin(prog * Math.PI),
          lerp(1.9, -1.7, prog),
          0.06 * Math.sin(j * 2.1),
        ],
      });
    }
    return out;
  }, [cycle]);

  // Water leaving the descending limb for the interstitium.
  const water = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let j = 0; j < 12; j += 1) {
      const prog = (cycle + j / 12) % 1;
      out.push({
        pos: [
          -0.55 - 0.16 - 0.5 * Math.sin(prog * Math.PI),
          lerp(1.9, -1.7, prog),
          0.06 * Math.sin(j * 1.7),
        ],
      });
    }
    return out;
  }, [cycle]);

  const pulse = (i: number) => 1 + 0.22 * Math.sin(animTime * 2.6 + i * 1.7);

  return (
    <group>
      {/* ---- Medullary osmotic gradient: background bands deepening downward ---- */}
      <PartGroup id="medullary-gradient" position={[0, 0, 0]} onSelect={onSelect}>
        {BANDS.map((b, i) => (
          <mesh key={i} position={[0, b.y, -0.85]}>
            <boxGeometry args={[3.7, 1.15, 0.12]} />
            <meshStandardMaterial
              color={b.color}
              transparent
              opacity={0.32}
              roughness={0.7}
              metalness={0}
              depthWrite={false}
              {...emissiveProps(sel('medullary-gradient'))}
            />
          </mesh>
        ))}
        {showLabels && (
          <>
            {BANDS.map((b, i) => (
              <SmallLabel key={i} position={[2.25, b.y, -0.85]} name={b.osm} />
            ))}
            <PartLabel position={[-2.35, 0.2, -0.85]} name="Medullary gradient" />
          </>
        )}
      </PartGroup>

      {/* ---- Descending limb (water leaves) + hairpin ---- */}
      <PartGroup id="descending-limb" position={explodeOffset([-0.8, 0, 0], explode)} onSelect={onSelect}>
        <mesh geometry={descGeo}>
          <meshStandardMaterial color="#2dd4bf" roughness={0.45} metalness={0.06} {...emissiveProps(sel('descending-limb'))} />
        </mesh>
        <mesh geometry={hairpinGeo}>
          <meshStandardMaterial color="#2dd4bf" roughness={0.45} metalness={0.06} {...emissiveProps(sel('descending-limb'))} />
        </mesh>
        {/* water-exit channel hints */}
        {[1.2, 0.3, -0.6].map((y, i) => (
          <mesh
            key={i}
            position={[-0.55 - 0.26, y, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={pulse(i)}
          >
            <coneGeometry args={[0.06, 0.2, 10]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.1} {...emissiveProps(sel('descending-limb'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-0.55, 2.72, 0]} name="Descending limb" />}
      </PartGroup>

      {/* ---- Ascending limb (NaCl pumped out) ---- */}
      <PartGroup id="ascending-limb" position={explodeOffset([0.8, 0, 0], explode)} onSelect={onSelect}>
        <mesh geometry={ascGeo}>
          <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.06} {...emissiveProps(sel('ascending-limb'))} />
        </mesh>
        {/* NaCl pump hints */}
        {[1.2, 0.4, -0.4, -1.2].map((y, i) => (
          <mesh
            key={i}
            position={[0.55 + 0.26, y, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            scale={pulse(i + 3)}
          >
            <coneGeometry args={[0.06, 0.2, 10]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} {...emissiveProps(sel('ascending-limb'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.55, 2.72, 0]} name="Ascending limb" />}
      </PartGroup>

      {/* ---- Vasa recta: capillary hairpin preserving the gradient ---- */}
      <PartGroup id="vasa-recta" position={explodeOffset([-1.5, 0, 0], explode)} onSelect={onSelect}>
        <mesh geometry={vasaDescGeo}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.08} {...emissiveProps(sel('vasa-recta'))} />
        </mesh>
        <mesh geometry={vasaHairGeo}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.08} {...emissiveProps(sel('vasa-recta'))} />
        </mesh>
        <mesh geometry={vasaAscGeo}>
          <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.08} {...emissiveProps(sel('vasa-recta'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.85, 0.6, 0]} name="Vasa recta" />}
      </PartGroup>

      {/* ---- NaCl particles (pumped out of ascending limb) ---- */}
      <PartGroup id="nacl" position={explodeOffset([0.8, 0, 0], explode)} onSelect={onSelect}>
        {nacl.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.15} {...emissiveProps(sel('nacl'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.55, 1.2, 0]} name="NaCl" />}
      </PartGroup>

      {/* ---- Water particles (leaving descending limb) ---- */}
      <PartGroup id="water" position={explodeOffset([-0.8, 0, 0], explode)} onSelect={onSelect}>
        {water.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.35} metalness={0.15} {...emissiveProps(sel('water'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.55, 1.2, 0]} name="Water" />}
      </PartGroup>
    </group>
  );
}
