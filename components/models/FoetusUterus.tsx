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

const UTERUS_WALL: [number, number, number] = [0, 0, 0];
const PLACENTA_BASE: [number, number, number] = [-0.85, 0.55, -0.4];

/**
 * Foetus in the uterus (NCERT Fig 2.12). The foetus floats in the amniotic sac
 * (amniotic fluid), connected by the umbilical cord to the placenta embedded in
 * the uterine wall. Stylised clinical form — neutral medical presentation.
 */
export default function FoetusUterus(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const cordGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.62, 0.38, -0.28),
      new THREE.Vector3(-0.35, 0.15, -0.05),
      new THREE.Vector3(-0.1, 0.02, 0.22),
      new THREE.Vector3(0.08, 0.0, 0.38),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.07, 10, false);
  }, []);

  const cotyledons = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return [
          PLACENTA_BASE[0] + Math.cos(a) * 0.26,
          PLACENTA_BASE[1] + Math.sin(a) * 0.26,
          PLACENTA_BASE[2] + 0.12,
        ] as [number, number, number];
      }),
    []
  );

  const skin = { color: '#dcb08f', roughness: 0.6, metalness: 0 };

  return (
    <group>
      {/* ---- uterus wall ---- */}
      <PartGroup id="uterus" position={explodeOffset(UTERUS_WALL, explode)} onSelect={onSelect}>
        <mesh position={UTERUS_WALL} scale={[1.35 + explode * 0.3, 1.6 + explode * 0.35, 1.25 + explode * 0.3]}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshPhysicalMaterial
            color="#b76e79"
            transparent
            opacity={0.16}
            roughness={0.35}
            depthWrite={false}
            {...emissiveProps(sel('uterus'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, 2.35, 0]} name="Uterus wall" />}
      </PartGroup>

      {/* ---- amniotic sac ---- */}
      <PartGroup id="amniotic-sac" position={explodeOffset([0, 0, 0.2], explode)} onSelect={onSelect}>
        <mesh scale={1 + explode * 0.12}>
          <sphereGeometry args={[1.02, 48, 32]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transparent
            opacity={0.12}
            roughness={0.15}
            depthWrite={false}
            {...emissiveProps(sel('amniotic-sac'))}
          />
        </mesh>
        {/* amniotic fluid tint */}
        <mesh scale={0.96}>
          <sphereGeometry args={[1.0, 32, 24]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.08} roughness={0.4} depthWrite={false} />
        </mesh>
        {showLabels && <PartLabel position={[-1.45, -1.2, 0]} name="Amniotic sac" />}
      </PartGroup>

      {/* ---- foetus (stylised clinical form) ---- */}
      <PartGroup id="foetus" position={explodeOffset([0, 0, 0.35], explode)} onSelect={onSelect}>
        <group>
          {/* head */}
          <mesh position={[-0.28, 0.52, 0.12]}>
            <sphereGeometry args={[0.32, 32, 24]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
          {/* torso */}
          <mesh position={[0.02, 0.02, 0.1]} rotation={[0, 0, 0.55]}>
            <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
          {/* upper arm + forearm */}
          <mesh position={[-0.32, 0.18, 0.28]} rotation={[0.5, 0, 0.9]}>
            <capsuleGeometry args={[0.085, 0.3, 8, 12]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
          <mesh position={[-0.12, 0.02, 0.36]} rotation={[0.9, 0, -0.5]}>
            <capsuleGeometry args={[0.07, 0.26, 8, 12]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
          {/* thigh + shin, curled */}
          <mesh position={[0.28, -0.28, 0.2]} rotation={[0.3, 0, -1.1]}>
            <capsuleGeometry args={[0.105, 0.34, 8, 12]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
          <mesh position={[0.05, -0.42, 0.32]} rotation={[0.6, 0, 0.5]}>
            <capsuleGeometry args={[0.085, 0.3, 8, 12]} />
            <meshStandardMaterial {...skin} {...emissiveProps(sel('foetus'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[0.75, 0.85, 0.35]} name="Foetus" />}
      </PartGroup>

      {/* ---- placenta ---- */}
      <PartGroup id="placenta" position={explodeOffset(PLACENTA_BASE, explode)} onSelect={onSelect}>
        <mesh position={PLACENTA_BASE} rotation={[0.5, 0.3, 0]}>
          <cylinderGeometry args={[0.46, 0.42, 0.18, 28]} />
          <meshStandardMaterial color="#b5546d" roughness={0.55} {...emissiveProps(sel('placenta'))} />
        </mesh>
        {cotyledons.map((c, i) => (
          <mesh key={i} position={c}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshStandardMaterial color="#9c4257" roughness={0.55} {...emissiveProps(sel('placenta'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.6, 0.95, -0.4]} name="Placenta" />}
      </PartGroup>

      {/* ---- umbilical cord ---- */}
      <PartGroup id="umbilical-cord" position={explodeOffset([-0.3, 0.15, 0.1], explode)} onSelect={onSelect}>
        <mesh geometry={cordGeo}>
          <meshStandardMaterial color="#e8a0a8" roughness={0.5} {...emissiveProps(sel('umbilical-cord'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.35, -0.35, 0.45]} name="Umbilical cord" />}
      </PartGroup>
    </group>
  );
}
