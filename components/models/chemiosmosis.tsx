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

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Animation loop: 12 s — the lumen H⁺ pool fills over the cycle. */
const LOOP = 12;
const H_TOTAL = 26;

export default function Chemiosmosis(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  // Lumen protons: pool grows from 8 to H_TOTAL across the loop.
  const hVisible = 8 + Math.floor((H_TOTAL - 8) * (t / LOOP));
  const lumenH = useMemo(
    () =>
      Array.from({ length: H_TOTAL }, (_, i) => ({
        x: (rand(i * 3 + 1) - 0.5) * 5.0,
        y: -1.9 + rand(i * 3 + 2) * 1.5,
        z: (rand(i * 3 + 3) - 0.5) * 1.9,
        bob: 0.05 * Math.sin(t * 3 + rand(i * 3 + 4) * 6.28),
      })),
    [t],
  );

  // Pump columns (PSII / cyt b6f hints) pushing H+ down from stroma to lumen.
  const pumpH = useMemo(() => {
    const out: { x: number; y: number; op: number }[] = [];
    for (const px of [-1.9, 1.9]) {
      for (let i = 0; i < 3; i++) {
        const prog = ((t * 0.6 + i / 3) % 1) * 0.999;
        out.push({ x: px + 0.08 * Math.sin(i * 2.7), y: 0.55 - prog * 2.2, op: 0.85 });
      }
    }
    return out;
  }, [t]);

  // Protons streaming up through the ATP synthase channel into the stroma.
  const channelH = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => {
        const prog = ((t * 0.8 + i / 3) % 1) * 0.999;
        return { y: -1.7 + prog * 3.3, op: prog > 0.85 ? (1 - prog) / 0.15 : 1 };
      }),
    [t],
  );

  // ADP + Pi -> ATP: a 3 s synthesis cycle at the F1 head.
  const q = (t % 3) / 3;
  const adpPos: [number, number, number] = [-0.95 + Math.min(q / 0.35, 1) * 0.75, 1.35 - Math.min(q / 0.35, 1) * 0.4, 0];
  const piPos: [number, number, number] = [0.95 - Math.min(q / 0.35, 1) * 0.75, 1.35 - Math.min(q / 0.35, 1) * 0.4, 0];
  const fuseFlash = q >= 0.35 && q < 0.5 ? Math.sin(((q - 0.35) / 0.15) * Math.PI) : 0;
  const atpRise = q >= 0.5 ? (q - 0.5) / 0.5 : -1;

  return (
    <group>
      {/* ---- stroma (above) and lumen (below) zones ---- */}
      <PartGroup id="stroma" position={explodeOffset([0, 1.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[5.6, 1.9, 2.4]} />
          <meshStandardMaterial
            color="#2dd4bf"
            transparent
            opacity={0.13}
            roughness={0.6}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('stroma'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.35, 2.15, 0]} name="Stroma (low H⁺)" />}
      </PartGroup>
      <PartGroup id="lumen" position={explodeOffset([0, -1.5, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, -1.25, 0]}>
          <boxGeometry args={[5.6, 1.9, 2.4]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.16}
            roughness={0.6}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('lumen'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.35, -2.3, 0]} name="Lumen (H⁺ builds up)" />}
      </PartGroup>

      {/* ---- thylakoid membrane leaflets ---- */}
      <PartGroup id="thylakoid-membrane" position={explodeOffset([0, 0, 1.1], explode)} onSelect={onSelect}>
        {[0.1, -0.1].map((y, k) => (
          <mesh key={k} position={[0, y, 0]}>
            <boxGeometry args={[5.6, 0.13, 2.4]} />
            <meshStandardMaterial color="#15803d" roughness={0.42} metalness={0.08} {...emissiveProps(sel('thylakoid-membrane'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[2.45, 0.42, 0]} name="Thylakoid membrane" />}
      </PartGroup>

      {/* ---- H+ pump hints (PSII / cyt b6f) ---- */}
      {[-1.9, 1.9].map((x, k) => (
        <group key={k} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.52, 0.3]} />
            <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.12} />
          </mesh>
        </group>
      ))}
      {pumpH.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fef9c3" transparent opacity={p.op} emissive="#facc15" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {showLabels && <SmallLabel position={[-1.9, 0.55, 0]} name="H⁺ pump" />}
      {showLabels && <SmallLabel position={[1.9, 0.55, 0]} name="H⁺ pump" />}

      {/* ---- lumen proton pool (clickable) ---- */}
      <PartGroup id="proton" position={[0, 0, 0]} onSelect={onSelect}>
        {lumenH.slice(0, hVisible).map((p, i) => (
          <mesh key={i} position={[p.x, p.y + p.bob, p.z]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial
              color="#fef9c3"
              emissive={sel('proton') ? '#38bdf8' : '#facc15'}
              emissiveIntensity={sel('proton') ? 0.4 : 0.7}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        ))}
        {showLabels && <SmallLabel position={[2.2, -1.1, 0.6]} name={`H⁺ ×${hVisible}`} />}
      </PartGroup>

      {/* ---- ATP synthase ---- */}
      <PartGroup id="atp-synthase" position={explodeOffset([0, 0.9, 0.8], explode)} onSelect={onSelect}>
        {/* F0 rotor in the membrane */}
        <group position={[0, 0, 0]} rotation={[0, t * 4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.26, 0.36, 20]} />
            <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.12} {...emissiveProps(sel('atp-synthase'))} />
          </mesh>
          <mesh position={[0.26, 0, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.08]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
          </mesh>
        </group>
        {/* stalk + F1 head in the stroma */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 10]} />
          <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.3, 22, 16]} />
          <meshStandardMaterial
            color="#eab308"
            emissive={sel('atp-synthase') ? '#38bdf8' : '#facc15'}
            emissiveIntensity={sel('atp-synthase') ? 0.4 : 0.3 + fuseFlash * 0.9}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, 1.05, 0]} name="ATP synthase" />}
        {showLabels && <SmallLabel position={[0.62, 0.32, 0]} name="F₀ rotor" />}
        {showLabels && <SmallLabel position={[0.62, 0.82, 0]} name="F₁ head" />}
      </PartGroup>

      {/* ---- protons flowing through the channel ---- */}
      {channelH.map((p, i) => (
        <mesh key={i} position={[0.44, p.y, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#fef9c3" transparent opacity={p.op} emissive="#facc15" emissiveIntensity={0.9} />
        </mesh>
      ))}

      {/* ---- ADP + Pi converging, ATP released ---- */}
      {q < 0.5 && (
        <>
          <mesh position={adpPos}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh position={piPos}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
          </mesh>
        </>
      )}
      {showLabels && q < 0.35 && <SmallLabel position={[-1.15, 1.6, 0]} name="ADP + Pi" />}
      {atpRise >= 0 && (
        <mesh position={[0, 1.15 + atpRise * 1.5, 0]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          <meshStandardMaterial
            color="#bef264"
            transparent
            opacity={1 - atpRise * 0.8}
            emissive="#a3e635"
            emissiveIntensity={1.1}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
      {showLabels && atpRise >= 0 && atpRise < 0.6 && <SmallLabel position={[0.5, 1.35, 0]} name="ATP" />}
    </group>
  );
}
