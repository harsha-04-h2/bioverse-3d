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

/** Cell-body material with optional selection glow. */
function CellMat({ color, selected, opacity = 1 }: { color: string; selected: boolean; opacity?: number }): JSX.Element {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.35}
      metalness={0.05}
      transparent={opacity < 1}
      opacity={opacity}
      {...emissiveProps(selected)}
    />
  );
}

function SpirillumBody({ selected }: { selected: boolean }): JSX.Element {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 3;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const th = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * 0.42, -1 + t * 2, Math.sin(th) * 0.42));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 140, 0.2, 10, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <CellMat color="#60a5fa" selected={selected} />
    </mesh>
  );
}

function Flagellum({ selected, sway }: { selected: boolean; sway: number }): JSX.Element {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = t * 1.7;
      pts.push(new THREE.Vector3(x, 0.28 * Math.sin(t * Math.PI * 6), 0.28 * Math.cos(t * Math.PI * 6)));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.03, 6, false);
  }, []);
  return (
    <group rotation={[0, 0, sway]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#fde68a" roughness={0.5} {...emissiveProps(selected)} />
      </mesh>
    </group>
  );
}

export default function BacteriaShapes(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const coccusBob = 0.05 * Math.sin(animTime * 1.8);
  const flagSway = 0.18 * Math.sin(animTime * 2.4);

  return (
    <group>
      {/* ================= Coccus: singles, pairs, chains ================= */}
      <group position={[-4.1, coccusBob, 0]}>
        <PartGroup id="coccus" position={explodeOffset([-1, 0.3, 0], explode)} onSelect={onSelect}>
          {/* single coccus */}
          <mesh position={[-0.55, 0.75, 0]}>
            <sphereGeometry args={[0.38, 20, 16]} />
            <CellMat color="#4ade80" selected={sel('coccus')} />
          </mesh>
          {/* diplococcus (pair) */}
          <mesh position={[0.35, 0.85, 0]}>
            <sphereGeometry args={[0.3, 20, 16]} />
            <CellMat color="#4ade80" selected={sel('coccus')} />
          </mesh>
          <mesh position={[0.35, 0.28, 0]}>
            <sphereGeometry args={[0.3, 20, 16]} />
            <CellMat color="#4ade80" selected={sel('coccus')} />
          </mesh>
          {/* streptococcus (chain) */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[-0.7 + i * 0.36, -0.85, 0]}>
              <sphereGeometry args={[0.24, 18, 14]} />
              <CellMat color="#4ade80" selected={sel('coccus')} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[0, 1.55, 0]} name="Cocci — single, pair, chain" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0, -1.65, 0]} name="Coccus (spherical)" />}
      </group>

      {/* ================= Bacillus: rod + flagellum ================= */}
      <group position={[-1.35, 0, 0]}>
        <PartGroup id="bacillus" position={explodeOffset([-0.3, 0.6, 0], explode)} onSelect={onSelect}>
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[0.3, 1.15, 8, 18]} />
            <CellMat color="#fbbf24" selected={sel('bacillus')} />
          </mesh>
          {showLabels && <PartLabel position={[-0.75, 0.5, 0]} name="Cell body" />}
        </PartGroup>
        <PartGroup id="flagellum" position={explodeOffset([0.9, 0.9, 0], explode)} onSelect={onSelect}>
          <group position={[0.32, 1.05, 0]}>
            <Flagellum selected={sel('flagellum')} sway={flagSway} />
          </group>
          {showLabels && <PartLabel position={[1.35, 1.75, 0]} name="Flagellum" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0, -1.15, 0]} name="Bacillus (rod)" />}
      </group>

      {/* ================= Spirillum: rigid spiral ================= */}
      <group position={[1.35, 0, 0]}>
        <PartGroup id="spirillum" position={explodeOffset([0.2, 0.4, 0], explode)} onSelect={onSelect}>
          <SpirillumBody selected={sel('spirillum')} />
          {showLabels && <PartLabel position={[0.85, 0.4, 0]} name="Rigid spiral filament" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0, -1.65, 0]} name="Spirillum (spiral)" />}
      </group>

      {/* ================= Vibrio: comma ================= */}
      <group position={[3.9, 0, 0]}>
        <PartGroup id="vibrio" position={explodeOffset([1, 0.3, 0], explode)} onSelect={onSelect}>
          <mesh rotation={[0, 0, Math.PI * 0.08]}>
            <torusGeometry args={[0.55, 0.28, 14, 32, Math.PI * 0.95]} />
            <CellMat color="#c084fc" selected={sel('vibrio')} />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.15, 0]} name="Curved comma body" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0, -1.25, 0]} name="Vibrio (comma)" />}
      </group>
    </group>
  );
}
