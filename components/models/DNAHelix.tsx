'use client';
import * as THREE from 'three';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Html } from '@react-three/drei';

export interface BioModelProps {
  explode: number;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  animTime: number; // seconds; drive ALL motion deterministically from this
  cutaway?: boolean; // ignore for these models
}

const HELIX_RADIUS = 0.55;
const Y_MIN = -2.2;
const Y_MAX = 2.2;
const TURNS = 3;
const RUNG_COUNT = 30;

const PAIRS: string[] = [
  'AT', 'GC', 'TA', 'CG', 'AT', 'CG', 'GC', 'TA', 'AT', 'GC',
  'TA', 'CG', 'GC', 'AT', 'TA', 'GC', 'CG', 'AT', 'GC', 'TA',
  'AT', 'CG', 'TA', 'GC', 'AT', 'CG', 'GC', 'TA', 'AT', 'GC',
];

const BASE_COLORS: Record<string, string> = {
  A: '#34d399',
  T: '#f87171',
  G: '#60a5fa',
  C: '#fbbf24',
};

function ClickableGroup({
  partId,
  onSelect,
  children,
}: {
  partId: string;
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(partId);
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

function partMaterial(color: string, partId: string, selectedId: string | null): ReactNode {
  const selected = selectedId === partId;
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.45}
      metalness={0.08}
      emissive={selected ? '#38bdf8' : '#000000'}
      emissiveIntensity={selected ? 0.4 : 0}
    />
  );
}

function PartLabel({ position, text }: { position: [number, number, number]; text: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{text}</span>
    </Html>
  );
}

function Rung({
  index,
  pair,
  partId,
  selectedId,
}: {
  index: number;
  pair: string;
  partId: string;
  selectedId: string | null;
}): JSX.Element {
  const y = Y_MIN + ((index + 0.5) / RUNG_COUNT) * (Y_MAX - Y_MIN);
  const theta = (index / RUNG_COUNT) * TURNS * Math.PI * 2;
  const isAT = pair === 'AT' || pair === 'TA';
  // Hydrogen bonds sit at the helix axis, tiny white spheres: 2 for A-T, 3 for G-C.
  const hbOffsets = isAT ? [-0.055, 0.055] : [-0.1, 0, 0.1];
  return (
    <group position={[0, y, 0]} rotation={[0, -theta, 0]}>
      {/* Left half-rung (strand A side): base = first letter of the pair */}
      <mesh position={[0.275, 0, 0]}>
        <boxGeometry args={[0.52, 0.14, 0.14]} />
        {partMaterial(BASE_COLORS[pair.charAt(0)] ?? '#ffffff', partId, selectedId)}
      </mesh>
      {/* Right half-rung (strand B side): base = second letter of the pair */}
      <mesh position={[-0.275, 0, 0]}>
        <boxGeometry args={[0.52, 0.14, 0.14]} />
        {partMaterial(BASE_COLORS[pair.charAt(1)] ?? '#ffffff', partId, selectedId)}
      </mesh>
      {hbOffsets.map((z, k) => (
        <mesh key={k} position={[0, 0, z]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          {partMaterial('#f8fafc', partId, selectedId)}
        </mesh>
      ))}
    </group>
  );
}

export default function DNAHelix(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;

  const strandAGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 200; k++) {
      const t = k / 199;
      const a = t * TURNS * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          HELIX_RADIUS * Math.cos(a),
          Y_MIN + (Y_MAX - Y_MIN) * t,
          HELIX_RADIUS * Math.sin(a),
        ),
      );
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.09, 12, false);
  }, []);

  const strandBGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 200; k++) {
      const t = k / 199;
      const a = t * TURNS * Math.PI * 2 + Math.PI; // offset by PI
      pts.push(
        new THREE.Vector3(
          HELIX_RADIUS * Math.cos(a),
          Y_MIN + (Y_MAX - Y_MIN) * t,
          HELIX_RADIUS * Math.sin(a),
        ),
      );
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.09, 12, false);
  }, []);

  useEffect(() => {
    return () => {
      strandAGeo.dispose();
      strandBGeo.dispose();
    };
  }, [strandAGeo, strandBGeo]);

  const atRungs = useMemo(
    () =>
      PAIRS.map((pair, index) => ({ pair, index })).filter(
        (r) => r.pair === 'AT' || r.pair === 'TA',
      ),
    [],
  );
  const gcRungs = useMemo(
    () =>
      PAIRS.map((pair, index) => ({ pair, index })).filter(
        (r) => r.pair === 'GC' || r.pair === 'CG',
      ),
    [],
  );

  const scaleXZ = 1 + explode * 0.5;

  return (
    <group rotation={[0, animTime * 0.35, 0]} scale={[scaleXZ, 1, scaleXZ]}>
      {/* Sugar-phosphate backbones */}
      <ClickableGroup partId="backbone" onSelect={onSelect}>
        <mesh geometry={strandAGeo}>{partMaterial('#22d3ee', 'backbone', selectedId)}</mesh>
        <mesh geometry={strandBGeo}>{partMaterial('#22d3ee', 'backbone', selectedId)}</mesh>
        {showLabels && <PartLabel position={[1.1, 1.6, 0]} text="Sugar–phosphate backbone" />}
      </ClickableGroup>

      {/* A-T base-pair rungs */}
      <ClickableGroup partId="at-pair" onSelect={onSelect}>
        {atRungs.map((r) => (
          <Rung key={r.index} index={r.index} pair={r.pair} partId="at-pair" selectedId={selectedId} />
        ))}
        {showLabels && <PartLabel position={[-1.2, 0.4, 0]} text="A–T base pair" />}
      </ClickableGroup>

      {/* G-C base-pair rungs */}
      <ClickableGroup partId="gc-pair" onSelect={onSelect}>
        {gcRungs.map((r) => (
          <Rung key={r.index} index={r.index} pair={r.pair} partId="gc-pair" selectedId={selectedId} />
        ))}
        {showLabels && <PartLabel position={[1.2, -1.2, 0]} text="G–C base pair" />}
      </ClickableGroup>
    </group>
  );
}
