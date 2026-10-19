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

const ARC = 2.4; // cisterna arc span (radians)
const SHEETS: { y: number; tilt: number; spin: number; dots: number }[] = [
  { y: -0.48, tilt: 0.08, spin: 0.3, dots: 14 },
  { y: -0.16, tilt: -0.06, spin: 1.1, dots: 12 },
  { y: 0.16, tilt: 0.06, spin: 2.0, dots: 14 },
  { y: 0.48, tilt: -0.08, spin: 2.8, dots: 12 },
];

/**
 * One flattened cisterna sac: two membrane arcs (clickable as rough ER) with a
 * translucent lumen band between them (clickable as lumen) and ribosome dots
 * studding the cytosolic face (clickable as ribosome).
 */
function Cisterna({
  sheet,
  seedBase,
  selectedId,
  onSelect,
}: {
  sheet: { y: number; tilt: number; spin: number; dots: number };
  seedBase: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}): JSX.Element {
  const sel = (id: string) => selectedId === id;
  const dots = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let k = 0; k < sheet.dots; k += 1) {
      const t = ARC * 0.04 + ((k + 0.5) / sheet.dots) * ARC * 0.92;
      arr.push([
        Math.cos(t) * 1.265,
        Math.sin(t) * 1.265,
        (rand(seedBase + k) - 0.5) * 0.1,
      ]);
    }
    return arr;
  }, [sheet.dots, seedBase]);

  return (
    <group position={[0.35, sheet.y, 0]} rotation={[Math.PI / 2 + sheet.tilt, 0, sheet.spin]}>
      {/* outer + inner membranes of the flattened sac */}
      <mesh>
        <torusGeometry args={[1.19, 0.03, 10, 48, ARC]} />
        <meshStandardMaterial color="#f472b6" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('rough-er'))} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.11, 0.03, 10, 48, ARC]} />
        <meshStandardMaterial color="#ec4899" roughness={0.42} metalness={0.08} side={THREE.DoubleSide} {...emissiveProps(sel('rough-er'))} />
      </mesh>
      {/* lumen: translucent band between the membranes */}
      <PartGroup id="lumen" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh>
          <torusGeometry args={[1.15, 0.042, 10, 48, ARC]} />
          <meshStandardMaterial
            color="#fde68a"
            transparent
            opacity={0.55}
            roughness={0.35}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('lumen'))}
          />
        </mesh>
      </PartGroup>
      {/* bound ribosomes on the cytosolic face */}
      <PartGroup id="ribosome" position={[0, 0, 0]} onSelect={onSelect}>
        {dots.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#f9a8d4" roughness={0.5} metalness={0} {...emissiveProps(sel('ribosome'))} />
          </mesh>
        ))}
      </PartGroup>
    </group>
  );
}

export default function EndoplasmicReticulum(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Smooth ER branching tubules (local coords; group sits at x ≈ 2.0).
  const serCurves = useMemo(() => {
    const mk = (pts: [number, number, number][]) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))),
        64,
        0.05,
        10,
        false,
      );
    return {
      main: mk([
        [-0.9, 0.35, 0.1],
        [-0.3, 0.1, -0.2],
        [0.3, -0.15, 0.15],
        [0.9, -0.3, -0.1],
      ]),
      branchA: mk([
        [0.0, 0.02, -0.05],
        [0.4, 0.5, -0.3],
        [0.7, 0.95, -0.2],
      ]),
      branchB: mk([
        [0.3, -0.15, 0.15],
        [0.6, -0.6, 0.4],
        [0.95, -0.95, 0.25],
      ]),
    };
  }, []);

  const nucleusTube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, 0.15, -0.1),
      new THREE.Vector3(-0.95, 0.32, 0.0),
      new THREE.Vector3(-0.72, 0.3, 0.05),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.05, 10, false);
  }, []);

  useEffect(() => {
    return () => {
      serCurves.main.dispose();
      serCurves.branchA.dispose();
      serCurves.branchB.dispose();
      nucleusTube.dispose();
    };
  }, [serCurves, nucleusTube]);

  // Cargo dots drifting through the SER main tubule (8.3 s loop).
  const cargo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 4; k += 1) {
      const t = (animTime * 0.12 + k * 0.25) % 1;
      pts.push(serCurves.main.parameters.path.getPointAt(t));
    }
    return pts;
  }, [animTime, serCurves]);

  const mid = (spin: number) => ARC / 2 + spin;

  return (
    <group>
      {/* ---- Rough ER: stacked curved cisternae ---- */}
      {SHEETS.map((s, i) => (
        <PartGroup key={i} id="rough-er" position={explodeOffset([0.35, s.y, 0], explode)} onSelect={onSelect}>
          <Cisterna sheet={s} seedBase={100 + i * 50} selectedId={selectedId} onSelect={onSelect} />
          {/* connecting tubule toward the nucleus hint (first sheet) */}
          {i === 0 && (
            <mesh geometry={nucleusTube}>
              <meshStandardMaterial color="#f472b6" roughness={0.42} metalness={0.08} {...emissiveProps(sel('rough-er'))} />
            </mesh>
          )}
          {showLabels && i === 0 && (
            <PartLabel
              position={[0.35 + 1.3 * Math.cos(mid(s.spin)), s.y - 0.55, 1.3 * Math.sin(mid(s.spin))]}
              name="Rough ER"
            />
          )}
          {showLabels && i === 1 && (
            <PartLabel
              position={[0.35 + 1.45 * Math.cos(mid(s.spin)), s.y + 0.35, 1.45 * Math.sin(mid(s.spin))]}
              name="Ribosome"
            />
          )}
          {showLabels && i === 2 && (
            <PartLabel
              position={[0.35 + 1.3 * Math.cos(mid(s.spin)), s.y + 0.42, 1.3 * Math.sin(mid(s.spin))]}
              name="Cisterna"
            />
          )}
          {showLabels && i === 3 && (
            <PartLabel
              position={[0.35 + 1.15 * Math.cos(mid(s.spin)), s.y + 0.35, 1.15 * Math.sin(mid(s.spin))]}
              name="Lumen"
            />
          )}
        </PartGroup>
      ))}

      {/* ---- Nucleus hint (RER is continuous with the nuclear envelope) ---- */}
      <PartGroup id="nucleus-hint" position={explodeOffset([-2.1, 0.1, -0.2], explode)} onSelect={onSelect}>
        <mesh position={[-2.1, 0.1, -0.2]}>
          <sphereGeometry args={[0.9, 40, 32]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            transparent
            opacity={0.3}
            roughness={0.35}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('nucleus-hint'))}
          />
        </mesh>
        <mesh position={[-2.1, 0.1, -0.2]}>
          <sphereGeometry args={[0.72, 32, 24]} />
          <meshStandardMaterial
            color="#a78bfa"
            transparent
            opacity={0.18}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('nucleus-hint'))}
          />
        </mesh>
      </PartGroup>

      {/* ---- Smooth ER: branching tubules ---- */}
      <PartGroup id="smooth-er" position={explodeOffset([2.0, 0, 0], explode)} onSelect={onSelect}>
        <group position={[2.0, 0, 0]}>
          {[serCurves.main, serCurves.branchA, serCurves.branchB].map((geo, k) => (
            <mesh key={k} geometry={geo}>
              <meshStandardMaterial color="#fb7185" roughness={0.42} metalness={0.08} {...emissiveProps(sel('smooth-er'))} />
            </mesh>
          ))}
          {/* tubule end buds */}
          {[
            [0.9, -0.3, -0.1],
            [0.7, 0.95, -0.2],
            [0.95, -0.95, 0.25],
          ].map((p, k) => (
            <mesh key={`b${k}`} position={p as [number, number, number]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#fb7185" roughness={0.42} metalness={0.08} {...emissiveProps(sel('smooth-er'))} />
            </mesh>
          ))}
          {/* cargo drifting through the main tubule */}
          {cargo.map((p, k) => (
            <mesh key={`c${k}`} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial
                color="#fde68a"
                emissive={sel('smooth-er') ? '#38bdf8' : '#f59e0b'}
                emissiveIntensity={sel('smooth-er') ? 0.4 : 0.6}
                roughness={0.4}
                metalness={0}
              />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[0.6, 1.3, -0.2]} name="Smooth ER" />}
        </group>
      </PartGroup>
    </group>
  );
}
