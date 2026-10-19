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

function BoneMat({ selected }: { selected: boolean }): JSX.Element {
  const em = emissiveProps(selected);
  return <meshStandardMaterial color={BONE} roughness={0.6} metalness={0.02} {...em} />;
}

/** Clavicle: gentle S-curve from sternum (medial) to shoulder (lateral). */
function useClavicleCurve(): THREE.CatmullRomCurve3 {
  return useMemo(() => {
    const pts: [number, number, number][] = [
      [0.15, 2.8, 0.3],
      [0.55, 2.9, 0.32],
      [0.95, 2.72, 0.18],
      [1.5, 2.78, 0.02],
    ];
    return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  }, []);
}

/** Scapula: flat triangular blade (extruded), lying behind the shoulder. */
function useScapulaGeo(): THREE.ExtrudeGeometry {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.35, -0.1);
    s.lineTo(0.55, -1.45);
    s.lineTo(0.12, -0.5);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false });
  }, []);
}

const CARPAL_XS = [1.48, 1.58, 1.68, 1.78];
const FINGER_XS = [1.44, 1.55, 1.66, 1.77, 1.88];

export default function PectoralGirdle(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  const clavicleCurve = useClavicleCurve();
  const scapulaGeo = useScapulaGeo();

  return (
    <group>
      {/* ---- Clavicle (collarbone) ---- */}
      <PartGroup id="clavicle" position={explodeOffset([0, 0.9, 0.4], explode)} onSelect={onSelect}>
        <mesh>
          <tubeGeometry args={[clavicleCurve, 32, 0.085, 12, false]} />
          <BoneMat selected={sel('clavicle')} />
        </mesh>
        {/* sternal + acromial end knobs */}
        <mesh position={[0.15, 2.8, 0.3]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <BoneMat selected={sel('clavicle')} />
        </mesh>
        <mesh position={[1.5, 2.78, 0.02]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <BoneMat selected={sel('clavicle')} />
        </mesh>
        {showLabels && <PartLabel position={[0.7, 3.35, 0.3]} name="Clavicle" />}
      </PartGroup>

      {/* ---- Scapula (shoulder blade) ---- */}
      <PartGroup id="scapula" position={explodeOffset([-0.3, 0.3, -0.9], explode)} onSelect={onSelect}>
        <group position={[0.7, 2.75, -0.4]} rotation={[0.1, -0.25, 0.05]}>
          <mesh geometry={scapulaGeo}>
            <BoneMat selected={sel('scapula')} />
          </mesh>
          {/* scapular spine on the back face */}
          <mesh position={[0.65, -0.45, -0.06]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[1.1, 0.09, 0.08]} />
            <BoneMat selected={sel('scapula')} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[-0.35, 1.9, -0.5]} name="Scapula" />}
      </PartGroup>

      {/* ---- Humerus (upper arm) ---- */}
      <PartGroup id="humerus" position={explodeOffset([0.7, -0.3, 0], explode)} onSelect={onSelect}>
        {/* head: ball fitting the shoulder */}
        <mesh position={[1.55, 2.62, 0]}>
          <sphereGeometry args={[0.21, 24, 18]} />
          <BoneMat selected={sel('humerus')} />
        </mesh>
        {/* shaft */}
        <mesh position={[1.58, 1.45, 0.02]} rotation={[0, 0, -0.015]}>
          <cylinderGeometry args={[0.12, 0.1, 2.3, 16]} />
          <BoneMat selected={sel('humerus')} />
        </mesh>
        {/* distal end (elbow side) */}
        <mesh position={[1.6, 0.32, 0.02]} scale={[1.4, 0.8, 1.1]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <BoneMat selected={sel('humerus')} />
        </mesh>
        {showLabels && <PartLabel position={[2.35, 1.6, 0.1]} name="Humerus" />}
      </PartGroup>

      {/* ---- Ulna (pinky-side forearm bone, elbow hook) ---- */}
      <PartGroup id="ulna" position={explodeOffset([0.25, -1.1, 0], explode)} onSelect={onSelect}>
        <mesh position={[1.52, 0.35, -0.02]}>
          <boxGeometry args={[0.15, 0.22, 0.15]} />
          <BoneMat selected={sel('ulna')} />
        </mesh>
        <mesh position={[1.52, -0.62, 0]}>
          <cylinderGeometry args={[0.1, 0.085, 1.85, 14]} />
          <BoneMat selected={sel('ulna')} />
        </mesh>
        {showLabels && <PartLabel position={[0.85, -0.7, 0]} name="Ulna" />}
      </PartGroup>

      {/* ---- Radius (thumb-side forearm bone) ---- */}
      <PartGroup id="radius" position={explodeOffset([0.55, -1.1, 0.15], explode)} onSelect={onSelect}>
        <mesh position={[1.72, -0.62, 0.04]}>
          <cylinderGeometry args={[0.085, 0.07, 1.85, 14]} />
          <BoneMat selected={sel('radius')} />
        </mesh>
        <mesh position={[1.72, -1.5, 0.04]} scale={[1.3, 0.7, 1.2]}>
          <sphereGeometry args={[0.09, 14, 10]} />
          <BoneMat selected={sel('radius')} />
        </mesh>
        {showLabels && <PartLabel position={[2.4, -0.7, 0.1]} name="Radius" />}
      </PartGroup>

      {/* ---- Carpals: 8 wrist bones, two rows of four ---- */}
      <PartGroup id="carpals" position={explodeOffset([0.1, -1.6, 0.25], explode)} onSelect={onSelect}>
        {[-1.62, -1.8].map((y, ri) =>
          CARPAL_XS.map((x, ci) => (
            <mesh key={`${ri}${ci}`} position={[x, y, (ri + ci) % 2 === 0 ? 0.02 : -0.02]} scale={[1, 0.85, 0.9]}>
              <sphereGeometry args={[0.085, 14, 10]} />
              <BoneMat selected={sel('carpals')} />
            </mesh>
          )),
        )}
        {showLabels && <PartLabel position={[0.9, -1.7, 0.15]} name="Carpals" />}
      </PartGroup>

      {/* ---- Metacarpals: palm bones ---- */}
      <PartGroup id="metacarpals" position={explodeOffset([0.1, -1.9, 0.3], explode)} onSelect={onSelect}>
        {FINGER_XS.map((x, i) => (
          <mesh key={i} position={[x, -2.18, 0.02]}>
            <cylinderGeometry args={[0.042, 0.038, 0.52, 10]} />
            <BoneMat selected={sel('metacarpals')} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[2.45, -2.15, 0.1]} name="Metacarpals" />}
      </PartGroup>

      {/* ---- Phalanges: finger bones (3 per finger) ---- */}
      <PartGroup id="phalanges" position={explodeOffset([0.1, -2.2, 0.35], explode)} onSelect={onSelect}>
        {FINGER_XS.map((x, i) => (
          <group key={i}>
            <mesh position={[x, -2.58, 0.02]}>
              <cylinderGeometry args={[0.036, 0.033, 0.26, 10]} />
              <BoneMat selected={sel('phalanges')} />
            </mesh>
            <mesh position={[x, -2.82, 0.02]}>
              <cylinderGeometry args={[0.032, 0.029, 0.2, 10]} />
              <BoneMat selected={sel('phalanges')} />
            </mesh>
            <mesh position={[x, -3.0, 0.02]}>
              <cylinderGeometry args={[0.028, 0.022, 0.15, 10]} />
              <BoneMat selected={sel('phalanges')} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[1.66, -3.45, 0.1]} name="Phalanges" />}
      </PartGroup>
    </group>
  );
}
