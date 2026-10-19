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

function SmallLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
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

const LOOP = 10;
const RAYS = 12;
const OUTER_R = 1.35;
const INNER_R = 0.8;
const CENTRE_R = 0.28;
const HEAD_Y = 0.42;
const TRAVEL = 1.6; // seconds for excitation to reach the centre
const FLASH_T = 2.4; // flash window ends here
const RISE_END = 4.2; // electron rise ends here

export default function Photosystem(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  // Per-ray local time: excitation travels antenna -> centre, flashes, then an electron rises.
  const rays = useMemo(() => {
    const out: { theta: number; lt: number; traveling: boolean; packetR: number; flash: number; rise: number; electronOp: number }[] = [];
    let flash = 0;
    for (let i = 0; i < RAYS; i++) {
      const theta = (i / RAYS) * Math.PI * 2;
      const lt = (t + (i * LOOP) / RAYS) % LOOP;
      const traveling = lt < TRAVEL;
      const packetR = OUTER_R - ((OUTER_R - CENTRE_R) * Math.min(lt, TRAVEL)) / TRAVEL;
      const f = lt >= TRAVEL && lt < FLASH_T ? Math.sin(((lt - TRAVEL) / (FLASH_T - TRAVEL)) * Math.PI) : 0;
      flash += f;
      const rise = lt >= FLASH_T && lt < RISE_END ? (lt - FLASH_T) / (RISE_END - FLASH_T) : -1;
      const electronOp = rise >= 0 ? 1 - rise * 0.85 : 0;
      out.push({ theta, lt, traveling, packetR, flash: f, rise, electronOp });
    }
    return { rays: out, flash: Math.min(1, flash) };
  }, [t]);

  // Inner-ring chlorophylls glow as a packet sweeps past them (packet crosses INNER_R at ~0.82 s).
  const innerGlow = useMemo(
    () =>
      Array.from({ length: 8 }, (_, k) => {
        const thetaK = (k / 8) * Math.PI * 2 + 0.2;
        let g = 0;
        for (const r of rays.rays) {
          if (r.lt < TRAVEL) {
            const when = Math.abs(r.lt - 0.82) < 0.16 ? 1 - Math.abs(r.lt - 0.82) / 0.16 : 0;
            const ang = Math.pow(Math.cos((r.theta - thetaK) / 2), 2);
            g = Math.max(g, when * ang);
          }
        }
        return 0.2 + 0.8 * g;
      }),
    [rays, t],
  );

  const outerHeads = useMemo(
    () =>
      Array.from({ length: RAYS }, (_, i) => {
        const theta = (i / RAYS) * Math.PI * 2;
        return { x: Math.cos(theta) * OUTER_R, z: Math.sin(theta) * OUTER_R, theta };
      }),
    [],
  );
  const innerHeads = useMemo(
    () =>
      Array.from({ length: 8 }, (_, k) => {
        const theta = (k / 8) * Math.PI * 2 + 0.2;
        return { x: Math.cos(theta) * INNER_R, z: Math.sin(theta) * INNER_R, theta };
      }),
    [],
  );

  const centreFlash = 0.25 + 1.1 * rays.flash;
  const acceptorGlow = rays.rays.some((r) => r.rise >= 0 && r.rise < 0.35) ? 1.1 : 0.2;

  return (
    <group>
      {/* ---- Thylakoid membrane slab ---- */}
      <PartGroup id="membrane" position={explodeOffset([0, -1.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.6, 0.5, 3.4]} />
          <meshStandardMaterial
            color="#15803d"
            transparent
            opacity={0.32}
            roughness={0.45}
            metalness={0.08}
            depthWrite={false}
            {...emissiveProps(sel('membrane'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[2.05, -0.45, 0.9]} name="Thylakoid membrane" />}
      </PartGroup>

      {/* ---- Antenna complex: two rings of chlorophylls ---- */}
      <PartGroup id="antenna-complex" position={explodeOffset([0, 1.1, 0], explode)} onSelect={onSelect}>
        {/* outer ring */}
        {outerHeads.map((h, i) => {
          const r = rays.rays[i];
          const glow = r.lt < FLASH_T ? 0.25 + 0.75 * Math.max(0, 1 - r.lt / 2.4) : 0.25;
          const head = (
            <group key={i} position={[h.x, HEAD_Y, h.z]}>
              <mesh>
                <sphereGeometry args={[0.11, 14, 12]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive={sel('chlorophyll') || sel('antenna-complex') ? '#38bdf8' : '#4ade80'}
                  emissiveIntensity={sel('chlorophyll') || sel('antenna-complex') ? 0.4 : glow}
                  roughness={0.35}
                  metalness={0.1}
                />
              </mesh>
              <mesh position={[h.x * 0.08, -0.18, h.z * 0.08]} rotation={[h.z * 0.25, 0, -h.x * 0.25]}>
                <cylinderGeometry args={[0.022, 0.022, 0.34, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.5} metalness={0.05} {...emissiveProps(sel('antenna-complex'))} />
              </mesh>
            </group>
          );
          return i === 0 ? (
            <PartGroup key={`c-${i}`} id="chlorophyll" position={[0, 0, 0]} onSelect={onSelect}>
              {head}
              {showLabels && <SmallLabel position={[h.x + 0.35, HEAD_Y + 0.35, h.z]} name="Chlorophyll" />}
            </PartGroup>
          ) : (
            <group key={`c-${i}`}>{head}</group>
          );
        })}
        {/* inner ring */}
        {innerHeads.map((h, k) => (
          <group key={k} position={[h.x, HEAD_Y, h.z]}>
            <mesh>
              <sphereGeometry args={[0.1, 14, 12]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive={sel('antenna-complex') ? '#38bdf8' : '#4ade80'}
                emissiveIntensity={sel('antenna-complex') ? 0.4 : innerGlow[k]}
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[h.x * 0.08, -0.17, h.z * 0.08]} rotation={[h.z * 0.3, 0, -h.x * 0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.5} metalness={0.05} {...emissiveProps(sel('antenna-complex'))} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[-1.7, HEAD_Y + 0.45, -0.6]} name="Antenna complex (LHC)" />}
      </PartGroup>

      {/* ---- Reaction centre: P680 dimer ---- */}
      <PartGroup id="reaction-centre" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        {[-0.14, 0.14].map((x, k) => (
          <mesh key={k} position={[x, HEAD_Y, 0]}>
            <capsuleGeometry args={[0.12, 0.3, 6, 14]} />
            <meshStandardMaterial
              color="#14532d"
              emissive={sel('reaction-centre') ? '#38bdf8' : '#fde047'}
              emissiveIntensity={sel('reaction-centre') ? 0.4 : centreFlash}
              roughness={0.35}
              metalness={0.12}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0, HEAD_Y + 0.75, 0]} name="Reaction centre (P680)" />}
      </PartGroup>

      {/* ---- Primary electron acceptor ---- */}
      <PartGroup id="electron-acceptor" position={explodeOffset([0.9, 0.6, 0.9], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.13, 16, 14]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive={sel('electron-acceptor') ? '#38bdf8' : '#fbbf24'}
            emissiveIntensity={sel('electron-acceptor') ? 0.4 : acceptorGlow}
            roughness={0.35}
            metalness={0.12}
          />
        </mesh>
        {showLabels && <SmallLabel position={[0.42, 1.35, 0]} name="Electron acceptor" />}
      </PartGroup>

      {/* ---- Excitation packets funnelling inward + ejected electrons rising ---- */}
      <group>
        {rays.rays.map((r, i) =>
          r.traveling ? (
            <mesh key={i} position={[Math.cos(r.theta) * r.packetR, HEAD_Y, Math.sin(r.theta) * r.packetR]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          ) : r.rise >= 0 ? (
            <mesh key={i} position={[0, 0.5 + r.rise * 1.15, 0]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={r.electronOp} />
            </mesh>
          ) : null,
        )}
      </group>
    </group>
  );
}
