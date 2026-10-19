'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Double fertilisation timeline (seconds, total 40):
   tube-discharge 0–8, syngamy 8–16, triple-fusion 14–24 (overlaps),
   endosperm 24–32, embryo 32–40 (globular → heart) */

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.45 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function StageLabel({ name }: { name: string }): JSX.Element {
  return (
    <Html position={[0, 2.7, 0]} center zIndexRange={[40, 0]} className="bv-label">
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

const STAGE_IDS = ['tube-discharge', 'syngamy', 'triple-fusion', 'endosperm', 'embryo'];
const STAGE_NAMES = [
  'Pollen tube discharges two male gametes',
  'Syngamy — gamete + egg → zygote',
  'Triple fusion — gamete + polar nuclei → PEN',
  'Primary endosperm nucleus divides',
  'Zygote → globular → heart embryo',
];

function stageIndex(t: number): number {
  if (t < 8) return 0;
  if (t < 14) return 1;
  if (t < 24) return 2;
  if (t < 32) return 3;
  return 4;
}

const EGG_POS: [number, number, number] = [0, -0.95, 0];
const POLAR_POS: [number, number, number][] = [
  [0, 0.22, 0],
  [0, -0.12, 0],
];

export default function DoubleFertilization(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;

  // Gamete 1: tube tip (0, 0.75) → egg. Gamete 2: → polar nuclei.
  const g1k = smooth((t - 8) / 8);
  const g1: [number, number, number] = [lerp(0, EGG_POS[0], g1k), lerp(0.75, EGG_POS[1], g1k), 0];
  const g2k = smooth((t - 14) / 8);
  const g2: [number, number, number] = [lerp(0.18, 0, g2k), lerp(0.75, 0.05, g2k), lerp(0, 0, g2k)];

  const syngamyDone = t >= 16;
  const tripleDone = t >= 22;
  // fusion flash intensity right after each fusion completes
  const flash1 = syngamyDone ? Math.max(0, 1 - (t - 16) / 3) : 0;
  const flash2 = tripleDone ? Math.max(0, 1 - (t - 22) / 3) : 0;

  // Endosperm nuclei: PEN divides → 8 free nuclei pop in staggered
  const endoNucs = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      const rr = 0.25 + rand(i * 11 + 3) * 0.25;
      arr.push([Math.cos(a) * rr, -0.1 + (rand(i * 11 + 5) - 0.35) * 0.8, Math.sin(a) * rr * 0.6]);
    }
    return arr;
  }, []);
  const endoCount = t >= 24 ? Math.min(8, Math.floor((t - 24) / 1) + 2) : 0;

  // Embryo: zygote → 2-celled → globular → heart
  const embK = smooth((t - 32) / 8);
  const heartK = smooth((t - 36) / 4);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(STAGE_IDS[si]);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <StageLabel name={STAGE_NAMES[si]} />

      {/* embryo-sac wall */}
      <mesh scale={[1, 1.45, 1]}>
        <sphereGeometry args={[0.75, 36, 36]} />
        <meshPhysicalMaterial color="#ddd6fe" transparent opacity={0.15} roughness={0.25} metalness={0} depthWrite={false} />
      </mesh>

      {/* pollen tube tip entering from above */}
      <PartGroup id="pollen-tube" position={[0, 0, 0]} onSelect={onSelect}>
        {t < 34 && (
          <group>
            <mesh position={[0, 1.15, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.8, 12]} />
              <meshStandardMaterial color="#fde047" roughness={0.45} metalness={0} {...emissiveProps(sel('pollen-tube'))} />
            </mesh>
            <mesh position={[0, 0.75, 0]}>
              <sphereGeometry args={[0.11, 14, 14]} />
              <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0} {...emissiveProps(sel('pollen-tube'))} />
            </mesh>
          </group>
        )}
      </PartGroup>

      {/* synergids (one degenerates as tube enters) */}
      <PartGroup id="synergid" position={[0, 0, 0]} onSelect={onSelect}>
        {[-0.32, 0.32].map((x, i) => (
          <mesh key={i} position={[x, -0.82, 0]} scale={i === 0 && t >= 6 ? 0.7 : 1}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#fbcfe8" transparent opacity={i === 0 && t >= 10 ? 0.35 : 0.95} roughness={0.45} metalness={0} {...emissiveProps(sel('synergid'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.05, -0.7, 0]} name="Synergids" />}
      </PartGroup>

      {/* egg → zygote */}
      <PartGroup id="egg" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={EGG_POS}>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial
            color={syngamyDone ? '#fb7185' : '#fda4af'}
            roughness={0.45}
            metalness={0}
            {...(flash1 > 0
              ? { emissive: '#fbbf24', emissiveIntensity: flash1 * 1.2 }
              : emissiveProps(sel('egg')))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.85, -1.05, 0]} name={syngamyDone ? 'Zygote (2n)' : 'Egg cell (n)'} />}
      </PartGroup>

      {/* male gametes */}
      {!syngamyDone || !tripleDone ? (
        <PartGroup id="male-gamete" position={[0, 0, 0]} onSelect={onSelect}>
          {!syngamyDone && (
            <mesh position={g1}>
              <sphereGeometry args={[0.09, 14, 14]} />
              <meshStandardMaterial color="#f43f5e" roughness={0.4} metalness={0.05} {...emissiveProps(sel('male-gamete'))} />
            </mesh>
          )}
          {!tripleDone && (
            <mesh position={g2}>
              <sphereGeometry args={[0.09, 14, 14]} />
              <meshStandardMaterial color="#f43f5e" roughness={0.4} metalness={0.05} {...emissiveProps(sel('male-gamete'))} />
            </mesh>
          )}
          {showLabels && si < 2 && <PartLabel position={[0.85, 0.75, 0]} name="Male gametes" />}
        </PartGroup>
      ) : null}

      {/* polar nuclei → primary endosperm nucleus */}
      <PartGroup id="polar-nuclei" position={[0, 0, 0]} onSelect={onSelect}>
        {!tripleDone ? (
          POLAR_POS.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.05} {...emissiveProps(sel('polar-nuclei'))} />
            </mesh>
          ))
        ) : (
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.15, 18, 18]} />
            <meshStandardMaterial
              color="#7c3aed"
              roughness={0.4}
              metalness={0.05}
              {...(flash2 > 0
                ? { emissive: '#fbbf24', emissiveIntensity: flash2 * 1.2 }
                : emissiveProps(sel('polar-nuclei')))}
            />
          </mesh>
        )}
        {showLabels && <PartLabel position={[0.95, 0.25, 0]} name={tripleDone ? 'Primary endosperm nucleus (3n)' : 'Polar nuclei'} />}
      </PartGroup>

      {/* endosperm: free-nuclear divisions */}
      {endoCount > 0 && (
        <PartGroup id="endosperm" position={[0, 0, 0]} onSelect={onSelect}>
          {endoNucs.slice(0, endoCount).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshStandardMaterial color="#c4b5fd" roughness={0.4} metalness={0.05} {...emissiveProps(sel('endosperm'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[-0.95, 0.35, 0]} name="Endosperm nuclei" />}
        </PartGroup>
      )}

      {/* antipodals */}
      <PartGroup id="antipodal" position={[0, 0, 0]} onSelect={onSelect}>
        {[-0.22, 0, 0.22].map((x, i) => (
          <mesh key={i} position={[x, 1.0, 0]}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshStandardMaterial color="#c4b5fd" roughness={0.45} metalness={0} {...emissiveProps(sel('antipodal'))} />
          </mesh>
        ))}
      </PartGroup>

      {/* early dicot embryo at the micropylar end */}
      {t >= 32 && (
        <PartGroup id="embryo" position={[0, 0, 0]} onSelect={onSelect}>
          {/* suspensor */}
          <mesh position={[0, lerp(-1.35, -1.32, embK), 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.35, 10]} />
            <meshStandardMaterial color="#a3e635" roughness={0.5} metalness={0} {...emissiveProps(sel('embryo'))} />
          </mesh>
          {/* embryo proper: globular → heart */}
          <group position={[0, -1.02, 0]} scale={0.4 + 0.6 * embK}>
            <mesh scale={[1, 0.92 - heartK * 0.1, 0.9]}>
              <sphereGeometry args={[0.24, 24, 24]} />
              <meshStandardMaterial color="#4ade80" roughness={0.45} metalness={0.05} {...emissiveProps(sel('embryo'))} />
            </mesh>
            {/* heart lobes (cotyledon primordia) */}
            {[-1, 1].map((s, i) => (
              <mesh key={i} position={[s * 0.12, 0.19, 0]} scale={Math.max(0.01, heartK)}>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial color="#4ade80" roughness={0.45} metalness={0.05} {...emissiveProps(sel('embryo'))} />
              </mesh>
            ))}
          </group>
          {showLabels && <PartLabel position={[0.95, -1.35, 0]} name={heartK > 0.5 ? 'Heart-stage embryo' : 'Globular embryo'} />}
        </PartGroup>
      )}
    </group>
  );
}
