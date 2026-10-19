'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export interface BioModelProps {
  explode: number; // 0..1 exploded-view amount
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  animTime: number; // seconds; this model is static — ignored
  cutaway?: boolean; // ignored for this model
}

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
  scale,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  scale?: number;
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

function MitoUnit({
  position,
  rotation,
  selected,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group position={position} rotation={rotation}>
      {/* outer membrane */}
      <mesh>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
        <meshStandardMaterial color="#fb923c" roughness={0.45} metalness={0.05} {...em} />
      </mesh>
      {/* inner membrane */}
      <mesh>
        <capsuleGeometry args={[0.15, 0.34, 8, 16]} />
        <meshStandardMaterial color="#fdba74" roughness={0.5} metalness={0.05} {...em} />
      </mesh>
      {/* cristae hints: two small torus arcs inside */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0.6]}>
        <torusGeometry args={[0.1, 0.018, 8, 24, 2.6]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} metalness={0.05} {...em} />
      </mesh>
      <mesh position={[0, -0.14, 0]} rotation={[0.4, 1.1, 0]}>
        <torusGeometry args={[0.1, 0.018, 8, 24, 2.6]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} metalness={0.05} {...em} />
      </mesh>
    </group>
  );
}

function RoughERSheet({
  y,
  tilt,
  spin,
  dotCount,
  selected,
}: {
  y: number;
  tilt: number;
  spin: number;
  dotCount: number;
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  const dots = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let j = 0; j < dotCount; j += 1) {
      const t = 0.25 + ((j + 0.5) / dotCount) * 1.7;
      arr.push([Math.cos(t) * 1.055, Math.sin(t) * 1.055, 0.055]);
    }
    return arr;
  }, [dotCount]);
  return (
    <group position={[0, y, 0]} rotation={[Math.PI / 2 + tilt, 0, spin]}>
      <mesh>
        <torusGeometry args={[1.0, 0.055, 10, 40, 2.2]} />
        <meshStandardMaterial color="#f472b6" roughness={0.45} metalness={0.08} {...em} />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.5} metalness={0} {...em} />
        </mesh>
      ))}
    </group>
  );
}

const MITO_BASES: [number, number, number][] = [
  [-1.1, -0.5, 0.6],
  [1.0, -0.9, -0.4],
  [-0.3, 1.05, -0.9],
];
const MITO_ROTATIONS: [number, number, number][] = [
  [0.4, 0.3, 1.2],
  [-0.6, 0.8, 0.4],
  [1.1, -0.5, 0.9],
];

const RER_BASE: [number, number, number] = [-0.8, -1.1, 0];
const RER_SHEETS: { y: number; tilt: number; spin: number; dotCount: number }[] = [
  { y: -0.21, tilt: 0.1, spin: 0.2, dotCount: 4 },
  { y: -0.07, tilt: -0.12, spin: 0.9, dotCount: 3 },
  { y: 0.07, tilt: 0.12, spin: 1.6, dotCount: 4 },
  { y: 0.21, tilt: -0.1, spin: 2.3, dotCount: 3 },
];

const GOLGI_BASE: [number, number, number] = [0.95, 0.9, -0.7];
const NUCLEUS_BASE: [number, number, number] = [0.35, 0.25, 0.3];
const NUCLEOLUS_BASE: [number, number, number] = [0.55, 0.45, 0.5];
const LYSOSOME_BASE: [number, number, number] = [-0.9, 0.7, 0.9];

export default function AnimalCell3D(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;

  const sel = (id: string) => selectedId === id;

  // ~24 free ribosomes scattered deterministically inside the cytoplasm (radius < 1.6),
  // keeping clear of the nucleus and other organelles.
  const ribosomePositions = useMemo<[number, number, number][]>(() => {
    const avoid: { c: [number, number, number]; r: number }[] = [
      { c: NUCLEUS_BASE, r: 0.95 },
      { c: MITO_BASES[0], r: 0.62 },
      { c: MITO_BASES[1], r: 0.62 },
      { c: MITO_BASES[2], r: 0.62 },
      { c: GOLGI_BASE, r: 0.72 },
      { c: LYSOSOME_BASE, r: 0.52 },
      { c: RER_BASE, r: 0.5 },
    ];
    const pts: [number, number, number][] = [];
    let seed = 1;
    while (pts.length < 24 && seed < 2000) {
      const r = 0.45 + rand(seed) * 1.1;
      const theta = rand(seed + 1000) * Math.PI * 2;
      const phi = Math.acos(2 * rand(seed + 2000) - 1);
      const p: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ];
      const clear = avoid.every(
        ({ c, r: ar }) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) > ar,
      );
      if (clear) pts.push(p);
      seed += 1;
    }
    return pts;
  }, []);

  return (
    <group>
      {/* ---- Cell membrane + cytoplasm ---- */}
      <PartGroup id="membrane" position={[0, 0, 0]} scale={1 + explode * 0.15} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[2, 48, 48]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transparent
            opacity={0.16}
            roughness={0.15}
            metalness={0.05}
            depthWrite={false}
            {...emissiveProps(sel('membrane'))}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.9, 48, 48]} />
          <meshStandardMaterial
            color="#274a73"
            transparent
            opacity={0.5}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('membrane'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, 2.25, 0]} name="Cell membrane" />}
      </PartGroup>

      {/* ---- Nucleus ---- */}
      <PartGroup id="nucleus" position={explodeOffset(NUCLEUS_BASE, explode)} onSelect={onSelect}>
        <mesh position={NUCLEUS_BASE}>
          <sphereGeometry args={[0.72, 40, 40]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.45} metalness={0.05} {...emissiveProps(sel('nucleus'))} />
        </mesh>
        <mesh position={NUCLEUS_BASE}>
          <sphereGeometry args={[0.79, 40, 40]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            transparent
            opacity={0.22}
            roughness={0.35}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('nucleus'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.35, 1.3, 0.3]} name="Nucleus" />}
      </PartGroup>

      {/* ---- Nucleolus ---- */}
      <PartGroup id="nucleolus" position={explodeOffset(NUCLEOLUS_BASE, explode)} onSelect={onSelect}>
        <mesh position={NUCLEOLUS_BASE}>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.45} metalness={0.05} {...emissiveProps(sel('nucleolus'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.0, 0.6, 0.5]} name="Nucleolus" />}
      </PartGroup>

      {/* ---- Mitochondria (3 units) ---- */}
      {MITO_BASES.map((base, i) => (
        <PartGroup
          key={i}
          id="mitochondria"
          position={explodeOffset(base, explode)}
          onSelect={onSelect}
        >
          <MitoUnit position={base} rotation={MITO_ROTATIONS[i]} selected={sel('mitochondria')} />
          {showLabels && i === 0 && <PartLabel position={[-1.35, 0.15, 0.75]} name="Mitochondria" />}
        </PartGroup>
      ))}

      {/* ---- Rough ER ---- */}
      <PartGroup id="rough-er" position={explodeOffset(RER_BASE, explode)} onSelect={onSelect}>
        {RER_SHEETS.map((s, i) => (
          <group key={i} position={RER_BASE}>
            <RoughERSheet y={s.y} tilt={s.tilt} spin={s.spin} dotCount={s.dotCount} selected={sel('rough-er')} />
          </group>
        ))}
        {showLabels && <PartLabel position={[-0.8, -1.7, 0]} name="Rough ER" />}
      </PartGroup>

      {/* ---- Golgi apparatus ---- */}
      <PartGroup id="golgi" position={explodeOffset(GOLGI_BASE, explode)} onSelect={onSelect}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[
              GOLGI_BASE[0] + (i % 2 === 0 ? -0.06 : 0.06),
              GOLGI_BASE[1] + i * 0.13,
              GOLGI_BASE[2],
            ]}
            rotation={[0, 0, i % 2 === 0 ? 0.08 : -0.08]}
          >
            <cylinderGeometry args={[0.5, 0.55, 0.07, 24]} />
            <meshStandardMaterial
              color="#34d399"
              roughness={0.45}
              metalness={0.08}
              {...emissiveProps(sel('golgi'))}
            />
          </mesh>
        ))}
        {/* secretory vesicles */}
        {[
          [GOLGI_BASE[0] + 0.72, GOLGI_BASE[1] + 0.1, GOLGI_BASE[2] + 0.25],
          [GOLGI_BASE[0] - 0.68, GOLGI_BASE[1] + 0.3, GOLGI_BASE[2] - 0.3],
        ].map((p, i) => (
          <mesh key={`v${i}`} position={p as [number, number, number]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color="#34d399"
              roughness={0.45}
              metalness={0.08}
              {...emissiveProps(sel('golgi'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.95, 1.75, -0.7]} name="Golgi apparatus" />}
      </PartGroup>

      {/* ---- Free ribosomes ---- */}
      <PartGroup id="ribosomes" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        {ribosomePositions.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.5}
              metalness={0}
              {...emissiveProps(sel('ribosomes'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.3, -0.35, 1.3]} name="Ribosomes" />}
      </PartGroup>

      {/* ---- Lysosome ---- */}
      <PartGroup id="lysosome" position={explodeOffset(LYSOSOME_BASE, explode)} onSelect={onSelect}>
        <mesh position={LYSOSOME_BASE}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.45} metalness={0.05} {...emissiveProps(sel('lysosome'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.9, 1.25, 0.9]} name="Lysosome" />}
      </PartGroup>
    </group>
  );
}
