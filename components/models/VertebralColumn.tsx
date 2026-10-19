'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Explode offset: base direction normalized * explode * 1.4. */
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

const BONE = '#e9dfc8';

function BoneMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={BONE} roughness={0.6} metalness={0.02} {...em} />;
}

/**
 * S-curve of the spine in the sagittal plane (lateral view), keyed by height y.
 * Positive z = forward (anterior). cervical/lumbar lordosis bulge forward,
 * thoracic kyphosis bulges backward.
 */
const CURVE_KEYS: [number, number][] = [
  [3.4, 0.1],
  [1.8, 0.3],
  [0.4, 0.05],
  [-1.4, -0.26],
  [-2.8, -0.02],
  [-4.2, 0.26],
  [-5.2, 0.1],
  [-6.5, -0.05],
];

function curveZ(y: number): number {
  for (let i = 0; i < CURVE_KEYS.length - 1; i += 1) {
    const [y0, z0] = CURVE_KEYS[i];
    const [y1, z1] = CURVE_KEYS[i + 1];
    if (y <= y0 && y >= y1) {
      const u = (y0 - y) / (y0 - y1);
      const s = u * u * (3 - 2 * u);
      return z0 + (z1 - z0) * s;
    }
  }
  return y > CURVE_KEYS[0][0] ? CURVE_KEYS[0][1] : CURVE_KEYS[CURVE_KEYS.length - 1][1];
}

/** Tilt each vertebra so its local up follows the curve tangent. */
function curveTilt(y: number): number {
  const dz = curveZ(y - 0.1) - curveZ(y);
  return Math.atan2(-dz, 0.1);
}

interface VertSpec {
  y: number;
  z: number;
  tilt: number;
  bodyR: number;
  bodyH: number;
  spinLen: number;
  facet: boolean;
  region: 'cervical' | 'thoracic' | 'lumbar';
}

/** One stylized vertebra: body, vertebral-foramen ring, spinous + transverse processes. */
function Vertebra({ spec, selected }: { spec: VertSpec; selected: boolean }): JSX.Element {
  const { bodyR, bodyH, spinLen, facet } = spec;
  return (
    <group position={[0, spec.y, spec.z]} rotation={[spec.tilt, 0, 0]}>
      {/* vertebral body (front, weight-bearing drum) */}
      <mesh position={[0, 0, bodyR * 0.35]}>
        <cylinderGeometry args={[bodyR, bodyR * 0.96, bodyH, 20]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* vertebral foramen: ring around the (vertical) spinal canal */}
      <mesh position={[0, 0, -bodyR * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[bodyR * 0.72, 0.06, 10, 24]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* spinous process: blade pointing back-down */}
      <mesh position={[0, -bodyH * 0.3, -bodyR * 1.35 - spinLen / 2]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.09, 0.13, spinLen]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* transverse processes: short arms left/right */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[bodyR * 0.95 * s, 0.02, -bodyR * 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.04, bodyR * 1.1, 10]} />
          <BoneMat selected={selected} />
        </mesh>
      ))}
      {/* rib facet hint on thoracic vertebrae */}
      {facet &&
        ([-1, 1] as const).map((s) => (
          <mesh key={`f${s}`} position={[bodyR * 0.95 * s, 0.04, bodyR * 0.55]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <BoneMat selected={selected} />
          </mesh>
        ))}
    </group>
  );
}

export default function VertebralColumn(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const regions = useMemo(() => {
    const defs: {
      region: VertSpec['region'];
      count: number;
      bodyR: number;
      bodyH: number;
      spinLen: number;
    }[] = [
      { region: 'cervical', count: 7, bodyR: 0.24, bodyH: 0.22, spinLen: 0.34 },
      { region: 'thoracic', count: 12, bodyR: 0.3, bodyH: 0.26, spinLen: 0.5 },
      { region: 'lumbar', count: 5, bodyR: 0.4, bodyH: 0.32, spinLen: 0.55 },
    ];
    const out: Record<VertSpec['region'], VertSpec[]> = { cervical: [], thoracic: [], lumbar: [] };
    let y = 3.4;
    for (const d of defs) {
      const step = d.bodyH + (d.region === 'lumbar' ? 0.11 : 0.09);
      for (let k = 0; k < d.count; k += 1) {
        out[d.region].push({
          y,
          z: curveZ(y),
          tilt: curveTilt(y),
          bodyR: d.bodyR * (1 + (rand(k * 7 + d.count) - 0.5) * 0.06),
          bodyH: d.bodyH,
          spinLen: d.spinLen,
          facet: d.region === 'thoracic',
          region: d.region,
        });
        y -= step;
      }
    }
    return out;
  }, []);

  const midY = (r: VertSpec['region']) => {
    const arr = regions[r];
    return (arr[0].y + arr[arr.length - 1].y) / 2;
  };

  const explodeDirs: Record<string, [number, number, number]> = {
    cervical: [0, 1, 0.2],
    thoracic: [0, 0.15, 0],
    lumbar: [0, -1, 0.2],
    sacrum: [0, -1.6, 0],
    coccyx: [0, -2.2, 0],
    sample: [1, 0, 0],
  };

  const sampleSpec: VertSpec = {
    y: -0.9,
    z: 0,
    tilt: 0,
    bodyR: 0.4,
    bodyH: 0.32,
    spinLen: 0.55,
    facet: false,
    region: 'lumbar',
  };

  return (
    <group scale={0.8} position={[0, 0.8, 0]}>
      {/* ---- Cervical: 7 small neck vertebrae ---- */}
      <PartGroup id="cervical" position={explodeOffset(explodeDirs.cervical, explode)} onSelect={onSelect}>
        {regions.cervical.map((spec, i) => (
          <Vertebra key={i} spec={spec} selected={sel('cervical')} />
        ))}
        {showLabels && <PartLabel position={[-1.7, midY('cervical'), 0.3]} name="Cervical (7)" />}
      </PartGroup>

      {/* ---- Thoracic: 12 medium vertebrae with rib facets ---- */}
      <PartGroup id="thoracic" position={explodeOffset(explodeDirs.thoracic, explode)} onSelect={onSelect}>
        {regions.thoracic.map((spec, i) => (
          <Vertebra key={i} spec={spec} selected={sel('thoracic')} />
        ))}
        {showLabels && <PartLabel position={[-1.7, midY('thoracic'), -0.1]} name="Thoracic (12)" />}
      </PartGroup>

      {/* ---- Lumbar: 5 large weight-bearing vertebrae ---- */}
      <PartGroup id="lumbar" position={explodeOffset(explodeDirs.lumbar, explode)} onSelect={onSelect}>
        {regions.lumbar.map((spec, i) => (
          <Vertebra key={i} spec={spec} selected={sel('lumbar')} />
        ))}
        {showLabels && <PartLabel position={[-1.7, midY('lumbar'), 0.25]} name="Lumbar (5)" />}
      </PartGroup>

      {/* ---- Sacrum: fused wedge ---- */}
      <PartGroup id="sacrum" position={explodeOffset(explodeDirs.sacrum, explode)} onSelect={onSelect}>
        <mesh position={[0, -5.55, 0.08]} rotation={[curveTilt(-5.55), 0, 0]}>
          <cylinderGeometry args={[0.52, 0.28, 0.95, 20]} />
          <BoneMat selected={sel('sacrum')} />
        </mesh>
        {/* fused-segment ridges */}
        {[-5.35, -5.6, -5.85].map((y, i) => (
          <mesh key={i} position={[0, y, 0.48]}>
            <boxGeometry args={[0.55 - i * 0.06, 0.06, 0.08]} />
            <BoneMat selected={sel('sacrum')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.7, -5.55, 0.1]} name="Sacrum" />}
      </PartGroup>

      {/* ---- Coccyx: small fused tail remnant ---- */}
      <PartGroup id="coccyx" position={explodeOffset(explodeDirs.coccyx, explode)} onSelect={onSelect}>
        {[
          { y: -6.15, r: 0.16 },
          { y: -6.35, r: 0.13 },
          { y: -6.52, r: 0.1 },
        ].map((c, i) => (
          <mesh key={i} position={[0, c.y, 0.02]} scale={[1, 1.15, 1]}>
            <sphereGeometry args={[c.r, 16, 12]} />
            <BoneMat selected={sel('coccyx')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.5, -6.35, 0.05]} name="Coccyx" />}
      </PartGroup>

      {/* ---- Sample vertebra beside the column (detail study) ---- */}
      <PartGroup id="vertebra-body" position={explodeOffset(explodeDirs.sample, explode)} onSelect={onSelect}>
        <group position={[2.7, 0, 0]} scale={1.6}>
          {/* body */}
          <mesh position={[0, sampleSpec.y, sampleSpec.bodyR * 0.35]}>
            <cylinderGeometry args={[sampleSpec.bodyR, sampleSpec.bodyR * 0.96, sampleSpec.bodyH, 24]} />
            <BoneMat selected={sel('vertebra-body')} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[1.9, -0.35, 0.4]} name="Vertebra body" />}
      </PartGroup>
      <PartGroup id="spinous-process" position={explodeOffset(explodeDirs.sample, explode)} onSelect={onSelect}>
        <group position={[2.7, 0, 0]} scale={1.6}>
          {/* foramen ring */}
          <mesh position={[0, sampleSpec.y, -sampleSpec.bodyR * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[sampleSpec.bodyR * 0.72, 0.06, 10, 28]} />
            <BoneMat selected={sel('spinous-process')} />
          </mesh>
          {/* spinous process */}
          <mesh
            position={[0, sampleSpec.y - sampleSpec.bodyH * 0.3, -sampleSpec.bodyR * 1.35 - sampleSpec.spinLen / 2]}
            rotation={[0.45, 0, 0]}
          >
            <boxGeometry args={[0.09, 0.13, sampleSpec.spinLen]} />
            <BoneMat selected={sel('spinous-process')} />
          </mesh>
          {/* transverse processes */}
          {([-1, 1] as const).map((s) => (
            <mesh
              key={s}
              position={[sampleSpec.bodyR * 0.95 * s, sampleSpec.y + 0.02, -sampleSpec.bodyR * 0.3]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.05, 0.04, sampleSpec.bodyR * 1.1, 10]} />
              <BoneMat selected={sel('spinous-process')} />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[2.7, -2.35, -0.6]} name="Spinous process" />}
      </PartGroup>
    </group>
  );
}
