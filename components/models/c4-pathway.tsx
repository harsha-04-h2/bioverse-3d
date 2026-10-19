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
function tubeFromPoints(points: Pt[], radius: number, segs = 40): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 10, false);
}

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Animation loop: 16 s across four stages. */
const LOOP = 16;

const STAGES = [
  {
    id: 'fixation',
    name: 'Mesophyll fixation',
    range: '0–4 s',
    desc: 'PEP carboxylase grabs CO₂ into oxaloacetate, quickly reduced to malate.',
  },
  {
    id: 'shuttle',
    name: 'Malate shuttle',
    range: '4–10 s',
    desc: 'Malate rides through plasmodesmata into the bundle-sheath cell.',
  },
  {
    id: 'decarboxylation',
    name: 'Decarboxylation',
    range: '10–14 s',
    desc: 'Malate releases CO₂ right at RuBisCO, feeding the Calvin cycle.',
  },
  {
    id: 'return',
    name: 'Pyruvate return',
    range: '14–16 s',
    desc: 'Pyruvate shuttles back to the mesophyll and is rebuilt into PEP using ATP.',
  },
];

const MESO_X = -1.95;
const BS_X = 1.95;

function stageOf(t: number): number {
  if (t < 4) return 0;
  if (t < 10) return 1;
  if (t < 14) return 2;
  return 3;
}

export default function C4Pathway(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = animTime % LOOP;
  const si = stageOf(t);
  const stageT = t - [0, 4, 10, 14][si];

  // CO2 drifting into the mesophyll (strongest in stage 0).
  const co2 = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const prog = ((t * 0.35 + i * 0.27) % 1) * 0.999;
        return {
          x: -3.9 + prog * 2.1,
          y: 0.55 + 0.35 * Math.sin(i * 2.1 + t * 0.8),
          op: si === 0 ? 0.95 : 0.35,
        };
      }),
    [t, si],
  );

  // Malate packets crossing the bridge, mesophyll -> bundle sheath (stage 1).
  const malate = useMemo(() => {
    if (si !== 1) return [];
    return Array.from({ length: 4 }, (_, i) => {
      const prog = (((stageT / 6 + i / 4) % 1) * 0.999);
      let x: number;
      let y: number;
      if (prog < 0.45) {
        const k = prog / 0.45;
        x = -0.5 + k * 1.0;
        y = 0;
      } else {
        const k = (prog - 0.45) / 0.55;
        x = 0.5 + k * 1.15;
        y = 0.32 * k;
      }
      return { x, y, op: 0.95 };
    });
  }, [si, stageT]);

  // CO2 released in the bundle sheath swirling into the mini Calvin ring (stage 2).
  const bsCo2 = useMemo(() => {
    if (si !== 2) return [];
    return Array.from({ length: 3 }, (_, i) => {
      const a = t * 3 + (i * Math.PI * 2) / 3;
      return { x: BS_X + 0.15 + 0.45 * Math.cos(a), y: 0.35 + 0.45 * Math.sin(a), op: 0.95 };
    });
  }, [si, t]);

  // Pyruvate returning through the bridge (stage 3).
  const pyruvate = useMemo(() => {
    if (si !== 3) return [];
    return Array.from({ length: 2 }, (_, i) => {
      const prog = (((stageT / 2 + i / 2) % 1) * 0.999);
      return { x: 1.5 - prog * 3.1, y: 0.32 * (1 - prog) + 0.08 * Math.sin(prog * Math.PI), op: 1 - prog * 0.4 };
    });
  }, [si, stageT]);

  const bridgeGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.6, 0, 0],
          [-0.2, 0.02, 0],
          [0.2, -0.02, 0],
          [0.6, 0, 0],
        ],
        0.15,
      ),
    [],
  );

  // Mesophyll grana hints (light reactions run here).
  const mesoGrana = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        x: MESO_X + (rand(i * 5 + 1) - 0.5) * 1.6,
        y: 0.15 + (rand(i * 5 + 2) - 0.5) * 0.8,
        z: (rand(i * 5 + 3) - 0.5) * 0.5,
      })),
    [],
  );
  // Bundle-sheath chloroplast hints (Calvin cycle runs here).
  const bsChloro = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        x: BS_X + (rand(i * 7 + 11) - 0.5) * 1.5,
        y: -0.3 + (rand(i * 7 + 12) - 0.5) * 0.7,
        z: (rand(i * 7 + 13) - 0.5) * 0.5,
      })),
    [],
  );

  return (
    <group>
      {/* ---- stage banner ---- */}
      {showLabels && (
        <Html position={[0, 2.6, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>
            {STAGES[si].name} · {STAGES[si].range}
          </span>
        </Html>
      )}
      {showLabels && (
        <Html position={[0, 2.17, 0]} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
          <span>{STAGES[si].desc}</span>
        </Html>
      )}

      {/* ---- mesophyll cell ---- */}
      <PartGroup id="mesophyll-cell" position={explodeOffset([-1.4, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[MESO_X, 0, 0]} scale={[1.5, 1.05, 0.85]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            color="#86efac"
            transparent
            opacity={0.22}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('mesophyll-cell'))}
          />
        </mesh>
        {mesoGrana.map((g, i) => (
          <group key={i} position={[g.x, g.y, g.z]}>
            {[0, 1, 2].map((d) => (
              <mesh key={d} position={[0, -0.09 + d * 0.09, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 20]} />
                <meshStandardMaterial color="#16a34a" roughness={0.45} metalness={0.08} {...emissiveProps(sel('mesophyll-cell'))} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[MESO_X, 1.45, 0]} name="Mesophyll cell" />}
      </PartGroup>

      {/* ---- bundle-sheath cell ---- */}
      <PartGroup id="bundle-sheath-cell" position={explodeOffset([1.4, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[BS_X, 0, 0]} scale={[1.5, 1.05, 0.85]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            color="#fde68a"
            transparent
            opacity={0.22}
            roughness={0.5}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('bundle-sheath-cell'))}
          />
        </mesh>
        {bsChloro.map((g, i) => (
          <mesh key={i} position={[g.x, g.y, g.z]}>
            <sphereGeometry args={[0.28, 18, 14]} />
            <meshStandardMaterial
              color="#4ade80"
              transparent
              opacity={0.5}
              roughness={0.45}
              metalness={0.05}
              depthWrite={false}
              {...emissiveProps(sel('bundle-sheath-cell'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[BS_X, 1.45, 0]} name="Bundle-sheath cell" />}
      </PartGroup>

      {/* ---- PEP carboxylase in the mesophyll ---- */}
      <PartGroup id="pep-carboxylase" position={[MESO_X - 0.15, -0.42, 0.3]} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[0.27, 20, 16]} />
          <meshStandardMaterial
            color="#0d9488"
            emissive={sel('pep-carboxylase') ? '#38bdf8' : '#2dd4bf'}
            emissiveIntensity={sel('pep-carboxylase') ? 0.4 : si === 0 ? 0.7 + 0.3 * Math.sin(t * 6) : 0.2}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {showLabels && <SmallLabel position={[0, -0.45, 0]} name="PEP carboxylase" />}
      </PartGroup>

      {/* ---- plasmodesmata bridge (malate shuttle) ---- */}
      <PartGroup id="malate-shuttle" position={explodeOffset([0, -0.8, 0.6], explode)} onSelect={onSelect}>
        <mesh geometry={bridgeGeo}>
          <meshStandardMaterial
            color="#a7f3d0"
            emissive={sel('malate-shuttle') ? '#38bdf8' : '#34d399'}
            emissiveIntensity={sel('malate-shuttle') ? 0.4 : si === 1 ? 0.5 : 0.15}
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>
        {showLabels && <SmallLabel position={[0, -0.42, 0]} name="Plasmodesmata" />}
      </PartGroup>

      {/* ---- mini Calvin ring in the bundle sheath ---- */}
      <PartGroup id="calvin-cycle" position={[BS_X + 0.15, 0.35, 0.25]} onSelect={onSelect}>
        <group rotation={[0, 0, t * 0.6]}>
          <mesh>
            <torusGeometry args={[0.45, 0.055, 10, 48]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive={sel('calvin-cycle') ? '#38bdf8' : '#22c55e'}
              emissiveIntensity={sel('calvin-cycle') ? 0.4 : si === 2 ? 0.7 : 0.25}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0.45 * Math.cos((k * 2 * Math.PI) / 3), 0.45 * Math.sin((k * 2 * Math.PI) / 3), 0]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} roughness={0.35} metalness={0.1} />
            </mesh>
          ))}
        </group>
        {showLabels && <SmallLabel position={[0, 0.68, 0]} name="Calvin cycle" />}
      </PartGroup>

      {/* ---- CO2 entering the mesophyll ---- */}
      {co2.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={c.op} emissive="#60a5fa" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {showLabels && <SmallLabel position={[-3.85, 0.15, 0]} name="CO₂" />}

      {/* ---- malate shuttle packets ---- */}
      {malate.map((m, i) => (
        <mesh key={i} position={[m.x, m.y, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#fb923c" transparent opacity={m.op} emissive="#f97316" emissiveIntensity={0.8} roughness={0.35} metalness={0.1} />
        </mesh>
      ))}
      {showLabels && si === 1 && <SmallLabel position={[0, 0.42, 0]} name="Malate" />}

      {/* ---- CO2 released at the Calvin ring ---- */}
      {bsCo2.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0.25]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={c.op} emissive="#60a5fa" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {showLabels && si === 2 && <SmallLabel position={[BS_X + 0.15, 1.15, 0.25]} name="CO₂ released" />}

      {/* ---- pyruvate returning ---- */}
      {pyruvate.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#f9a8d4" transparent opacity={p.op} emissive="#ec4899" emissiveIntensity={0.6} roughness={0.35} metalness={0.1} />
        </mesh>
      ))}
      {showLabels && si === 3 && <SmallLabel position={[-0.4, 0.5, 0]} name="Pyruvate → PEP (ATP)" />}
    </group>
  );
}
