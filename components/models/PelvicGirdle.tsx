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
const CAVITY = '#2b2b30';

function BoneMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={BONE} roughness={0.6} metalness={0.02} {...em} />;
}

/** One full leg, mirrored by `side` (+1 right, -1 left). */
function Femur({ side, selected }: { side: 1 | -1; selected: boolean }): JSX.Element {
  const kx = side * 0.6; // knee x
  return (
    <group>
      {/* head: ball fitting the hip socket */}
      <mesh position={[side * 0.98, 1.9, 0.22]}>
        <sphereGeometry args={[0.2, 24, 18]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* neck */}
      <mesh position={[side * 0.9, 1.78, 0.18]} rotation={[0, 0, side * 0.7]}>
        <cylinderGeometry args={[0.09, 0.1, 0.35, 12]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* shaft, angled slightly inward toward the knee */}
      <mesh position={[side * 0.725, 0.4, 0.125]} rotation={[0, 0, -side * 0.1]}>
        <cylinderGeometry args={[0.155, 0.135, 2.45, 16]} />
        <BoneMat selected={selected} />
      </mesh>
      {/* condyles: twin knobs at the knee */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[kx + 0.13 * s, -0.88, 0.1]}>
          <sphereGeometry args={[0.15, 18, 14]} />
          <BoneMat selected={selected} />
        </mesh>
      ))}
    </group>
  );
}

const TOE_XS = [-0.22, -0.11, 0, 0.11, 0.22];

export default function PelvicGirdle(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  /** Tarsal clusters + metatarsal/toe tubes, mirrored per side. */
  const feet = useMemo(
    () =>
      ([1, -1] as const).map((side) => {
        const ax = side * 0.62;
        const tarsals: [number, number, number][] = [
          [ax - 0.1, -3.12, 0.18],
          [ax + 0.08, -3.14, 0.15],
          [ax - 0.02, -3.2, 0.32],
          [ax + 0.14, -3.22, 0.34],
          [ax - 0.14, -3.26, 0.42],
          [ax + 0.04, -3.28, 0.44],
        ];
        const rays = TOE_XS.map((dx) => {
          const x = ax + dx;
          return new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, -3.24, 0.4),
            new THREE.Vector3(x, -3.3, 0.75),
            new THREE.Vector3(x, -3.36, 1.15),
          ]);
        });
        const toes = TOE_XS.map((dx) => {
          const x = ax + dx;
          return new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, -3.36, 1.15),
            new THREE.Vector3(x, -3.4, 1.32),
            new THREE.Vector3(x, -3.42, 1.46),
          ]);
        });
        return { side, tarsals, rays, toes };
      }),
    [],
  );

  return (
    <group>
      {/* ---- Sacrum: fused wedge between the hip bones ---- */}
      <PartGroup id="sacrum" position={explodeOffset([0, 1, -0.4], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.3, -0.1]} rotation={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.3, 1.1, 20]} />
          <BoneMat selected={sel('sacrum')} />
        </mesh>
        {showLabels && <PartLabel position={[-1.35, 2.6, -0.1]} name="Sacrum" />}
      </PartGroup>

      {/* ---- Ilium: flared hip-bone wings ---- */}
      <PartGroup id="ilium" position={explodeOffset([0.9, 0.3, 0], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <group key={side} position={explodeOffset([side, 0, 0], explode)}>
            {/* wing */}
            <mesh position={[side * 1.05, 2.8, -0.2]} scale={[0.95, 1.1, 0.32]}>
              <sphereGeometry args={[0.85, 28, 20]} />
              <BoneMat selected={sel('ilium')} />
            </mesh>
            {/* iliac crest rim */}
            <mesh position={[side * 1.05, 2.85, -0.2]} rotation={[0, 0, side > 0 ? -0.15 : Math.PI + 0.15]}>
              <torusGeometry args={[0.78, 0.085, 10, 32, Math.PI]} />
              <BoneMat selected={sel('ilium')} />
            </mesh>
            {/* body tapering down to the socket */}
            <mesh position={[side * 0.95, 2.1, 0]} rotation={[0, 0, side * 0.12]}>
              <cylinderGeometry args={[0.3, 0.24, 0.95, 16]} />
              <BoneMat selected={sel('ilium')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[2.35, 3.65, -0.2]} name="Ilium" />}
      </PartGroup>

      {/* ---- Acetabulum: dark hip sockets ---- */}
      <PartGroup id="acetabulum" position={explodeOffset([0.9, 0, 0.4], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <group key={side} position={explodeOffset([side, 0, 0], explode)}>
            <mesh
              position={[side * 1.0, 1.85, 0.24]}
              rotation={[Math.PI / 2.4, 0, side * -0.5]}
            >
              <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color={CAVITY}
                roughness={0.9}
                metalness={0}
                {...emissiveProps(sel('acetabulum'))}
              />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[2.05, 1.8, 0.6]} name="Acetabulum" />}
      </PartGroup>

      {/* ---- Femur (both) ---- */}
      <PartGroup id="femur" position={explodeOffset([0.3, -1, 0], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <group key={side} position={explodeOffset([side * 0.4, 0, 0], explode)}>
            <Femur side={side} selected={sel('femur')} />
          </group>
        ))}
        {showLabels && <PartLabel position={[1.85, 0.4, 0.2]} name="Femur" />}
      </PartGroup>

      {/* ---- Patella (both) ---- */}
      <PartGroup id="patella" position={explodeOffset([0, -0.5, 1], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <mesh key={side} position={[side * 0.6, -0.72, 0.38]} scale={[1, 1.15, 0.55]}>
            <sphereGeometry args={[0.16, 20, 16]} />
            <BoneMat selected={sel('patella')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.35, -0.7, 0.55]} name="Patella" />}
      </PartGroup>

      {/* ---- Tibia (both) ---- */}
      <PartGroup id="tibia" position={explodeOffset([0.2, -1.4, 0], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <group key={side} position={explodeOffset([side * 0.3, 0, 0], explode)}>
            <mesh position={[side * 0.62, -1.95, 0.12]}>
              <cylinderGeometry args={[0.15, 0.11, 2.1, 16]} />
              <BoneMat selected={sel('tibia')} />
            </mesh>
            <mesh position={[side * 0.62, -0.98, 0.12]} scale={[1.25, 0.8, 1.15]}>
              <sphereGeometry args={[0.15, 16, 12]} />
              <BoneMat selected={sel('tibia')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[1.6, -2.0, 0.2]} name="Tibia" />}
      </PartGroup>

      {/* ---- Fibula (both) ---- */}
      <PartGroup id="fibula" position={explodeOffset([0.6, -1.2, 0], explode)} onSelect={onSelect}>
        {([1, -1] as const).map((side) => (
          <group key={side} position={explodeOffset([side, 0, 0], explode)}>
            <mesh position={[side * 0.82, -1.95, 0.08]}>
              <cylinderGeometry args={[0.05, 0.04, 1.9, 10]} />
              <BoneMat selected={sel('fibula')} />
            </mesh>
            <mesh position={[side * 0.82, -1.05, 0.08]}>
              <sphereGeometry args={[0.07, 12, 10]} />
              <BoneMat selected={sel('fibula')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.75, -2.0, 0.2]} name="Fibula" />}
      </PartGroup>

      {/* ---- Tarsals: ankle-bone clusters ---- */}
      <PartGroup id="tarsals" position={explodeOffset([0, -1.8, 0.3], explode)} onSelect={onSelect}>
        {feet.map(({ side, tarsals }) => (
          <group key={side}>
            {tarsals.map((p, i) => (
              <mesh key={i} position={p} scale={[1, 0.85, 1.1]}>
                <sphereGeometry args={[0.11, 14, 10]} />
                <BoneMat selected={sel('tarsals')} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[1.65, -3.15, 0.4]} name="Tarsals" />}
      </PartGroup>

      {/* ---- Metatarsals + toe phalanges: forefoot rays ---- */}
      <PartGroup id="metatarsals" position={explodeOffset([0, -1.8, 0.8], explode)} onSelect={onSelect}>
        {feet.map(({ side, rays, toes }) => (
          <group key={side}>
            {rays.map((c, i) => (
              <mesh key={`m${i}`}>
                <tubeGeometry args={[c, 16, 0.05, 8, false]} />
                <BoneMat selected={sel('metatarsals')} />
              </mesh>
            ))}
            {toes.map((c, i) => (
              <mesh key={`t${i}`}>
                <tubeGeometry args={[c, 12, 0.038, 8, false]} />
                <BoneMat selected={sel('metatarsals')} />
              </mesh>
            ))}
          </group>
        ))}
        {showLabels && <PartLabel position={[0, -3.6, 1.25]} name="Metatarsals" />}
      </PartGroup>
    </group>
  );
}
