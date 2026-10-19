'use client';

import { useMemo, type ReactNode } from 'react';
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

/** A capsule segment between two points. */
function Segment({
  from,
  to,
  radius,
  color,
  selected,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  color: string;
  selected: boolean;
}): JSX.Element {
  const { position, quaternion, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: [mid.x, mid.y, mid.z] as [number, number, number], quaternion: q, len };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry args={[radius, len, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} {...emissiveProps(selected)} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// IgG geometry: Y shape, hinge at (0, 0.2, 0), arms at ±38°
// ---------------------------------------------------------------------------
const ARM_ANG = (38 * Math.PI) / 180;
const ARM_LEN = 1.35;
const HINGE_Y = 0.2;

type V3 = [number, number, number];

function armTip(side: 1 | -1): V3 {
  return [side * Math.sin(ARM_ANG) * ARM_LEN, HINGE_Y + Math.cos(ARM_ANG) * ARM_LEN, 0];
}
function stemEnd(side: 1 | -1): V3 {
  return [side * 0.13, -1.3, 0];
}
function lerpV(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
/** Outward perpendicular of an arm (in the XY plane). */
function armPerp(side: 1 | -1): V3 {
  return [side * Math.cos(ARM_ANG), -Math.sin(ARM_ANG), 0];
}

const HEAVY = '#f59e0b';
const LIGHT = '#60a5fa';
const VARIABLE = '#34d399';
const HINGE = '#a78bfa';
const DISULFIDE = '#ef4444';
const ANTIGEN = '#e879f9';

const SIDES: (1 | -1)[] = [1, -1];

export default function Antibody(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const antigenBob = 0.07 * Math.sin(animTime * 2);

  // Precompute arm anatomy once (constant geometry).
  const arms = useMemo(
    () =>
      SIDES.map((side) => {
        const base: V3 = [0, HINGE_Y, 0];
        const tip = armTip(side);
        const vStart = lerpV(base, tip, 0.62); // variable region begins here
        const perp = armPerp(side);
        const lightBase = lerpV(base, tip, 0.28).map((v, i) => v + perp[i] * 0.3) as V3;
        const lightTip = tip.map((v, i) => v + perp[i] * 0.3) as V3;
        const lightVStart = lerpV(lightBase, lightTip, 0.45);
        const bondAt = lerpV(base, tip, 0.78);
        const bondTo = bondAt.map((v, i) => v + perp[i] * 0.3) as V3;
        return { side, base, tip, vStart, lightBase, lightTip, lightVStart, bondAt, bondTo };
      }),
    [],
  );

  const stemBond: { from: V3; to: V3 } = {
    from: [-0.115, -0.55, 0],
    to: [0.115, -0.55, 0],
  };

  return (
    <group>
      {/* ================= Heavy chains (stem + arm cores) ================= */}
      <PartGroup id="heavy-chain" position={explodeOffset([0, -0.9, 0], explode)} onSelect={onSelect}>
        {SIDES.map((side) => (
          <Segment key={side} from={stemEnd(side)} to={[0, HINGE_Y, 0]} radius={0.15} color={HEAVY} selected={sel('heavy-chain')} />
        ))}
        {arms.map((a) => (
          <Segment key={a.side} from={a.base} to={a.vStart} radius={0.15} color={HEAVY} selected={sel('heavy-chain')} />
        ))}
        {showLabels && <PartLabel position={[-0.95, -0.35, 0]} name="Heavy chain" />}
      </PartGroup>

      {/* ================= Light chains ================= */}
      <PartGroup id="light-chain" position={explodeOffset([1.5, 0.4, 0], explode)} onSelect={onSelect}>
        {arms.map((a) => (
          <Segment key={a.side} from={a.lightBase} to={a.lightVStart} radius={0.11} color={LIGHT} selected={sel('light-chain')} />
        ))}
        {showLabels && <PartLabel position={[1.85, 0.95, 0]} name="Light chain" />}
      </PartGroup>

      {/* ================= Variable regions (antigen-binding tips) ================= */}
      <PartGroup id="variable-region" position={explodeOffset([0, 1.3, 0], explode)} onSelect={onSelect}>
        {arms.map((a) => (
          <group key={a.side}>
            <Segment from={a.vStart} to={a.tip} radius={0.155} color={VARIABLE} selected={sel('variable-region')} />
            <Segment from={a.lightVStart} to={a.lightTip} radius={0.115} color={VARIABLE} selected={sel('variable-region')} />
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.6, 1.75, 0]} name="Variable region (binds antigen)" />}
      </PartGroup>

      {/* ================= Constant regions ================= */}
      <PartGroup id="constant-region" position={explodeOffset([-1.4, -0.6, 0], explode)} onSelect={onSelect}>
        {/* the constant parts are the same meshes, ghosted as a highlight band on the stem */}
        {SIDES.map((side) => (
          <Segment key={side} from={stemEnd(side)} to={[side * 0.05, -0.1, 0]} radius={0.185} color="#fde68a" selected={sel('constant-region')} />
        ))}
        {showLabels && <PartLabel position={[1.0, -1.15, 0]} name="Constant region" />}
      </PartGroup>

      {/* ================= Hinge ================= */}
      <PartGroup id="hinge" position={explodeOffset([0, 0.7, 0], explode)} onSelect={onSelect}>
        {SIDES.map((side) => (
          <mesh key={side} position={[side * 0.09, HINGE_Y, 0]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color={HINGE} roughness={0.4} {...emissiveProps(sel('hinge'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.75, 0.05, 0]} name="Hinge (flexible)" />}
      </PartGroup>

      {/* ================= Disulfide bonds ================= */}
      <PartGroup id="disulfide" position={explodeOffset([0, 0.35, 0.8], explode)} onSelect={onSelect}>
        <Segment from={stemBond.from} to={stemBond.to} radius={0.04} color={DISULFIDE} selected={sel('disulfide')} />
        {arms.map((a) => (
          <Segment key={a.side} from={a.bondAt} to={a.bondTo} radius={0.035} color={DISULFIDE} selected={sel('disulfide')} />
        ))}
        {showLabels && <PartLabel position={[-0.85, -0.9, 0]} name="Disulfide bonds" />}
      </PartGroup>

      {/* ================= Antigen (bound to right tip) ================= */}
      <PartGroup id="antigen" position={explodeOffset([0.8, 1.6, 0], explode)} onSelect={onSelect}>
        <group position={[armTip(1)[0] + 0.32, armTip(1)[1] + 0.28 + antigenBob, 0]}>
          <mesh scale={[1, 0.82, 0.9]}>
            <icosahedronGeometry args={[0.36, 1]} />
            <meshStandardMaterial color={ANTIGEN} roughness={0.45} metalness={0.05} flatShading {...emissiveProps(sel('antigen'))} />
          </mesh>
          {/* complementary surface notch hint */}
          <mesh position={[-0.22, -0.2, 0]} scale={[0.5, 0.42, 0.45]}>
            <icosahedronGeometry args={[0.36, 1]} />
            <meshStandardMaterial color="#a21caf" roughness={0.5} flatShading {...emissiveProps(sel('antigen'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[1.75, 2.25, 0]} name="Antigen" />}
      </PartGroup>
    </group>
  );
}
