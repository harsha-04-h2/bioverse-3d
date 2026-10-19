'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
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

// Lymph node positions along the stylised lymphatic vessels.
const NODE_SPOTS: [number, number, number][] = [
  [-0.62, 1.28, 0.18],
  [-0.7, 0.62, 0.22],
  [-0.66, -0.05, 0.24],
  [0.68, 0.85, 0.2],
  [0.72, 0.1, 0.22],
  [-0.25, -0.85, 0.2],
  [0.3, -0.8, 0.2],
];

// White-pulp follicle positions inside the spleen callout.
const FOLLICLES = [
  [0.3, 0.25, 0.35],
  [-0.35, 0.15, 0.3],
  [0.05, -0.35, 0.4],
  [-0.15, 0.45, -0.2],
  [0.4, -0.1, -0.3],
  [-0.4, -0.3, -0.15],
] as [number, number, number][];

function Intestine({ selected }: { selected: boolean }): JSX.Element {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = -0.35 + t * 0.7;
      const y = -1.15 - 0.35 * t + 0.09 * Math.sin(t * Math.PI * 7);
      pts.push(new THREE.Vector3(x, y, 0.12));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.075, 8, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#fdba74" roughness={0.5} {...emissiveProps(selected)} />
    </mesh>
  );
}

export default function LymphoidOrgans(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Gentle "lymph flow" pulse travelling along the vessels.
  const flow = (animTime * 0.6) % 1;
  const pulseY = 1.5 - flow * 2.6;

  return (
    <group>
      {/* ================= Stylised torso shell (translucent) ================= */}
      <group>
        <mesh position={[0, 0.1, 0]} scale={[1.18, 1, 0.72]}>
          <capsuleGeometry args={[0.92, 1.7, 8, 24]} />
          <meshStandardMaterial color="#fcd9b8" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <sphereGeometry args={[0.48, 24, 18]} />
          <meshStandardMaterial color="#fcd9b8" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
        </mesh>
        {showLabels && <PartLabel position={[0, -1.95, 0]} name="Lymphoid organs (schematic torso)" />}
      </group>

      {/* ================= Bone marrow (primary) ================= */}
      <PartGroup id="bone-marrow" position={explodeOffset([-1.9, -0.4, 0], explode)} onSelect={onSelect}>
        <group position={[-1.55, -0.2, 0]} rotation={[0, 0, 0.12]}>
          <mesh>
            <capsuleGeometry args={[0.3, 1.5, 8, 18]} />
            <meshStandardMaterial color="#fef3c7" transparent opacity={0.4} roughness={0.5} depthWrite={false} {...emissiveProps(sel('bone-marrow'))} />
          </mesh>
          <mesh>
            <capsuleGeometry args={[0.15, 1.2, 8, 14]} />
            <meshStandardMaterial color="#ef4444" roughness={0.45} {...emissiveProps(sel('bone-marrow'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[-1.55, 1.05, 0]} name="Bone marrow (primary)" />}
      </PartGroup>

      {/* ================= Thymus (primary) ================= */}
      <PartGroup id="thymus" position={explodeOffset([0, 1.5, 0.3], explode)} onSelect={onSelect}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.26, 1.15, 0.1]} scale={[0.62, 0.42, 0.4]}>
            <sphereGeometry args={[0.4, 20, 16]} />
            <meshStandardMaterial color="#f9a8d4" roughness={0.45} {...emissiveProps(sel('thymus'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0, 1.75, 0.1]} name="Thymus (primary)" />}
      </PartGroup>

      {/* ================= Spleen (secondary) ================= */}
      <PartGroup id="spleen" position={explodeOffset([1.5, 0.5, 0], explode)} onSelect={onSelect}>
        <mesh position={[0.78, 0.35, 0.05]} scale={[0.62, 0.45, 0.34]}>
          <sphereGeometry args={[0.5, 24, 18]} />
          <meshStandardMaterial color="#a855f7" roughness={0.45} {...emissiveProps(sel('spleen'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.78, 0.95, 0.05]} name="Spleen (secondary)" />}
      </PartGroup>

      {/* ================= Spleen detail callout: white vs red pulp ================= */}
      <PartGroup id="spleen-detail" position={explodeOffset([0, 0.3, 0], explode)} onSelect={onSelect}>
        <group position={[3.1, 0.35, 0]}>
          <mesh>
            <sphereGeometry args={[0.8, 28, 22]} />
            <meshStandardMaterial color="#dc2626" roughness={0.55} {...emissiveProps(sel('spleen-detail'))} />
          </mesh>
          {FOLLICLES.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.16, 14, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} {...emissiveProps(sel('spleen-detail'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[0, 1.15, 0]} name="Spleen — magnified" />}
          {showLabels && <PartLabel position={[0.75, -0.5, 0.45]} name="White pulp (lymphocytes)" />}
          {showLabels && <PartLabel position={[-0.85, -0.55, 0.2]} name="Red pulp" />}
        </group>
        <Line points={[[1.35, 0.5, 0.05], [2.25, 0.45, 0]]} color="#94a3b8" lineWidth={1} transparent opacity={0.7} />
      </PartGroup>

      {/* ================= Lymphatic vessels + flow pulse ================= */}
      <PartGroup id="lymphatic-vessels" position={explodeOffset([-0.6, 0, 0.6], explode)} onSelect={onSelect}>
        <Line points={[[-0.62, 1.5, 0.18], [-0.7, 0.3, 0.22], [-0.55, -1.0, 0.2]]} color="#4ade80" lineWidth={2} transparent opacity={0.85} />
        <Line points={[[0.68, 1.1, 0.2], [0.72, -0.1, 0.22], [0.5, -0.95, 0.2]]} color="#4ade80" lineWidth={2} transparent opacity={0.85} />
        <Line points={[[-0.62, 1.5, 0.18], [0.68, 1.1, 0.2]]} color="#4ade80" lineWidth={2} transparent opacity={0.6} />
        <mesh position={[-0.68, pulseY, 0.24]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshBasicMaterial color="#bbf7d0" transparent opacity={0.9} />
        </mesh>
        {showLabels && <PartLabel position={[-1.35, 1.6, 0.2]} name="Lymphatic vessels" />}
      </PartGroup>

      {/* ================= Lymph nodes (secondary) ================= */}
      <PartGroup id="lymph-nodes" position={explodeOffset([-1.1, 0.9, 0.5], explode)} onSelect={onSelect}>
        {NODE_SPOTS.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.4} {...emissiveProps(sel('lymph-nodes'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[1.25, 0.35, 0.2]} name="Lymph nodes (secondary)" />}
      </PartGroup>

      {/* ================= Tonsils (secondary) ================= */}
      <PartGroup id="tonsils" position={explodeOffset([0, 1.2, 0.8], explode)} onSelect={onSelect}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.17, 2.05, 0.28]}>
            <sphereGeometry args={[0.11, 14, 12]} />
            <meshStandardMaterial color="#fb7185" roughness={0.45} {...emissiveProps(sel('tonsils'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.75, 2.15, 0.28]} name="Tonsils" />}
      </PartGroup>

      {/* ================= Peyer's patches (secondary) ================= */}
      <PartGroup id="peyers-patches" position={explodeOffset([0.6, -1.3, 0.3], explode)} onSelect={onSelect}>
        <Intestine selected={sel('peyers-patches')} />
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.28 + i * 0.115, -1.32 - 0.05 * i + 0.09 * Math.sin((i / 5) * Math.PI * 7), 0.21]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial color="#4ade80" roughness={0.4} {...emissiveProps(sel('peyers-patches'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.35, -2.0, 0.15]} name="Peyer's patches (gut)" />}
      </PartGroup>
    </group>
  );
}
