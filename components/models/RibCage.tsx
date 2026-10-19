'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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
const CARTILAGE = '#cfe0e8';

function BoneMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={BONE} roughness={0.6} metalness={0.02} {...em} />;
}

function CartilageMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={CARTILAGE} roughness={0.45} metalness={0.02} {...em} />;
}

type RibKind = 'true' | 'false' | 'floating';

/** One rib as a Catmull-Rom tube: from the spine, curving around to the front. */
function ribCurve(side: 1 | -1, y: number, s: number, short: boolean): THREE.CatmullRomCurve3 {
  const pts: [number, number, number][] = short
    ? [
        [0.28 * side, y, -0.55],
        [0.72 * s * side, y + 0.02, -0.42],
        [1.0 * s * side, y - 0.08, -0.08],
        [0.88 * s * side, y - 0.22, 0.26],
      ]
    : [
        [0.28 * side, y, -0.55],
        [0.75 * s * side, y + 0.02, -0.42],
        [1.06 * s * side, y - 0.06, -0.05],
        [0.99 * s * side, y - 0.18, 0.42],
        [0.62 * s * side, y - 0.3, 0.8],
      ];
  return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
}

interface RibSpec {
  i: number;
  side: 1 | -1;
  y: number;
  kind: RibKind;
  curve: THREE.CatmullRomCurve3;
  end: THREE.Vector3;
}

export default function RibCage(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const ribs = useMemo<RibSpec[]>(() => {
    const arr: RibSpec[] = [];
    for (let i = 1; i <= 12; i += 1) {
      const y = 2.8 - (i - 1) * 0.36;
      const s = i <= 10 ? 1 - 0.02 * (i - 1) : i === 11 ? 0.72 : 0.62;
      const short = i >= 11;
      const kind: RibKind = i <= 7 ? 'true' : i <= 10 ? 'false' : 'floating';
      for (const side of [1, -1] as const) {
        const curve = ribCurve(side, y, s, short);
        arr.push({ i, side, y, kind, curve, end: curve.getPoint(1) });
      }
    }
    return arr;
  }, []);

  /** Costal cartilage: true ribs reach the sternum; false ribs merge upward. */
  const cartilages = useMemo<THREE.CatmullRomCurve3[]>(() => {
    return ribs
      .filter((r) => r.kind !== 'floating')
      .map((r) => {
        const target =
          r.kind === 'true'
            ? new THREE.Vector3(0.26 * r.side, r.y - 0.3, 1.02)
            : new THREE.Vector3(0.48 * r.side, r.y - 0.08, 0.9);
        const mid = r.end.clone().lerp(target, 0.5);
        if (r.kind === 'false') mid.y += 0.12;
        return new THREE.CatmullRomCurve3([r.end, mid, target]);
      });
  }, [ribs]);

  const vertYs = useMemo(() => Array.from({ length: 12 }, (_, i) => 2.8 - i * 0.36), []);

  const ribGroup = (kind: RibKind, id: string, labelPos: [number, number, number], label: string) => (
    <PartGroup id={id} position={explodeOffset([0, 0, 0.15], explode)} onSelect={onSelect}>
      {([1, -1] as const).map((side) => (
        <group key={side} position={explodeOffset([side, 0, 0], explode)}>
          {ribs
            .filter((r) => r.kind === kind && r.side === side)
            .map((r) => (
              <mesh key={r.i}>
                <tubeGeometry args={[r.curve, 32, 0.07, 10, false]} />
                <BoneMat selected={sel(id)} />
              </mesh>
            ))}
        </group>
      ))}
      {showLabels && <PartLabel position={labelPos} name={label} />}
    </PartGroup>
  );

  return (
    <group>
      {/* ---- Thoracic vertebrae: rear wall every rib hinges from ---- */}
      <PartGroup id="thoracic-vertebrae" position={explodeOffset([0, 0, -1], explode)} onSelect={onSelect}>
        {vertYs.map((y, i) => (
          <group key={i} position={[0, y, -0.6]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.28, 0.3, 18]} />
              <BoneMat selected={sel('thoracic-vertebrae')} />
            </mesh>
            <mesh position={[0, -0.06, -0.42]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.5]} />
              <BoneMat selected={sel('thoracic-vertebrae')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.3, 2.9, -0.9]} name="Thoracic vertebrae" />}
      </PartGroup>

      {/* ---- True ribs 1-7 ---- */}
      {ribGroup('true', 'true-ribs', [2.0, 2.0, 0.35], 'True ribs (1–7)')}
      {/* ---- False ribs 8-10 ---- */}
      {ribGroup('false', 'false-ribs', [2.0, 0.3, 0.35], 'False ribs (8–10)')}
      {/* ---- Floating ribs 11-12 ---- */}
      {ribGroup('floating', 'floating-ribs', [-1.7, -1.0, 0.2], 'Floating ribs (11–12)')}

      {/* ---- Costal cartilage ---- */}
      <PartGroup id="costal-cartilage" position={explodeOffset([0, 0, 0.7], explode)} onSelect={onSelect}>
        {cartilages.map((c, i) => (
          <mesh key={i}>
            <tubeGeometry args={[c, 16, 0.055, 8, false]} />
            <CartilageMat selected={sel('costal-cartilage')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.35, 1.1, 1.45]} name="Costal cartilage" />}
      </PartGroup>

      {/* ---- Sternum: manubrium + body + xiphoid ---- */}
      <PartGroup id="sternum" position={explodeOffset([0, 0.1, 1], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.62, 1.0]}>
          <boxGeometry args={[0.72, 0.5, 0.16]} />
          <BoneMat selected={sel('sternum')} />
        </mesh>
        <mesh position={[0, 1.55, 1.0]}>
          <boxGeometry args={[0.5, 1.6, 0.14]} />
          <BoneMat selected={sel('sternum')} />
        </mesh>
        <mesh position={[0, 0.62, 1.0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <BoneMat selected={sel('sternum')} />
        </mesh>
        {showLabels && <PartLabel position={[-1.35, 1.55, 1.15]} name="Sternum" />}
      </PartGroup>
    </group>
  );
}
