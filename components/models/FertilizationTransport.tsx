'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

function emissiveProps(selected: boolean) {
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

/* Journey timeline (seconds, total 44):
   fertilisation 0–6, zygote 6–10, 2-cell 10–15, 4-cell 15–20,
   8-cell 20–24, morula 24–30, blastocyst 30–37, implantation 37–44 */
const DURATION = 44;
const STAGES = [
  { id: 'fertilisation', name: 'Fertilisation (ampulla)', start: 0, end: 6, cells: 1, k: 0 },
  { id: 'zygote', name: 'Zygote', start: 6, end: 10, cells: 1, k: 0.08 },
  { id: '2-cell', name: '2-cell stage', start: 10, end: 15, cells: 2, k: 0.18 },
  { id: '4-cell', name: '4-cell stage', start: 15, end: 20, cells: 4, k: 0.3 },
  { id: '8-cell', name: '8-cell stage', start: 20, end: 24, cells: 8, k: 0.42 },
  { id: 'morula', name: 'Morula', start: 24, end: 30, cells: 14, k: 0.55 },
  { id: 'blastocyst', name: 'Blastocyst', start: 30, end: 37, cells: -1, k: 0.7 },
  { id: 'implantation', name: 'Implantation', start: 37, end: 44, cells: -1, k: 0.85 },
];

const TUBE_POINTS = [
  new THREE.Vector3(-3.4, 0.9, 0),
  new THREE.Vector3(-2.4, 0.72, 0.1),
  new THREE.Vector3(-1.4, 0.32, 0),
  new THREE.Vector3(-0.5, -0.08, 0),
  new THREE.Vector3(0.35, -0.32, 0),
  new THREE.Vector3(1.05, -0.28, 0),
];

/** Embryo travel progress 0..1 along the tube + into the uterus. */
function travelK(t: number): number {
  if (t < 6) return 0;
  if (t < 30) return lerp(0, 0.55, smooth((t - 6) / 24));
  if (t < 37) return lerp(0.55, 0.72, smooth((t - 30) / 7));
  return lerp(0.72, 0.92, smooth((t - 37) / 7));
}

/** Cell-ball positions for n cleavage cells packed in a sphere of radius r. */
function cleavageCells(n: number, r: number, seed: number): [number, number, number][] {
  if (n === 1) return [[0, 0, 0]];
  if (n === 2) return [[-r / 2, 0, 0], [r / 2, 0, 0]];
  if (n === 4)
    return [
      [-r / 2, r / 2, 0], [r / 2, r / 2, 0],
      [-r / 2, -r / 2, 0], [r / 2, -r / 2, 0],
    ];
  if (n === 8)
    return [
      [-r / 2, r / 2, r / 2], [r / 2, r / 2, r / 2],
      [-r / 2, r / 2, -r / 2], [r / 2, r / 2, -r / 2],
      [-r / 2, -r / 2, r / 2], [r / 2, -r / 2, r / 2],
      [-r / 2, -r / 2, -r / 2], [r / 2, -r / 2, -r / 2],
    ];
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const th = rand(seed + i * 3 + 1) * Math.PI * 2;
    const ph = Math.acos(2 * rand(seed + i * 3 + 2) - 1);
    const rr = r * (0.5 + 0.5 * rand(seed + i * 3 + 3));
    pts.push([rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph)]);
  }
  return pts;
}

/**
 * Fertilisation & embryo transport (NCERT Fig 2.11). The zygote formed in the
 * ampulla divides as it travels down the fallopian tube — 2, 4, 8 cells,
 * morula, then blastocyst — and finally implants into the uterine wall.
 * 44 s loop; the embryo's development stage follows its position.
 */
export default function FertilizationTransport(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = ((animTime % DURATION) + DURATION) % DURATION;
  const stage = STAGES.find((s) => t >= s.start && t < s.end) ?? STAGES[0];

  const tubeCurve = useMemo(() => new THREE.CatmullRomCurve3(TUBE_POINTS), []);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(tubeCurve, 64, 0.24, 14, false), [tubeCurve]);

  const k = travelK(t);
  const embryoPos = tubeCurve.getPoint(clamp01(k));
  const implantK = smooth((t - 37) / 7);
  // during implantation the blastocyst moves off the path into the endometrium
  const ex = lerp(embryoPos.x, 1.35, implantK);
  const ey = lerp(embryoPos.y, 0.25, implantK);
  const sink = implantK * 0.18;

  const cellPts = useMemo(() => {
    if (stage.cells <= 0) return [];
    return cleavageCells(stage.cells, 0.3, 42);
  }, [stage.cells]);

  const blastCells = useMemo(() => cleavageCells(9, 0.16, 77), []);
  const spermAtStart = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        pos: [
          -3.4 + (rand(i * 13 + 1) - 0.5) * 0.5,
          0.9 + (rand(i * 13 + 2) - 0.5) * 0.5,
          (rand(i * 13 + 3) - 0.5) * 0.5,
        ] as [number, number, number],
      })),
    []
  );
  const spermOp = t < 6 ? 1 - smooth(t / 6) : 0;

  const cellR = stage.cells === 1 ? 0.32 : stage.cells === 2 ? 0.24 : stage.cells === 4 ? 0.19 : stage.cells === 8 ? 0.15 : 0.11;

  return (
    <group>
      {/* ---- fallopian tube (semi-transparent so the embryo is visible inside) ---- */}
      <PartGroup id="fallopian-tube" position={explodeOffset([-1.2, 0.3, 0], explode)} onSelect={onSelect}>
        <mesh geometry={tubeGeo}>
          <meshStandardMaterial
            color="#c98f8a"
            transparent
            opacity={0.35}
            roughness={0.5}
            depthWrite={false}
            {...emissiveProps(sel('fallopian-tube'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.4, 1.35, 0]} name="Fallopian tube" />}
      </PartGroup>

      {/* ---- ovary + fimbriae at the tube's start (context) ---- */}
      <mesh position={[-3.85, 0.35, 0]} scale={[0.35, 0.45, 0.32]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#e3a6a1" roughness={0.55} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[-3.5 + (rand(i * 5) - 0.5) * 0.1, 0.75 - i * 0.12, 0]} rotation={[0, 0, 0.9]}>
          <coneGeometry args={[0.06, 0.3, 8]} />
          <meshStandardMaterial color="#b87873" roughness={0.55} />
        </mesh>
      ))}

      {/* ---- uterus (destination) ---- */}
      <PartGroup id="uterus" position={explodeOffset([1.75, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[1.85, 0.35, 0]} scale={[0.85, 1.0, 0.6]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color="#b76e79" roughness={0.55} {...emissiveProps(sel('uterus'))} />
        </mesh>
        {/* endometrium lining facing the cavity */}
        <mesh position={[1.15, 0.2, 0]} scale={[0.35, 0.62, 0.45]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#f2a7bb" roughness={0.55} {...emissiveProps(sel('uterus'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.6, 1.35, 0]} name="Uterus" />}
      </PartGroup>

      {/* ---- travelling embryo (clickable stage) ---- */}
      <PartGroup id={stage.id} position={[0, 0, 0]} onSelect={onSelect}>
        <group position={[ex, ey, 0]}>
          {stage.cells > 0 && (
            <group>
              {/* zona pellucida around the early embryo */}
              <mesh>
                <sphereGeometry args={[0.44, 28, 20]} />
                <meshPhysicalMaterial color="#a5b4fc" transparent opacity={0.25} roughness={0.2} depthWrite={false} />
              </mesh>
              {cellPts.map((c, i) => (
                <mesh key={i} position={c}>
                  <sphereGeometry args={[cellR, 18, 14]} />
                  <meshStandardMaterial
                    color="#fcd9a8"
                    roughness={0.45}
                    {...emissiveProps(sel(stage.id))}
                  />
                </mesh>
              ))}
              {/* two pronuclei in the zygote */}
              {stage.id === 'zygote' &&
                ([-0.1, 0.1] as const).map((ox, i) => (
                  <mesh key={`pn${i}`} position={[ox, 0.05, 0.12]}>
                    <sphereGeometry args={[0.08, 12, 10]} />
                    <meshStandardMaterial color={i === 0 ? '#7c3aed' : '#0ea5e9'} roughness={0.4} />
                  </mesh>
                ))}
            </group>
          )}
          {stage.cells <= 0 && (
            <group scale={1 - sink * 0.4}>
              {/* blastocyst: trophoblast shell + inner cell mass */}
              <mesh>
                <sphereGeometry args={[0.4, 28, 20]} />
                <meshPhysicalMaterial
                  color="#a5b4fc"
                  transparent
                  opacity={0.35}
                  roughness={0.2}
                  depthWrite={false}
                  {...emissiveProps(sel(stage.id))}
                />
              </mesh>
              <group position={[0.14, 0.1, 0.05]}>
                {blastCells.map((c, i) => (
                  <mesh key={i} position={c}>
                    <sphereGeometry args={[0.07, 12, 10]} />
                    <meshStandardMaterial color="#fcd9a8" roughness={0.45} {...emissiveProps(sel(stage.id))} />
                  </mesh>
                ))}
              </group>
              {/* implantation mound growing over the blastocyst */}
              {implantK > 0.01 && (
                <mesh position={[-0.3, 0.15, 0]} scale={implantK}>
                  <sphereGeometry args={[0.42, 20, 14]} />
                  <meshStandardMaterial color="#f2a7bb" transparent opacity={0.85 * implantK} roughness={0.55} />
                </mesh>
              )}
            </group>
          )}
        </group>
        {showLabels && (
          <Html position={[ex, ey + 0.95, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>{stage.name}</span>
          </Html>
        )}
      </PartGroup>

      {/* ---- sperm at the ampulla during fertilisation ---- */}
      {spermOp > 0.01 &&
        spermAtStart.map((s, i) => (
          <group key={i} position={s.pos} rotation={[0, 0, 0.5 + i * 0.4]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.07, 0.16, 10]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={spermOp} roughness={0.45} />
            </mesh>
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.008, 0.65, 6]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={spermOp} roughness={0.45} />
            </mesh>
          </group>
        ))}
    </group>
  );
}
