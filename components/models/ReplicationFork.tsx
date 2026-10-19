'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function ClickGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position?: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position ?? [0, 0, 0]}
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

const DUR = 36; // seconds per fork sweep
const X_LEFT = -4.6;
const X_RIGHT = 4.6;
const FORK_FROM = -3.2;
const FORK_TO = 3.2;
const Z_DUP = 0.24;
const Z_SEP = 0.95;
const Z_NEW = 0.55;
const FL = 1.05; // Okazaki fragment length
const GAP = 0.18; // gap between fragments
const FRAG_START = 0.3; // distance behind fork where fragment 0 ends

const COL_PARENT = '#38bdf8';
const COL_TEMPLATE = '#818cf8';
const COL_NEW = '#34d399';
const COL_PRIMER = '#fb923c';

function tubeAlongX(radius: number): THREE.TubeGeometry {
  return new THREE.TubeGeometry(
    new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)),
    4,
    radius,
    10,
    false,
  );
}

function elbowGeometry(sign: 1 | -1): THREE.TubeGeometry {
  const pts = [
    new THREE.Vector3(0, 0, sign * Z_DUP),
    new THREE.Vector3(0.2, 0, sign * (Z_DUP + 0.12)),
    new THREE.Vector3(0.4, 0, sign * (Z_DUP + 0.4)),
    new THREE.Vector3(0.62, 0, sign * Z_SEP),
  ];
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.06, 10, false);
}

interface Frag {
  j: number;
  left: number;
  right: number;
}

export default function ReplicationFork(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const t = animTime % DUR;
  const p = t / DUR;
  const xf = lerp(FORK_FROM, FORK_TO, p);

  const geos = useMemo(
    () => ({
      strand: tubeAlongX(0.06),
      thin: tubeAlongX(0.05),
      primer: tubeAlongX(0.035),
      elbowTop: elbowGeometry(1),
      elbowBot: elbowGeometry(-1),
    }),
    [],
  );
  useEffect(
    () => () => {
      geos.strand.dispose();
      geos.thin.dispose();
      geos.primer.dispose();
      geos.elbowTop.dispose();
      geos.elbowBot.dispose();
    },
    [geos],
  );

  // ---- parental duplex rungs ----
  const parentRungs: number[] = [];
  for (let xj = X_LEFT + 0.3; xj < xf - 0.08; xj += 0.45) parentRungs.push(xj);

  // ---- leading strand rungs (template z=-Z_DUP to new z=-Z_NEW) ----
  const leadRungs: number[] = [];
  for (let xj = X_LEFT + 0.3; xj < xf - 0.35; xj += 0.45) leadRungs.push(xj);

  // ---- Okazaki fragments ----
  const frags: Frag[] = [];
  const prog = (xf - FORK_FROM) / (FL + GAP);
  const frac = prog - Math.floor(prog);
  let j = 0;
  while (true) {
    const right = xf - FRAG_START - j * (FL + GAP);
    const len = j === 0 ? Math.max(0.08, FL * smooth(frac * 1.6)) : FL;
    const left = right - len;
    if (left < X_LEFT + 0.1) break;
    frags.push({ j, left, right });
    j += 1;
  }

  const topExplode: [number, number, number] = [0, 0, explode * 1.1];
  const botExplode: [number, number, number] = [0, 0, -explode * 1.1];

  const frag0 = frags[0];
  const nickX = frags.length > 1 ? (frags[0].left + frags[1].right) / 2 : null;
  const helicaseSpin = animTime * 3;

  return (
    <group>
      {showLabels && (
        <Html position={[0, 2.2, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Replication fork — helicase unwinds, strands copied 5′→3′</span>
        </Html>
      )}

      {/* ---- parental duplex (upstream of fork) ---- */}
      <ClickGroup id="parental-dna" onSelect={onSelect}>
        {[Z_DUP, -Z_DUP].map((z) => (
          <mesh
            key={z}
            geometry={geos.strand}
            position={[X_LEFT, 0, z]}
            scale={[Math.max(0.01, xf - X_LEFT), 1, 1]}
          >
            <meshStandardMaterial color={COL_PARENT} roughness={0.4} metalness={0.1} {...emissiveProps(sel('parental-dna'))} />
          </mesh>
        ))}
        {parentRungs.map((xj, i) => (
          <mesh key={i} position={[xj, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, Z_DUP * 2]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(sel('parental-dna'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-4.0, 0.55, 0]} name="Parental DNA" />}
      </ClickGroup>

      {/* ---- fork elbows: template strands separate ---- */}
      <group position={[xf, 0, 0]}>
        <mesh geometry={geos.elbowTop} position={topExplode}>
          <meshStandardMaterial color={COL_TEMPLATE} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh geometry={geos.elbowBot} position={botExplode}>
          <meshStandardMaterial color={COL_TEMPLATE} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>

      {/* ---- separated template single strands (downstream) ---- */}
      <group>
        {[Z_SEP, -Z_SEP].map((z, i) => (
          <mesh
            key={i}
            geometry={geos.strand}
            position={[xf + 0.62, 0, z + (z > 0 ? topExplode[2] : botExplode[2])]}
            scale={[Math.max(0.01, X_RIGHT - xf - 0.62), 1, 1]}
          >
            <meshStandardMaterial color={COL_TEMPLATE} roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* ---- LEADING strand: continuous synthesis toward the fork ---- */}
      <ClickGroup id="leading-strand" onSelect={onSelect}>
        <mesh
          geometry={geos.thin}
          position={[X_LEFT, 0, -Z_NEW + botExplode[2]]}
          scale={[Math.max(0.01, xf - 0.25 - X_LEFT), 1, 1]}
        >
          <meshStandardMaterial color={COL_NEW} roughness={0.4} metalness={0.1} {...emissiveProps(sel('leading-strand'))} />
        </mesh>
        {leadRungs.map((xj, i) => (
          <mesh key={i} position={[xj, 0, -Z_NEW + 0.155 + botExplode[2]]}>
            <boxGeometry args={[0.08, 0.08, Z_NEW - Z_DUP]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(sel('leading-strand'))} />
          </mesh>
        ))}
        {/* 5'→3' direction cone pointing at the fork */}
        <mesh position={[xf - 0.45, 0, -Z_NEW + botExplode[2]]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.11, 0.24, 12]} />
          <meshStandardMaterial color={COL_NEW} roughness={0.4} {...emissiveProps(sel('leading-strand'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.6, -0.75, -Z_NEW]} name="Leading strand" />}
      </ClickGroup>

      {/* ---- LAGGING side: template + Okazaki fragments ---- */}
      <ClickGroup id="okazaki-fragment" onSelect={onSelect}>
        {frags.map((f) => (
          <group key={f.j}>
            <mesh
              geometry={geos.thin}
              position={[f.left, 0, Z_NEW + topExplode[2]]}
              scale={[Math.max(0.01, f.right - f.left), 1, 1]}
            >
              <meshStandardMaterial color={COL_NEW} roughness={0.4} metalness={0.1} {...emissiveProps(sel('okazaki-fragment'))} />
            </mesh>
            {[0.25, 0.5, 0.75].map((q) => {
              const xj = f.left + (f.right - f.left) * q;
              if (xj < f.left + 0.12) return null;
              return (
                <mesh key={q} position={[xj, 0, Z_NEW - 0.155 + topExplode[2]]}>
                  <boxGeometry args={[0.07, 0.07, Z_NEW - Z_DUP]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(sel('okazaki-fragment'))} />
                </mesh>
              );
            })}
            {/* 5'→3' cone pointing away from fork */}
            <mesh position={[f.left + 0.28, 0, Z_NEW + topExplode[2]]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.1, 0.22, 12]} />
              <meshStandardMaterial color={COL_NEW} roughness={0.4} {...emissiveProps(sel('okazaki-fragment'))} />
            </mesh>
          </group>
        ))}
        {showLabels && frags.length > 1 && (
          <PartLabel position={[frags[1].left, 0.7, Z_NEW]} name="Okazaki fragments" />
        )}
      </ClickGroup>

      {/* ---- lagging template strand label ---- */}
      <ClickGroup id="lagging-strand" onSelect={onSelect}>
        <mesh
          geometry={geos.strand}
          position={[xf + 0.62, 0, Z_DUP + topExplode[2]]}
          scale={[Math.max(0.01, X_RIGHT - xf - 0.62), 1, 1]}
        >
          <meshStandardMaterial color={COL_TEMPLATE} roughness={0.4} metalness={0.1} {...emissiveProps(sel('lagging-strand'))} />
        </mesh>
        {showLabels && <PartLabel position={[xf + 1.5, -0.7, Z_DUP]} name="Lagging template" />}
      </ClickGroup>

      {/* ---- helicase at the fork ---- */}
      <ClickGroup id="helicase" onSelect={onSelect}>
        <group position={[xf, 0, 0]} rotation={[0, 0, helicaseSpin]}>
          <mesh>
            <torusGeometry args={[0.3, 0.13, 12, 24]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.2} {...emissiveProps(sel('helicase'))} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.35} metalness={0.2} {...emissiveProps(sel('helicase'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[xf, 0.85, 0]} name="Helicase" />}
      </ClickGroup>

      {/* ---- DNA polymerase blobs ---- */}
      <ClickGroup id="dna-polymerase" onSelect={onSelect}>
        <group position={[xf - 0.95, Math.sin(animTime * 2) * 0.05, -Z_NEW + botExplode[2]]}>
          <mesh>
            <sphereGeometry args={[0.3, 20, 20]} />
            <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.1} {...emissiveProps(sel('dna-polymerase'))} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.3, 0.07, 10, 20]} />
            <meshStandardMaterial color="#8b5cf6" roughness={0.4} metalness={0.1} {...emissiveProps(sel('dna-polymerase'))} />
          </mesh>
        </group>
        {frag0 && (
          <group position={[frag0.right - 0.15, 0, Z_NEW + topExplode[2]]}>
            <mesh>
              <sphereGeometry args={[0.24, 18, 18]} />
              <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.1} {...emissiveProps(sel('dna-polymerase'))} />
            </mesh>
          </group>
        )}
        {showLabels && <PartLabel position={[xf - 1.6, 0.85, -Z_NEW]} name="DNA polymerase" />}
      </ClickGroup>

      {/* ---- primase + RNA primer at fragment 0's 5' end ---- */}
      {frag0 && (
        <ClickGroup id="primase" onSelect={onSelect}>
          <mesh
            geometry={geos.primer}
            position={[frag0.left - 0.22, 0, Z_NEW + topExplode[2]]}
            scale={[0.22, 1, 1]}
          >
            <meshStandardMaterial color={COL_PRIMER} roughness={0.4} {...emissiveProps(sel('primase'))} />
          </mesh>
          <mesh position={[frag0.left - 0.32, 0.22, Z_NEW + topExplode[2]]}>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.1} {...emissiveProps(sel('primase'))} />
          </mesh>
          {showLabels && <PartLabel position={[frag0.left - 0.6, -0.7, Z_NEW]} name="Primase + primer" />}
        </ClickGroup>
      )}

      {/* ---- SSB proteins coating exposed single strands ---- */}
      <ClickGroup id="ssb-protein" onSelect={onSelect}>
        {[0.9, 1.25, 1.6].map((dx) =>
          [Z_SEP, -Z_SEP].map((z) => {
            const xj = xf + 0.62 + dx;
            if (xj > X_RIGHT - 0.15) return null;
            return (
              <mesh key={`${dx}${z}`} position={[xj, 0.16, z + (z > 0 ? topExplode[2] : botExplode[2])]}>
                <sphereGeometry args={[0.11, 14, 14]} />
                <meshStandardMaterial color="#fde047" roughness={0.45} {...emissiveProps(sel('ssb-protein'))} />
              </mesh>
            );
          }),
        )}
        {showLabels && xf + 2.2 < X_RIGHT - 0.15 && (
          <PartLabel position={[xf + 2.2, 0.6, Z_SEP]} name="SSB proteins" />
        )}
      </ClickGroup>

      {/* ---- ligase sealing the newest nick ---- */}
      {nickX !== null && nickX > X_LEFT + 0.2 && (
        <ClickGroup id="ligase" onSelect={onSelect}>
          <mesh position={[nickX, 0, Z_NEW + topExplode[2]]}>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.15} {...emissiveProps(sel('ligase'))} />
          </mesh>
          {showLabels && <PartLabel position={[nickX, -0.65, Z_NEW]} name="Ligase" />}
        </ClickGroup>
      )}
    </group>
  );
}
