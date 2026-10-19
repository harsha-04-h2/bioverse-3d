'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Explode offset: base direction * explode. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.6);
  return [v.x, v.y, v.z];
}

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

/** One stylized long bone between two points, with a rounded head at the proximal end. */
function LimbBone({
  a,
  b,
  r,
  color,
  selected,
}: {
  a: [number, number, number];
  b: [number, number, number];
  r: number;
  color: string;
  selected: boolean;
}): JSX.Element {
  const { position, rotation, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const length = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quat);
    const mid = va.clone().add(vb).multiplyScalar(0.5);
    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
    };
  }, [a, b]);
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[r * 0.8, r, length, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[r * 1.15, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
      <mesh position={[0, -length / 2, 0]}>
        <sphereGeometry args={[r * 0.95, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} {...emissiveProps(selected)} />
      </mesh>
    </group>
  );
}

/** Translucent triangle fan linking adjacent digit tips — wing/flipper membrane. */
function Membrane({ points, color }: { points: [number, number, number][]; color: string }): JSX.Element {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const verts: number[] = [];
    const origin = points[0];
    for (let i = 1; i < points.length - 1; i++) {
      verts.push(...origin, ...points[i], ...points[i + 1]);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.computeVertexNormals();
    return g;
  }, [points]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.32}
        roughness={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

type V3 = [number, number, number];

interface DigitSpec {
  /** angle of the digit in the palm plane (radians, 0 = straight up) */
  angle: number;
  /** metacarpal length */
  mcLen: number;
  /** phalanx segment lengths */
  segs: number[];
  /** bone radius */
  r: number;
}

interface AnimalSpec {
  key: string;
  name: string;
  x: number;
  humerusLen: number;
  humerusR: number;
  foreLen: number;
  foreR: number;
  ulnaShort: boolean;
  wristWidth: number;
  digits: DigitSpec[];
  membraneColor: string | null;
  clawTips: boolean;
}

const BONE_COLORS: Record<string, string> = {
  humerus: '#f87171',
  radius: '#60a5fa',
  ulna: '#22d3ee',
  carpals: '#c084fc',
  metacarpals: '#fbbf24',
  phalanges: '#a3e635',
};

const rad = (d: number) => (d * Math.PI) / 180;

/** Human arm: long levers, opposable thumb, dexterous fingers. */
const HUMAN: AnimalSpec = {
  key: 'human',
  name: 'Human (arm)',
  x: -3.6,
  humerusLen: 1.05,
  humerusR: 0.09,
  foreLen: 0.95,
  foreR: 0.07,
  ulnaShort: false,
  wristWidth: 0.42,
  digits: [
    { angle: rad(-52), mcLen: 0.32, segs: [0.28, 0.2], r: 0.045 }, // thumb, opposable
    { angle: rad(-16), mcLen: 0.5, segs: [0.32, 0.24, 0.18], r: 0.04 },
    { angle: rad(0), mcLen: 0.55, segs: [0.34, 0.26, 0.2], r: 0.04 },
    { angle: rad(16), mcLen: 0.5, segs: [0.32, 0.24, 0.18], r: 0.038 },
    { angle: rad(30), mcLen: 0.42, segs: [0.28, 0.2, 0.16], r: 0.034 },
  ],
  membraneColor: null,
  clawTips: false,
};

/** Cheetah foreleg: sturdy runner's limb, gathered toes with claws. */
const CHEETAH: AnimalSpec = {
  key: 'cheetah',
  name: 'Cheetah (foreleg)',
  x: -1.2,
  humerusLen: 0.85,
  humerusR: 0.1,
  foreLen: 0.95,
  foreR: 0.08,
  ulnaShort: false,
  wristWidth: 0.36,
  digits: [
    { angle: rad(-30), mcLen: 0.5, segs: [0.3, 0.22, 0.16], r: 0.055 },
    { angle: rad(-14), mcLen: 0.58, segs: [0.32, 0.24, 0.16], r: 0.058 },
    { angle: rad(2), mcLen: 0.6, segs: [0.32, 0.24, 0.16], r: 0.058 },
    { angle: rad(18), mcLen: 0.58, segs: [0.3, 0.22, 0.16], r: 0.055 },
    { angle: rad(34), mcLen: 0.5, segs: [0.28, 0.2, 0.15], r: 0.05 },
  ],
  membraneColor: null,
  clawTips: true,
};

/** Whale flipper: shortened, flattened paddle — swimming repurposes the same bones. */
const WHALE: AnimalSpec = {
  key: 'whale',
  name: 'Whale (flipper)',
  x: 1.2,
  humerusLen: 0.55,
  humerusR: 0.14,
  foreLen: 0.6,
  foreR: 0.12,
  ulnaShort: false,
  wristWidth: 0.55,
  digits: [
    { angle: rad(-42), mcLen: 0.34, segs: [0.3, 0.26], r: 0.075 },
    { angle: rad(-21), mcLen: 0.42, segs: [0.34, 0.3], r: 0.08 },
    { angle: rad(0), mcLen: 0.46, segs: [0.36, 0.32], r: 0.08 },
    { angle: rad(21), mcLen: 0.42, segs: [0.34, 0.3], r: 0.075 },
    { angle: rad(42), mcLen: 0.34, segs: [0.3, 0.26], r: 0.07 },
  ],
  membraneColor: '#7dd3fc',
  clawTips: false,
};

/** Bat wing: digits II–V hugely elongated to carry the flight membrane. */
const BAT: AnimalSpec = {
  key: 'bat',
  name: 'Bat (wing)',
  x: 3.6,
  humerusLen: 0.7,
  humerusR: 0.07,
  foreLen: 1.05,
  foreR: 0.06,
  ulnaShort: true,
  wristWidth: 0.3,
  digits: [
    { angle: rad(-60), mcLen: 0.3, segs: [0.26, 0.18], r: 0.04 }, // digit I: short clawed thumb
    { angle: rad(-28), mcLen: 0.9, segs: [0.85, 0.7], r: 0.035 },
    { angle: rad(-6), mcLen: 1.0, segs: [0.95, 0.8], r: 0.035 },
    { angle: rad(18), mcLen: 0.95, segs: [0.88, 0.72], r: 0.033 },
    { angle: rad(42), mcLen: 0.85, segs: [0.8, 0.65], r: 0.03 },
  ],
  membraneColor: '#c4b5fd',
  clawTips: true,
};

const ANIMALS: AnimalSpec[] = [HUMAN, CHEETAH, WHALE, BAT];

/** Build all bone segment data for one animal in its local frame. */
function buildLimb(spec: AnimalSpec) {
  const y0 = -1.7;
  const elbow = y0 + spec.humerusLen;
  const wrist = elbow + spec.foreLen;
  const ulnaLen = spec.ulnaShort ? spec.foreLen * 0.5 : spec.foreLen;

  const humerus: { a: V3; b: V3 } = { a: [0, y0, 0], b: [0.05, elbow, 0] };
  const radius: { a: V3; b: V3 } = { a: [-0.05, elbow, 0.02], b: [-0.05, wrist, 0.02] };
  const ulna: { a: V3; b: V3 } = { a: [0.1, elbow, -0.02], b: [0.1, elbow + ulnaLen, -0.02] };

  // Carpals: two rows of small pebbles at the wrist.
  const carpals: V3[] = [];
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 4; c++) {
      carpals.push([
        -spec.wristWidth / 2 + (c / 3) * spec.wristWidth,
        wrist + 0.06 + row * 0.11,
        (row % 2 === 0 ? 0.02 : -0.02),
      ]);
    }
  }

  const metacarpals: { a: V3; b: V3; tip: V3 }[] = [];
  const phalanges: { a: V3; b: V3; r: number }[] = [];
  const digitTips: V3[] = [];
  const digitBases: V3[] = [];

  spec.digits.forEach((d, i) => {
    const frac = spec.digits.length === 1 ? 0.5 : i / (spec.digits.length - 1);
    const baseX = -spec.wristWidth / 2 + frac * spec.wristWidth;
    const baseY = wrist + 0.22;
    digitBases.push([baseX, baseY, 0]);
    const dir = [Math.sin(d.angle), Math.cos(d.angle), 0] as V3;
    const tip: V3 = [baseX + dir[0] * d.mcLen, baseY + dir[1] * d.mcLen, 0];
    metacarpals.push({ a: [baseX, baseY, 0], b: tip, tip });
    let cursor: V3 = tip;
    d.segs.forEach((len, si) => {
      // Gentle inward curl on later segments.
      const a2 = d.angle + si * (d.angle >= 0 ? 1 : -1) * rad(6);
      const step = [Math.sin(a2), Math.cos(a2), 0] as V3;
      const next: V3 = [cursor[0] + step[0] * len, cursor[1] + step[1] * len, 0];
      phalanges.push({ a: cursor, b: next, r: d.r * (1 - si * 0.18) });
      cursor = next;
    });
    digitTips.push(cursor);
  });

  return { humerus, radius, ulna, carpals, metacarpals, phalanges, digitTips, digitBases, humerusR: spec.humerusR, foreR: spec.foreR, ulnaR: spec.foreR * 0.85, spec };
}

function CarpalPebbles({ centers, selected }: { centers: V3[]; selected: boolean }): JSX.Element {
  return (
    <group>
      {centers.map((c, i) => (
        <mesh key={i} position={c}>
          <sphereGeometry args={[0.075, 12, 10]} />
          <meshStandardMaterial color={BONE_COLORS.carpals} roughness={0.55} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

function ClawTips({ tips, selected }: { tips: V3[]; selected: boolean }): JSX.Element {
  return (
    <group>
      {tips.map((t, i) => (
        <mesh key={i} position={[t[0], t[1] + 0.05, t[2]]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.16, 10]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.4} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

function Forelimb({ spec, showLabels, selectedId, onSelect }: { spec: AnimalSpec; showLabels: boolean; selectedId: string | null; onSelect: (id: string | null) => void }): JSX.Element {
  const limb = useMemo(() => buildLimb(spec), [spec]);
  const sel = (id: string) => selectedId === id;

  const membranePoints: V3[] | null = useMemo(() => {
    if (!spec.membraneColor) return null;
    // Fan from digit bases out to tips and back: one triangle strip over all digits.
    const pts: V3[] = [[0, -1.2, 0]];
    limb.digitBases.forEach((b) => pts.push([b[0], b[1], 0]));
    for (let i = limb.digitTips.length - 1; i >= 0; i--) pts.push(limb.digitTips[i]);
    return pts;
  }, [spec, limb]);

  return (
    <group>
      <PartGroup id="humerus" position={[0, 0, 0]} onSelect={onSelect}>
        <LimbBone a={limb.humerus.a} b={limb.humerus.b} r={limb.humerusR} color={BONE_COLORS.humerus} selected={sel('humerus')} />
      </PartGroup>
      <PartGroup id="radius" position={[0, 0, 0]} onSelect={onSelect}>
        <LimbBone a={limb.radius.a} b={limb.radius.b} r={limb.foreR} color={BONE_COLORS.radius} selected={sel('radius')} />
      </PartGroup>
      <PartGroup id="ulna" position={[0, 0, 0]} onSelect={onSelect}>
        <LimbBone a={limb.ulna.a} b={limb.ulna.b} r={limb.ulnaR} color={BONE_COLORS.ulna} selected={sel('ulna')} />
      </PartGroup>
      <PartGroup id="carpals" position={[0, 0, 0]} onSelect={onSelect}>
        <CarpalPebbles centers={limb.carpals} selected={sel('carpals')} />
      </PartGroup>
      <PartGroup id="metacarpals" position={[0, 0, 0]} onSelect={onSelect}>
        {limb.metacarpals.map((m, i) => (
          <LimbBone key={i} a={m.a} b={m.b} r={spec.digits[i].r * 1.1} color={BONE_COLORS.metacarpals} selected={sel('metacarpals')} />
        ))}
      </PartGroup>
      <PartGroup id="phalanges" position={[0, 0, 0]} onSelect={onSelect}>
        {limb.phalanges.map((p, i) => (
          <LimbBone key={i} a={p.a} b={p.b} r={p.r} color={BONE_COLORS.phalanges} selected={sel('phalanges')} />
        ))}
        {spec.clawTips && <ClawTips tips={limb.digitTips} selected={sel('phalanges')} />}
      </PartGroup>
      {membranePoints && <Membrane points={membranePoints} color={spec.membraneColor as string} />}
      {/* Animal name plate */}
      {showLabels && <PartLabel position={[0, -2.35, 0]} name={spec.name} />}
      {/* Representative bone labels on the human arm only */}
      {showLabels && spec.key === 'human' && (
        <>
          <PartLabel position={[-0.48, -1.17, 0]} name="Humerus" />
          <PartLabel position={[-0.45, -0.18, 0]} name="Radius" />
          <PartLabel position={[0.5, -0.18, 0]} name="Ulna" />
          <PartLabel position={[0.52, 0.42, 0]} name="Carpals" />
          <PartLabel position={[-0.5, 0.8, 0]} name="Metacarpals" />
          <PartLabel position={[0.58, 1.45, 0]} name="Phalanges" />
        </>
      )}
    </group>
  );
}

export default function HomologousOrgans(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;

  // Gentle baseline connecting the four: a shared "ancestral pattern" bar.
  return (
    <group>
      {ANIMALS.map((spec) => (
        <group key={spec.key} position={[spec.x + explodeOffset([spec.x, 0, 0], explode)[0], 0, 0]}>
          <Forelimb spec={spec} showLabels={showLabels} selectedId={selectedId} onSelect={onSelect} />
        </group>
      ))}
      {/* Divergent-evolution annotation arrow row */}
      {showLabels && (
        <PartLabel position={[0, -2.85, 0]} name="Same bones, different jobs — divergent evolution" />
      )}
    </group>
  );
}
