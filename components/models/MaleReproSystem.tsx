'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

function emissiveProps(selected: boolean) {
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

const TESTIS: [number, number, number] = [0, -1.15, -0.55];
const EPIDIDYMIS: [number, number, number] = [0, -0.95, -0.55];
const SCROTUM: [number, number, number] = [0, -1.2, -0.55];
const SEMINAL: [number, number, number] = [0.05, 1.25, -0.6];
const PROSTATE: [number, number, number] = [0, 0.15, -0.1];
const BULBO: [number, number, number] = [0, -0.52, -0.02];
const PENIS: [number, number, number] = [0, -0.32, 1.1];

/**
 * Male reproductive system — sagittal section (NCERT Fig 2.1).
 * Anterior = +z. The vas deferens loops up from the epididymis and back down
 * behind the bladder; the urethra runs from the bladder neck through the
 * prostate and along the penis.
 */
export default function MaleReproSystem(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const vasDeferensGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, -1.1, -0.95),
      new THREE.Vector3(0.2, -0.35, -1.08),
      new THREE.Vector3(0.2, 0.55, -0.95),
      new THREE.Vector3(0.18, 1.05, -0.7),
      new THREE.Vector3(0.15, 0.85, -0.35),
      new THREE.Vector3(0.12, 0.4, -0.22),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.07, 10, false);
  }, []);

  const ejaculatoryGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 1.1, -0.55),
      new THREE.Vector3(0.06, 0.6, -0.3),
      new THREE.Vector3(0.04, 0.25, -0.14),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.05, 8, false);
  }, []);

  const urethraGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.3, 0.18),
      new THREE.Vector3(0, 0.7, 0.0),
      new THREE.Vector3(0, 0.15, -0.1),
      new THREE.Vector3(0, -0.35, -0.02),
      new THREE.Vector3(0, -0.33, 0.6),
      new THREE.Vector3(0, -0.3, 1.35),
      new THREE.Vector3(0, -0.28, 1.9),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.085, 10, false);
  }, []);

  return (
    <group>
      {/* ---- urinary bladder (anatomical context, not clickable) ---- */}
      <mesh position={[0, 2.0, 0.3]}>
        <sphereGeometry args={[0.9, 32, 24]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.28} roughness={0.5} depthWrite={false} />
      </mesh>

      {/* ---- testis ---- */}
      <PartGroup id="testis" position={explodeOffset(TESTIS, explode)} onSelect={onSelect}>
        <mesh position={TESTIS} scale={[0.55, 0.7, 0.55]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color="#e5b8a8" roughness={0.5} metalness={0.02} {...emissiveProps(sel('testis'))} />
        </mesh>
        {/* seminiferous-tubule texture hint */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            position={[TESTIS[0] + (rand(i * 5 + 1) - 0.5) * 0.5, TESTIS[1] + (rand(i * 5 + 2) - 0.5) * 0.6, TESTIS[2] + 0.42]}
          >
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#c98f7a" roughness={0.6} {...emissiveProps(sel('testis'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0, -1.15, 0.35]} name="Testis" />}
      </PartGroup>

      {/* ---- epididymis ---- */}
      <PartGroup id="epididymis" position={explodeOffset(EPIDIDYMIS, explode)} onSelect={onSelect}>
        <mesh position={EPIDIDYMIS} rotation={[0.5, 0, 0.4]}>
          <torusGeometry args={[0.55, 0.13, 12, 32, 4.4]} />
          <meshStandardMaterial color="#d97b62" roughness={0.5} metalness={0.02} {...emissiveProps(sel('epididymis'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, -0.55, -0.55]} name="Epididymis" />}
      </PartGroup>

      {/* ---- scrotum ---- */}
      <PartGroup id="scrotum" position={explodeOffset(SCROTUM, explode)} onSelect={onSelect}>
        <mesh position={SCROTUM} scale={[1, 1.15, 1]}>
          <sphereGeometry args={[0.88, 32, 24]} />
          <meshPhysicalMaterial
            color="#e5c1a8"
            transparent
            opacity={0.22}
            roughness={0.4}
            depthWrite={false}
            {...emissiveProps(sel('scrotum'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.95, -1.6, -0.55]} name="Scrotum" />}
      </PartGroup>

      {/* ---- vas deferens ---- */}
      <PartGroup id="vas-deferens" position={explodeOffset([0.2, 0.2, -0.8], explode)} onSelect={onSelect}>
        <mesh geometry={vasDeferensGeo}>
          <meshStandardMaterial color="#c9a27e" roughness={0.5} metalness={0.02} {...emissiveProps(sel('vas-deferens'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.05, 0.55, -0.95]} name="Vas deferens" />}
      </PartGroup>

      {/* ---- seminal vesicle ---- */}
      <PartGroup id="seminal-vesicle" position={explodeOffset(SEMINAL, explode)} onSelect={onSelect}>
        <mesh position={SEMINAL} rotation={[0.3, 0, 0.15]}>
          <capsuleGeometry args={[0.16, 0.45, 8, 16]} />
          <meshStandardMaterial color="#d4a373" roughness={0.5} metalness={0.02} {...emissiveProps(sel('seminal-vesicle'))} />
        </mesh>
        <mesh geometry={ejaculatoryGeo}>
          <meshStandardMaterial color="#c9a27e" roughness={0.5} metalness={0.02} {...emissiveProps(sel('seminal-vesicle'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.9, 1.45, -0.6]} name="Seminal vesicle" />}
      </PartGroup>

      {/* ---- prostate ---- */}
      <PartGroup id="prostate" position={explodeOffset(PROSTATE, explode)} onSelect={onSelect}>
        <mesh position={PROSTATE} scale={[1, 0.85, 1]}>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshStandardMaterial color="#b5838d" roughness={0.5} metalness={0.02} {...emissiveProps(sel('prostate'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.95, 0.15, -0.1]} name="Prostate" />}
      </PartGroup>

      {/* ---- bulbourethral gland ---- */}
      <PartGroup id="bulbourethral-gland" position={explodeOffset(BULBO, explode)} onSelect={onSelect}>
        <mesh position={BULBO}>
          <sphereGeometry args={[0.15, 24, 18]} />
          <meshStandardMaterial color="#a06a75" roughness={0.5} metalness={0.02} {...emissiveProps(sel('bulbourethral-gland'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, -0.52, -0.02]} name="Bulbourethral gland" />}
      </PartGroup>

      {/* ---- penis ---- */}
      <PartGroup id="penis" position={explodeOffset(PENIS, explode)} onSelect={onSelect}>
        <mesh position={PENIS} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.32, 1.7, 24]} />
          <meshStandardMaterial color="#e0b49b" roughness={0.55} metalness={0.02} {...emissiveProps(sel('penis'))} />
        </mesh>
        <mesh position={[0, -0.3, 2.0]} scale={[1, 1, 0.85]}>
          <sphereGeometry args={[0.33, 24, 18]} />
          <meshStandardMaterial color="#d69e86" roughness={0.55} metalness={0.02} {...emissiveProps(sel('penis'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, 0.45, 1.6]} name="Penis" />}
      </PartGroup>

      {/* ---- urethra ---- */}
      <PartGroup id="urethra" position={explodeOffset([0, 0.6, 0.5], explode)} onSelect={onSelect}>
        <mesh geometry={urethraGeo}>
          <meshStandardMaterial color="#f4a259" roughness={0.45} metalness={0.05} {...emissiveProps(sel('urethra'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.85, -0.33, 1.1]} name="Urethra" />}
      </PartGroup>
    </group>
  );
}
