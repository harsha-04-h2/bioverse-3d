'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/**
 * NCERT Class 11, Chapter 15 (Body Fluids and Circulation), Fig 15.1 —
 * formed elements of blood: RBCs, neutrophil, eosinophil, lymphocyte,
 * monocyte, platelets, suspended in plasma.
 */

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
  hover = true,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  hover?: boolean;
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
      onPointerOver={
        hover
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }
          : undefined
      }
      onPointerOut={
        hover
          ? () => {
              document.body.style.cursor = 'auto';
            }
          : undefined
      }
    >
      {children}
    </group>
  );
}

/** Thin cylinder bridging two points — used for multi-lobed nuclei. */
function Filament({
  a,
  b,
  radius,
  color,
  selected,
}: {
  a: [number, number, number];
  b: [number, number, number];
  radius: number;
  color: string;
  selected: boolean;
}): JSX.Element {
  const { geo, mid, quat } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(radius, radius, len, 10);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    const m = va.add(vb).multiplyScalar(0.5);
    return { geo: g, mid: m, quat: q };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <mesh geometry={geo} position={mid.toArray()} quaternion={quat}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} {...emissiveProps(selected)} />
    </mesh>
  );
}

/** Deterministic shell of points (for cytoplasmic granules) around the origin. */
function shellPoints(count: number, rMin: number, rMax: number, seed: number): [number, number, number][] {
  const arr: [number, number, number][] = [];
  for (let j = 0; j < count; j += 1) {
    const r = rMin + rand(seed + j * 3) * (rMax - rMin);
    const theta = rand(seed + j * 3 + 1) * Math.PI * 2;
    const phi = Math.acos(2 * rand(seed + j * 3 + 2) - 1);
    arr.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ]);
  }
  return arr;
}

/**
 * Instance position = base + (type explode direction) + (radial spread) + (gentle drift).
 * Everything is a pure function of animTime — no clocks, fully deterministic.
 */
function driftPos(
  base: [number, number, number],
  explodeDir: [number, number, number],
  explode: number,
  seed: number,
  t: number,
): [number, number, number] {
  const push = new THREE.Vector3(...explodeDir).normalize().multiplyScalar(explode * 4.5);
  const b = new THREE.Vector3(...base);
  const spread =
    b.lengthSq() > 1e-8 ? b.clone().normalize().multiplyScalar(explode * 1.3) : new THREE.Vector3();
  return [
    base[0] + push.x + spread.x + Math.sin(t * 0.5 + seed * 1.3) * 0.14,
    base[1] + push.y + spread.y + Math.sin(t * 0.42 + seed * 2.1) * 0.16,
    base[2] + push.z + spread.z + Math.cos(t * 0.36 + seed * 0.7) * 0.14,
  ];
}

const RBC_DIR: [number, number, number] = [1, 0.15, 0.1];
const NEUTRO_DIR: [number, number, number] = [-0.9, -0.35, -0.25];
const EOSINO_DIR: [number, number, number] = [0.75, 0.55, 0.35];
const LYMPHO_DIR: [number, number, number] = [-0.15, 0.85, -0.5];
const MONO_DIR: [number, number, number] = [0.35, -0.75, -0.55];
const PLATELET_DIR: [number, number, number] = [0, 0.35, 0.95];

const NEUTRO_LOBES: [number, number, number][] = [
  [0, 0.55, 0],
  [-0.476, -0.275, 0],
  [0.476, -0.275, 0],
];

export default function BloodCells(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Shared geometry (built once; instances differ by scale/rotation only).
  const sphereHi = useMemo(() => new THREE.SphereGeometry(1, 40, 40), []);
  const sphereLo = useMemo(() => new THREE.SphereGeometry(1, 12, 12), []);

  // Biconcave RBC disc via lathe: thin centre (0.08), thick rim (0.23), radius 0.95.
  const rbcGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const R = 0.95;
    const N = 28;
    for (let i = 0; i <= N; i += 1) {
      const t = i / N;
      pts.push(new THREE.Vector2(t * R, -(0.08 + 0.15 * t * t)));
    }
    for (let i = N; i >= 0; i -= 1) {
      const t = i / N;
      pts.push(new THREE.Vector2(t * R, 0.08 + 0.15 * t * t));
    }
    return new THREE.LatheGeometry(pts, 56);
  }, []);

  // Kidney-bean nucleus for the monocyte (torus arc, flattened).
  const monoNucleusGeo = useMemo(() => new THREE.TorusGeometry(0.8, 0.48, 20, 48, 4.6), []);

  const rbcSpecs = useMemo(
    () =>
      (
        [
          [-3.4, 0.6, 0.8],
          [-2.2, -1.4, -1.6],
          [-0.6, 1.2, 2.2],
          [1.4, -0.6, 1.4],
          [2.8, 1.0, -0.8],
          [0.2, -1.8, -0.4],
          [-1.6, 0.4, 2.8],
          [3.4, -0.8, 1.8],
        ] as [number, number, number][]
      ).map((base, i) => ({ base, seed: 100 + i * 13 })),
    [],
  );

  const lymphoSpecs = useMemo(
    () =>
      (
        [
          [0.8, 2.2, -2.6],
          [-2.8, -0.6, 3.2],
        ] as [number, number, number][]
      ).map((base, i) => ({ base, seed: 300 + i * 13 })),
    [],
  );

  const plateletSpecs = useMemo(
    () =>
      (
        [
          [-3.0, 1.8, -0.6],
          [-0.2, 0.2, -3.4],
          [1.8, 1.6, 0.6],
          [4.0, -1.6, -1.2],
          [-4.6, 0.2, 1.4],
          [0.6, -0.8, 3.6],
        ] as [number, number, number][]
      ).map((base, i) => ({
        base,
        seed: 500 + i * 7,
        geo: new THREE.CylinderGeometry(
          0.2 + rand(500 + i) * 0.14,
          0.16 + rand(510 + i) * 0.1,
          0.09 + rand(520 + i) * 0.05,
          7,
        ),
        rot: [
          rand(530 + i) * Math.PI,
          rand(540 + i) * Math.PI,
          rand(550 + i) * Math.PI,
        ] as [number, number, number],
      })),
    [],
  );

  const neutroGranules = useMemo(() => shellPoints(14, 1.02, 1.42, 700), []);
  const eosinoGranules = useMemo(() => shellPoints(12, 1.05, 1.42, 800), []);

  // Representative label anchors (track their instance through drift + explode).
  const rbcLabel = driftPos(rbcSpecs[4].base, RBC_DIR, explode, rbcSpecs[4].seed, animTime);
  const neutroBase: [number, number, number] = [-4.2, -1.8, -2.4];
  const neutroLabel = driftPos(neutroBase, NEUTRO_DIR, explode, 200, animTime);
  const eosinoBase: [number, number, number] = [4.4, 1.8, 2.2];
  const eosinoLabel = driftPos(eosinoBase, EOSINO_DIR, explode, 210, animTime);
  const lymphoLabel = driftPos(lymphoSpecs[0].base, LYMPHO_DIR, explode, lymphoSpecs[0].seed, animTime);
  const monoBase: [number, number, number] = [2.2, -2.4, -3.2];
  const monoLabel = driftPos(monoBase, MONO_DIR, explode, 220, animTime);
  const plateletLabel = driftPos(plateletSpecs[2].base, PLATELET_DIR, explode, plateletSpecs[2].seed, animTime);

  const emRbc = emissiveProps(sel('rbc'));
  const emNeutro = emissiveProps(sel('neutrophil'));
  const emEosino = emissiveProps(sel('eosinophil'));
  const emLympho = emissiveProps(sel('lymphocyte'));
  const emMono = emissiveProps(sel('monocyte'));
  const emPlatelet = emissiveProps(sel('platelet'));
  const emPlasma = emissiveProps(sel('plasma'));

  return (
    <group>
      {/* ---- Plasma: faint background tint (camera sits inside) ---- */}
      <PartGroup id="plasma" position={[0, 0, 0]} hover={false} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[9.5, 48, 48]} />
          <meshStandardMaterial
            color="#fde68a"
            transparent
            opacity={0.05}
            roughness={1}
            metalness={0}
            depthWrite={false}
            side={THREE.BackSide}
            {...emPlasma}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, 8.4, 0]} name="Plasma" />}
      </PartGroup>

      {/* ---- RBCs: biconcave discs, most numerous, no nucleus ---- */}
      <PartGroup id="rbc" position={[0, 0, 0]} onSelect={onSelect}>
        {rbcSpecs.map((s) => (
          <group key={s.seed} position={driftPos(s.base, RBC_DIR, explode, s.seed, animTime)}>
            <mesh
              geometry={rbcGeo}
              rotation={[animTime * 0.12 + s.seed, s.seed * 1.7, animTime * 0.08 + s.seed * 0.6]}
            >
              <meshStandardMaterial color="#dc2626" roughness={0.38} metalness={0.05} {...emRbc} />
            </mesh>
          </group>
        ))}
        {showLabels && (
          <PartLabel position={[rbcLabel[0], rbcLabel[1] + 1.3, rbcLabel[2]]} name="Red blood cells (RBCs)" />
        )}
      </PartGroup>

      {/* ---- Neutrophil: 3-lobed nucleus + granular cytoplasm ---- */}
      <PartGroup id="neutrophil" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={driftPos(neutroBase, NEUTRO_DIR, explode, 200, animTime)}>
          {/* cytoplasm */}
          <mesh geometry={sphereHi} scale={1.5}>
            <meshStandardMaterial
              color="#fbcfe8"
              transparent
              opacity={0.55}
              roughness={0.5}
              metalness={0}
              depthWrite={false}
              {...emNeutro}
            />
          </mesh>
          {/* granules */}
          {neutroGranules.map((p, i) => (
            <mesh key={i} geometry={sphereLo} position={p} scale={0.07}>
              <meshStandardMaterial color="#a78bfa" roughness={0.5} metalness={0} {...emNeutro} />
            </mesh>
          ))}
          {/* 3-lobed nucleus */}
          {NEUTRO_LOBES.map((p, i) => (
            <mesh key={i} geometry={sphereHi} position={p} scale={0.5}>
              <meshStandardMaterial color="#6d28d9" roughness={0.4} metalness={0.05} {...emNeutro} />
            </mesh>
          ))}
          <Filament a={NEUTRO_LOBES[0]} b={NEUTRO_LOBES[1]} radius={0.14} color="#6d28d9" selected={sel('neutrophil')} />
          <Filament a={NEUTRO_LOBES[1]} b={NEUTRO_LOBES[2]} radius={0.14} color="#6d28d9" selected={sel('neutrophil')} />
        </group>
        {showLabels && (
          <PartLabel position={[neutroLabel[0], neutroLabel[1] + 1.85, neutroLabel[2]]} name="Neutrophil" />
        )}
      </PartGroup>

      {/* ---- Eosinophil: bilobed "spectacle" nucleus + orange granules ---- */}
      <PartGroup id="eosinophil" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={driftPos(eosinoBase, EOSINO_DIR, explode, 210, animTime)}>
          <mesh geometry={sphereHi} scale={1.5}>
            <meshStandardMaterial
              color="#fed7aa"
              transparent
              opacity={0.55}
              roughness={0.5}
              metalness={0}
              depthWrite={false}
              {...emEosino}
            />
          </mesh>
          {eosinoGranules.map((p, i) => (
            <mesh key={i} geometry={sphereLo} position={p} scale={0.09}>
              <meshStandardMaterial color="#f97316" roughness={0.5} metalness={0} {...emEosino} />
            </mesh>
          ))}
          {/* spectacle nucleus: two lobes + bridge */}
          <mesh geometry={sphereHi} position={[-0.55, 0, 0.05]} scale={0.55}>
            <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.05} {...emEosino} />
          </mesh>
          <mesh geometry={sphereHi} position={[0.55, 0, 0.05]} scale={0.55}>
            <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.05} {...emEosino} />
          </mesh>
          <Filament
            a={[-0.55, 0, 0.05]}
            b={[0.55, 0, 0.05]}
            radius={0.18}
            color="#7c3aed"
            selected={sel('eosinophil')}
          />
        </group>
        {showLabels && (
          <PartLabel position={[eosinoLabel[0], eosinoLabel[1] + 1.85, eosinoLabel[2]]} name="Eosinophil" />
        )}
      </PartGroup>

      {/* ---- Lymphocytes: huge nucleus, thin cytoplasm rim ---- */}
      <PartGroup id="lymphocyte" position={[0, 0, 0]} onSelect={onSelect}>
        {lymphoSpecs.map((s) => (
          <group key={s.seed} position={driftPos(s.base, LYMPHO_DIR, explode, s.seed, animTime)}>
            {/* nucleus nearly filling the cell */}
            <mesh geometry={sphereHi} scale={0.78}>
              <meshStandardMaterial color="#1e40af" roughness={0.35} metalness={0.05} {...emLympho} />
            </mesh>
            {/* thin cytoplasm rim */}
            <mesh geometry={sphereHi} scale={0.95}>
              <meshStandardMaterial
                color="#93c5fd"
                transparent
                opacity={0.32}
                roughness={0.5}
                metalness={0}
                depthWrite={false}
                {...emLympho}
              />
            </mesh>
          </group>
        ))}
        {showLabels && (
          <PartLabel position={[lymphoLabel[0], lymphoLabel[1] + 1.3, lymphoLabel[2]]} name="Lymphocyte" />
        )}
      </PartGroup>

      {/* ---- Monocyte: kidney-bean nucleus, largest WBC ---- */}
      <PartGroup id="monocyte" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={driftPos(monoBase, MONO_DIR, explode, 220, animTime)}>
          <mesh geometry={sphereHi} scale={1.9}>
            <meshStandardMaterial
              color="#dbeafe"
              transparent
              opacity={0.45}
              roughness={0.5}
              metalness={0}
              depthWrite={false}
              {...emMono}
            />
          </mesh>
          <mesh geometry={monoNucleusGeo} rotation={[0.35, 0.15, 0.4]} scale={[1, 1, 0.78]}>
            <meshStandardMaterial color="#4c1d95" roughness={0.4} metalness={0.05} {...emMono} />
          </mesh>
        </group>
        {showLabels && (
          <PartLabel position={[monoLabel[0], monoLabel[1] + 2.2, monoLabel[2]]} name="Monocyte" />
        )}
      </PartGroup>

      {/* ---- Platelets: tiny irregular fragments ---- */}
      <PartGroup id="platelet" position={[0, 0, 0]} onSelect={onSelect}>
        {plateletSpecs.map((s) => (
          <group key={s.seed} position={driftPos(s.base, PLATELET_DIR, explode, s.seed, animTime)}>
            <mesh
              geometry={s.geo}
              rotation={[s.rot[0] + animTime * 0.25, s.rot[1], s.rot[2] + animTime * 0.18]}
            >
              <meshStandardMaterial color="#fb7185" roughness={0.45} metalness={0.05} {...emPlatelet} />
            </mesh>
          </group>
        ))}
        {showLabels && (
          <PartLabel position={[plateletLabel[0], plateletLabel[1] + 0.75, plateletLabel[2]]} name="Platelets" />
        )}
      </PartGroup>
    </group>
  );
}
