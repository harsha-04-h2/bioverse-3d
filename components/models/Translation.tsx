'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
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

const DUR = 30;
const CODONS = ['AUG', 'UUC', 'GCA', 'ACG', 'CUA', 'GGG'];
const CODON_W = 0.9;
const cx = (i: number) => -2.25 + CODON_W * i;
const MRNA_Y = -1.55;
const CYCLE = 3.5;
const ELONG_START = 3;

/** Mini tRNA: acceptor stem with anticodon nub at the bottom. */
function MiniTRNA({
  color,
  selected,
}: {
  color: string;
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.72, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} {...em} />
      </mesh>
      <mesh position={[0, -0.14, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} {...em} />
      </mesh>
      {/* anticodon nub pairing with the codon */}
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[0.2, 0.12, 0.2]} />
        <meshStandardMaterial color="#f87171" roughness={0.4} {...em} />
      </mesh>
    </group>
  );
}

export default function Translation(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const t = animTime % DUR;

  // ---- cycle state ----
  let cycle = -1; // -1 = initiation
  let ct = 0; // time within cycle
  let riboX = cx(0);
  let aaCount = 1;
  if (t >= ELONG_START && t < 24) {
    const e = t - ELONG_START;
    cycle = Math.min(5, Math.floor(e / CYCLE));
    ct = e - cycle * CYCLE;
    const from = cx(cycle);
    const to = cx(Math.min(5, cycle + 1));
    riboX = lerp(from, to, smooth((ct - 2.2) / 1.3));
    aaCount = cycle + 1 + (ct > 2.0 ? 1 : 0);
  } else if (t >= 24) {
    cycle = 6; // termination
    riboX = cx(5);
    aaCount = 7;
  }
  const terminating = t >= 24;
  const termK = terminating ? smooth((t - 24) / 6) : 0;

  // ---- polypeptide chain curve ----
  const chainPts = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(riboX - 0.15, -0.35, 0.3),
      new THREE.Vector3(riboX + 0.05, 0.45, 0.22),
      new THREE.Vector3(riboX + 0.75, 1.05, 0.12),
      new THREE.Vector3(riboX + 1.55, 1.3, 0),
    ]);
    return curve.getPoints(24).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [riboX]);
  const aaPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < aaCount; i++) {
      const idx = Math.floor((i / Math.max(1, aaCount - 1)) * 24);
      arr.push(chainPts[idx]);
    }
    return arr;
  }, [chainPts, aaCount]);

  const stageName =
    t < 3 ? 'Initiation — ribosome assembles at the start codon' : t < 24 ? 'Elongation — tRNAs cycle through A → P → E, the chain grows' : 'Termination — finished polypeptide released';

  return (
    <group>
      {showLabels && (
        <Html position={[0, 2.9, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{stageName}</span>
        </Html>
      )}

      {/* ---- mRNA with codons ---- */}
      <ClickGroup id="mrna" onSelect={onSelect}>
        <mesh position={[-0, MRNA_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 6 * CODON_W + 0.6, 10]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.1} {...emissiveProps(sel('mrna'))} />
        </mesh>
        {CODONS.map((codon, i) => (
          <mesh key={i} position={[cx(i), MRNA_Y, 0]}>
            <boxGeometry args={[CODON_W - 0.1, 0.24, 0.4]} />
            <meshStandardMaterial
              color={i === 0 ? '#34d399' : '#0ea5e9'}
              roughness={0.4}
              metalness={0.08}
              {...emissiveProps(sel('mrna'))}
            />
          </mesh>
        ))}
        {showLabels &&
          CODONS.map((codon, i) => (
            <Html key={`c${i}`} position={[cx(i), MRNA_Y - 0.42, 0]} center zIndexRange={[30, 0]} className="bv-label">
              <span style={{ fontSize: 10, opacity: 0.85 }}>{codon}</span>
            </Html>
          ))}
        {showLabels && <PartLabel position={[-3.4, MRNA_Y - 0.45, 0]} name="mRNA (5′→3′)" />}
      </ClickGroup>

      {/* ---- ribosome subunits ---- */}
      <ClickGroup id="ribosome-small" onSelect={onSelect}>
        <mesh position={[riboX, -1.0 - termK * 0.35, 0]} scale={[1.35, 0.55, 0.95]}>
          <sphereGeometry args={[0.55, 28, 20]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.1} {...emissiveProps(sel('ribosome-small'))} />
        </mesh>
        {showLabels && <PartLabel position={[riboX - 1.35, -1.0, 0]} name="Small subunit" />}
      </ClickGroup>
      <ClickGroup id="ribosome-large" onSelect={onSelect}>
        <group position={[riboX, 0.1 + termK * 0.45, 0]}>
          <mesh scale={[1.2, 0.9, 1.0]}>
            <sphereGeometry args={[0.78, 28, 20]} />
            <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.1} {...emissiveProps(sel('ribosome-large'))} />
          </mesh>
          {/* exit tunnel hint */}
          <mesh position={[0.55, 0.55, 0]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.14, 0.14, 0.5, 12]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.6} {...emissiveProps(sel('ribosome-large'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[riboX + 1.5, 0.75, 0]} name="Large subunit" />}
      </ClickGroup>

      {/* ---- tRNAs cycling through sites ---- */}
      <ClickGroup id="trna" onSelect={onSelect}>
        {/* P site tRNA (carries the growing chain) */}
        {!terminating && (
          <group position={[riboX, -0.62, 0.3]}>
            <MiniTRNA color="#60a5fa" selected={sel('trna')} />
          </group>
        )}
        {/* A site tRNA drops in during each cycle */}
        {cycle >= 0 && cycle < 5 && !terminating && (
          <group position={[cx(cycle + 1), lerp(1.5, -0.62, smooth(ct / 1.0)), 0.3]} visible={smooth(ct / 0.8) > 0.01}>
            <MiniTRNA color="#34d399" selected={sel('trna')} />
          </group>
        )}
        {/* E site tRNA exits during translocation */}
        {cycle > 0 && !terminating && (
          <group
            position={[cx(cycle - 1), -0.62 - smooth((ct - 2.2) / 1.3) * 1.4, 0.3]}
            visible={smooth((ct - 2.0) / 1.0) < 0.98}
          >
            <MiniTRNA color="#94a3b8" selected={sel('trna')} />
          </group>
        )}
        {showLabels && !terminating && cycle >= 0 && (
          <>
            <PartLabel position={[cx(Math.min(5, cycle + 1)), -2.35, 0.3]} name="A site" />
            <PartLabel position={[riboX, 1.15, 0.3]} name="P site" />
          </>
        )}
      </ClickGroup>

      {/* ---- growing polypeptide ---- */}
      <ClickGroup id="polypeptide" onSelect={onSelect}>
        <group position={[0, termK * 2.2, 0]} visible={termK < 0.98}>
          <Line
            points={chainPts}
            color="#f472b6"
            lineWidth={3}
            transparent
            opacity={1 - termK}
          />
          {aaPositions.map((p, i) => {
            const isNewest = i === aaPositions.length - 1 && cycle >= 0 && ct < 2.6 && !terminating;
            const pop = isNewest ? 1 + 0.45 * (1 - smooth((ct - 2.0) / 0.6)) : 1;
            return (
              <mesh key={i} position={p} scale={pop}>
                <sphereGeometry args={[0.15, 14, 14]} />
                <meshStandardMaterial
                  color={i === 0 ? '#f9a8d4' : '#f472b6'}
                  roughness={0.4}
                  transparent
                  opacity={1 - termK}
                  {...emissiveProps(sel('polypeptide'))}
                />
              </mesh>
            );
          })}
        </group>
        {showLabels && !terminating && <PartLabel position={[riboX + 2.1, 1.75, 0]} name="Polypeptide chain" />}
      </ClickGroup>
    </group>
  );
}
