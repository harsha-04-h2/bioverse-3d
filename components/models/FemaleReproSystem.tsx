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

const OVARY_L: [number, number, number] = [-2.6, 0.45, 0];
const OVARY_R: [number, number, number] = [2.6, 0.45, 0];
const MYOMETRIUM: [number, number, number] = [0, 0.4, 0];
const ENDOMETRIUM: [number, number, number] = [0, 0.45, 0.16];
const CERVIX: [number, number, number] = [0, -1.05, 0];
const VAGINA: [number, number, number] = [0, -2.05, 0];

/**
 * Female reproductive system — frontal section (NCERT Fig 2.3).
 * Paired ovaries feed ova toward the fimbriated ends of the fallopian tubes;
 * the uterus sits midline with its endometrial lining, narrowing to the cervix
 * and opening into the vagina.
 */
export default function FemaleReproSystem(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const tubeGeoL = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 1.4, 0),
      new THREE.Vector3(-1.5, 1.55, 0),
      new THREE.Vector3(-2.1, 1.3, 0),
      new THREE.Vector3(-2.35, 1.0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.12, 10, false);
  }, []);
  const tubeGeoR = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.7, 1.4, 0),
      new THREE.Vector3(1.5, 1.55, 0),
      new THREE.Vector3(2.1, 1.3, 0),
      new THREE.Vector3(2.35, 1.0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.12, 10, false);
  }, []);

  const fimbriae = useMemo(() => {
    const out: { side: 1 | -1; pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (const side of [-1, 1] as const) {
      for (let i = 0; i < 5; i++) {
        const a = 0.4 + i * 0.32;
        out.push({
          side,
          pos: [side * (2.35 + Math.cos(a + Math.PI / 2) * 0.3), 1.0 - Math.sin(a) * 0.3 + 0.05, (rand(i * 7 + side * 3) - 0.5) * 0.25],
          rot: [0, 0, side * (a + 0.6)],
        });
      }
    }
    return out;
  }, []);

  const tubeMat = (id: string) => (
    <meshStandardMaterial color="#c98f8a" roughness={0.5} metalness={0.02} {...emissiveProps(sel(id))} />
  );

  return (
    <group>
      {/* ---- fallopian tubes ---- */}
      {(
        [
          { id: 'fallopian-tube', geo: tubeGeoL, labelPos: [-1.7, 2.0, 0] as [number, number, number] },
          { id: 'fallopian-tube', geo: tubeGeoR, labelPos: [1.7, 2.0, 0] as [number, number, number] },
        ] as const
      ).map((t, i) => (
        <PartGroup key={i} id={t.id} position={explodeOffset([i === 0 ? -1.6 : 1.6, 1.4, 0], explode)} onSelect={onSelect}>
          <mesh geometry={t.geo}>{tubeMat(t.id)}</mesh>
          {showLabels && i === 0 && <PartLabel position={t.labelPos} name="Fallopian tube" />}
        </PartGroup>
      ))}

      {/* ---- fimbriae ---- */}
      <PartGroup id="fimbriae" position={explodeOffset([0, 1.0, 0.4], explode)} onSelect={onSelect}>
        {fimbriae.map((f, i) => (
          <mesh key={i} position={f.pos} rotation={f.rot}>
            <coneGeometry args={[0.07, 0.38, 10]} />
            <meshStandardMaterial color="#b87873" roughness={0.5} metalness={0.02} {...emissiveProps(sel('fimbriae'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[2.75, 0.55, 0]} name="Fimbriae" />}
      </PartGroup>

      {/* ---- ovaries ---- */}
      {(
        [
          { base: OVARY_L, label: 'Ovary', labelPos: [-3.15, 0.45, 0] as [number, number, number] },
          { base: OVARY_R, label: '', labelPos: [0, 0, 0] as [number, number, number] },
        ] as const
      ).map((o, i) => (
        <PartGroup key={i} id="ovary" position={explodeOffset(o.base, explode)} onSelect={onSelect}>
          <mesh position={o.base} scale={[0.42, 0.55, 0.38]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color="#e3a6a1" roughness={0.5} metalness={0.02} {...emissiveProps(sel('ovary'))} />
          </mesh>
          {/* follicle hints */}
          {Array.from({ length: 4 }, (_, j) => (
            <mesh
              key={j}
              position={[
                o.base[0] + (rand(i * 31 + j * 5) - 0.5) * 0.4,
                o.base[1] + (rand(i * 31 + j * 5 + 2) - 0.5) * 0.5,
                o.base[2] + 0.3,
              ]}
            >
              <sphereGeometry args={[0.06 + rand(i * 17 + j) * 0.05, 12, 10]} />
              <meshStandardMaterial color="#f5d0cb" roughness={0.5} {...emissiveProps(sel('ovary'))} />
            </mesh>
          ))}
          {showLabels && o.label && <PartLabel position={o.labelPos} name={o.label} />}
        </PartGroup>
      ))}

      {/* ---- myometrium (uterus body) ---- */}
      <PartGroup id="myometrium" position={explodeOffset(MYOMETRIUM, explode)} onSelect={onSelect}>
        <mesh position={MYOMETRIUM} scale={[1.0, 1.25, 0.7]}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial color="#b76e79" roughness={0.5} metalness={0.02} {...emissiveProps(sel('myometrium'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.35, 0.4, 0]} name="Myometrium" />}
      </PartGroup>

      {/* ---- endometrium ---- */}
      <PartGroup id="endometrium" position={explodeOffset(ENDOMETRIUM, explode)} onSelect={onSelect}>
        <mesh position={ENDOMETRIUM} scale={[0.55, 0.82, 0.5]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            color="#f2a7bb"
            transparent
            opacity={0.85}
            roughness={0.5}
            metalness={0.02}
            {...emissiveProps(sel('endometrium'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[1.0, 1.35, 0.16]} name="Endometrium" />}
      </PartGroup>

      {/* ---- cervix ---- */}
      <PartGroup id="cervix" position={explodeOffset(CERVIX, explode)} onSelect={onSelect}>
        <mesh position={CERVIX}>
          <cylinderGeometry args={[0.3, 0.34, 0.7, 24]} />
          <meshStandardMaterial color="#a85868" roughness={0.5} metalness={0.02} {...emissiveProps(sel('cervix'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.95, -1.05, 0]} name="Cervix" />}
      </PartGroup>

      {/* ---- vagina ---- */}
      <PartGroup id="vagina" position={explodeOffset(VAGINA, explode)} onSelect={onSelect}>
        <mesh position={VAGINA} scale={[1, 1, 0.65]}>
          <cylinderGeometry args={[0.4, 0.44, 1.3, 24]} />
          <meshStandardMaterial color="#c48a94" roughness={0.55} metalness={0.02} {...emissiveProps(sel('vagina'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.95, -2.05, 0]} name="Vagina" />}
      </PartGroup>
    </group>
  );
}
