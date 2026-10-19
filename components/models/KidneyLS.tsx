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

/**
 * Bean half-shell. `front=true` covers the z ≥ 0 hemisphere; the dent is carved
 * into the +x (medial/hilum) face. The front halves are hidden when `cutaway`
 * is on, opening the kidney like a textbook longitudinal section.
 */
function useBeanHalf(
  sx: number,
  sy: number,
  sz: number,
  dent: number,
  front: boolean,
): THREE.BufferGeometry {
  return useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 40, 28, front ? 0 : Math.PI, Math.PI);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i) * sx;
      const y = pos.getY(i) * sy;
      const z = pos.getZ(i) * sz;
      let nx = x;
      if (x > 0) {
        const g = Math.exp(-((y / (sy * 0.38)) ** 2)) * Math.min(1, x / (sx * 0.5));
        nx -= dent * g;
      }
      pos.setXYZ(i, nx, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [sx, sy, sz, dent, front]);
}

function tubeGeometry(points: [number, number, number][], radius: number, segs = 48): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 12, false);
}

// Medullary pyramid layout: apexes point +x (toward the renal pelvis).
const PYRAMIDS: { y: number }[] = [{ y: 0.62 }, { y: -0.02 }, { y: -0.66 }];
const PYR_X = -0.12;
const PYR_LEN = 0.95;
const PYR_R = 0.34;

export default function KidneyLS(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, cutaway = false } = props;
  const sel = (id: string) => selectedId === id;

  const capsuleFront = useBeanHalf(1.0, 1.6, 0.95, 0.4, true);
  const capsuleBack = useBeanHalf(1.0, 1.6, 0.95, 0.4, false);
  const cortexFront = useBeanHalf(0.88, 1.42, 0.83, 0.36, true);
  const cortexBack = useBeanHalf(0.88, 1.42, 0.83, 0.36, false);
  const medullaFront = useBeanHalf(0.7, 1.15, 0.66, 0.3, true);
  const medullaBack = useBeanHalf(0.7, 1.15, 0.66, 0.3, false);

  const ureterGeo = useMemo(
    () =>
      tubeGeometry(
        [
          [0.35, -0.5, 0],
          [0.42, -1.2, 0],
          [0.45, -1.9, 0],
          [0.45, -2.4, 0],
        ],
        0.12,
      ),
    [],
  );
  const arteryGeo = useMemo(
    () =>
      tubeGeometry(
        [
          [2.35, 0.6, 0.12],
          [1.5, 0.52, 0.1],
          [0.95, 0.42, 0.06],
        ],
        0.13,
      ),
    [],
  );
  const veinGeo = useMemo(
    () =>
      tubeGeometry(
        [
          [2.35, -0.12, -0.12],
          [1.5, -0.06, -0.1],
          [0.95, 0.0, -0.05],
        ],
        0.17,
      ),
    [],
  );

  const shellMat = (color: string, opacity: number, id: string) => (
    <meshStandardMaterial
      color={color}
      transparent
      opacity={opacity}
      roughness={0.5}
      metalness={0.04}
      side={THREE.DoubleSide}
      depthWrite={false}
      {...emissiveProps(sel(id))}
    />
  );

  return (
    <group>
      {/* ---- Fibrous capsule (outer bean shell) ---- */}
      <PartGroup id="cortex" position={explodeOffset([-0.6, 0.4, 0], explode)} onSelect={onSelect}>
        <mesh geometry={capsuleBack}>{shellMat('#b91c1c', 0.28, 'cortex')}</mesh>
        {!cutaway && <mesh geometry={capsuleFront}>{shellMat('#b91c1c', 0.28, 'cortex')}</mesh>}
        <mesh geometry={cortexBack}>{shellMat('#7f1d1d', 0.5, 'cortex')}</mesh>
        {!cutaway && <mesh geometry={cortexFront}>{shellMat('#7f1d1d', 0.5, 'cortex')}</mesh>}
        {showLabels && <PartLabel position={[-1.35, 1.0, 0.5]} name="Cortex" />}
      </PartGroup>

      {/* ---- Medulla region (inner shell holding the pyramids) ---- */}
      <PartGroup id="medulla" position={explodeOffset([-0.35, 0, 0], explode)} onSelect={onSelect}>
        <mesh geometry={medullaBack}>{shellMat('#a16207', 0.35, 'medulla')}</mesh>
        {!cutaway && <mesh geometry={medullaFront}>{shellMat('#a16207', 0.35, 'medulla')}</mesh>}
        {showLabels && <PartLabel position={[-0.55, 1.35, 0.3]} name="Medulla" />}
      </PartGroup>

      {/* ---- Renal pyramids: striated cones, apexes draining toward the pelvis ---- */}
      {PYRAMIDS.map((p, i) => (
        <PartGroup
          key={i}
          id="renal-pyramid"
          position={explodeOffset([-0.2, p.y * 0.6, 0], explode)}
          onSelect={onSelect}
        >
          <mesh position={[PYR_X, p.y, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[PYR_R, PYR_LEN, 28]} />
            <meshStandardMaterial color="#c2703d" roughness={0.55} metalness={0.03} {...emissiveProps(sel('renal-pyramid'))} />
          </mesh>
          {/* striation hints: thin rings around each cone */}
          {[-0.22, 0.02, 0.26].map((dx, j) => {
            const rr = PYR_R * (0.5 - dx / PYR_LEN);
            return (
              <mesh key={j} position={[PYR_X + dx, p.y, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[Math.max(0.03, rr), 0.014, 8, 28]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.6} metalness={0.02} {...emissiveProps(sel('renal-pyramid'))} />
              </mesh>
            );
          })}
          {showLabels && i === 2 && <PartLabel position={[-0.12, -1.35, 0.3]} name="Renal pyramid" />}
        </PartGroup>
      ))}

      {/* ---- Minor calyces: cups collecting urine from each pyramid apex ---- */}
      <PartGroup id="calyx" position={explodeOffset([0.75, 0.25, 0], explode)} onSelect={onSelect}>
        {PYRAMIDS.map((p, i) => (
          <mesh
            key={i}
            position={[PYR_X + PYR_LEN / 2 + 0.08, p.y, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <coneGeometry args={[0.2, 0.3, 18, 1, true]} />
            <meshStandardMaterial
              color="#fde68a"
              roughness={0.5}
              metalness={0.03}
              side={THREE.DoubleSide}
              {...emissiveProps(sel('calyx'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.95, 0.95, 0.2]} name="Calyx" />}
      </PartGroup>

      {/* ---- Renal pelvis: funnel feeding the ureter ---- */}
      <PartGroup id="renal-pelvis" position={explodeOffset([0.85, -0.3, 0], explode)} onSelect={onSelect}>
        <mesh position={[0.32, -0.32, 0]} rotation={[0, 0, Math.PI]} scale={[1, 1, 0.7]}>
          <coneGeometry args={[0.42, 0.62, 24, 1, true]} />
          <meshStandardMaterial
            color="#fde68a"
            roughness={0.5}
            metalness={0.03}
            side={THREE.DoubleSide}
            {...emissiveProps(sel('renal-pelvis'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[1.05, -0.55, 0.2]} name="Renal pelvis" />}
      </PartGroup>

      {/* ---- Ureter stump ---- */}
      <PartGroup id="ureter" position={explodeOffset([0.25, -1.2, 0], explode)} onSelect={onSelect}>
        <mesh geometry={ureterGeo}>
          <meshStandardMaterial color="#e8a37c" roughness={0.5} metalness={0.04} {...emissiveProps(sel('ureter'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.0, -2.15, 0]} name="Ureter" />}
      </PartGroup>

      {/* ---- Renal artery & vein at the hilum ---- */}
      <PartGroup id="renal-artery" position={explodeOffset([1.2, 0.35, 0], explode)} onSelect={onSelect}>
        <mesh geometry={arteryGeo}>
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('renal-artery'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.1, 1.0, 0.12]} name="Renal artery" />}
      </PartGroup>
      <PartGroup id="renal-vein" position={explodeOffset([1.2, -0.25, 0], explode)} onSelect={onSelect}>
        <mesh geometry={veinGeo}>
          <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.08} {...emissiveProps(sel('renal-vein'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.1, -0.55, -0.12]} name="Renal vein" />}
      </PartGroup>
    </group>
  );
}
