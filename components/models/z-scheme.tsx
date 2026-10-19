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

/** Animation loop: 24 s, six 4 s stages. */
const LOOP = 24;

const STAGES = [
  {
    id: 'water-splitting',
    name: 'Water splitting',
    range: '0–4 s',
    desc: "PSII's oxygen-evolving complex cracks water, releasing O₂ and H⁺ and feeding electrons into the chain.",
  },
  {
    id: 'psii',
    name: 'PSII excitation',
    range: '4–8 s',
    desc: 'Absorbed light lifts PSII (P680) electrons to a high-energy state.',
  },
  {
    id: 'plastoquinone',
    name: 'Plastoquinone pool',
    range: '8–12 s',
    desc: 'Mobile plastoquinone ferries electrons downhill while pumping H⁺ into the lumen.',
  },
  {
    id: 'cyt-b6f',
    name: 'Cytochrome b₆f',
    range: '12–16 s',
    desc: 'Cytochrome b₆f passes electrons to plastocyanin and pumps more H⁺ across the membrane.',
  },
  {
    id: 'psi',
    name: 'PSI excitation',
    range: '16–20 s',
    desc: 'A second light boost at P700 re-energises the electrons.',
  },
  {
    id: 'nadp-reductase',
    name: 'NADP⁺ reduction',
    range: '20–24 s',
    desc: 'Ferredoxin and NADP⁺ reductase load the electrons onto NADPH.',
  },
];

function stageIndex(tt: number): number {
  return Math.min(5, Math.floor(tt / 4));
}

export default function ZScheme(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = animTime % LOOP;
  const si = stageIndex(t);
  const stageT = t - si * 4; // 0..4 within the stage

  // Electron path: zig-zag of redox energy levels from PSII to NADPH.
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-3.0, 1.7, 0],
          [-2.3, 1.0, 0],
          [-1.6, 0.42, 0],
          [-0.8, 0.12, 0],
          [0.2, -0.08, 0],
          [1.0, 0.55, 0],
          [1.6, 1.7, 0],
          [2.2, 1.0, 0],
          [2.8, 0.32, 0],
          [3.4, 0.02, 0],
        ].map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      ),
    [],
  );
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 140, 0.045, 8, false), [curve]);

  // Electron packets flowing continuously PSII -> NADPH.
  const electrons = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let i = 0; i < 6; i++) {
      const p = (t / 7 + i / 6) % 1;
      const v = curve.getPoint(p);
      out.push({ pos: [v.x, v.y, v.z] });
    }
    return out;
  }, [t, curve]);

  // O2 bubbles + H+ during water splitting (stage 0).
  const o2 = useMemo(
    () =>
      si === 0
        ? Array.from({ length: 3 }, (_, i) => {
            const prog = ((stageT / 4 + i / 3) % 1) * 0.999;
            return {
              x: -3.0 + 0.18 * Math.sin(i * 2.2),
              y: -0.55 + prog * 2.3,
              op: 0.9 * (1 - prog * 0.35),
            };
          })
        : [],
    [si, stageT],
  );
  const waterH = useMemo(
    () =>
      si === 0
        ? Array.from({ length: 3 }, (_, i) => {
            const prog = ((stageT / 4 + i / 3) % 1) * 0.999;
            return { x: -3.05 + 0.1 * Math.sin(i * 3.1), y: -0.5 - prog * 1.15, op: 0.95 };
          })
        : [],
    [si, stageT],
  );
  const waterScale = si === 0 ? Math.max(0.15, 1 - (stageT / 4) * 0.85) : 1;

  // H+ pumped into the lumen at cyt b6f (stage 3).
  const pumpedH = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const prog = ((t * 0.55 + i / 4) % 1) * 0.999;
        return {
          x: -0.8 + 0.12 * Math.sin(i * 3.3),
          y: -0.15 - prog * 1.45,
          op: si === 3 ? 0.95 : 0.12,
        };
      }),
    [t, si],
  );

  // Plastoquinone shuttling between PSII and cyt b6f.
  const pqX = [0, 1].map((k) => -1.6 + 0.5 * Math.sin(t * 1.3 + k * Math.PI));

  const psiiGlow = si === 1 ? 1.1 + 0.5 * Math.sin(t * 10) : 0.18;
  const psiGlow = si === 4 ? 1.1 + 0.5 * Math.sin(t * 10) : 0.18;
  const spot = (id: string) => (STAGES[si].id === id ? 0.55 : 0);

  const stationLabel = (x: number, y: number, name: string) => showLabels && <SmallLabel position={[x, y, 0]} name={name} />;

  return (
    <group>
      {/* ---- stage banner ---- */}
      {showLabels && (
        <Html position={[0.2, 3.15, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>
            {STAGES[si].name} · {STAGES[si].range}
          </span>
        </Html>
      )}
      {showLabels && (
        <Html position={[0.2, 2.72, 0]} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
          <span>{STAGES[si].desc}</span>
        </Html>
      )}

      {/* ---- lumen + stroma zones ---- */}
      <mesh position={[0.2, -1.85, -0.4]}>
        <boxGeometry args={[8.4, 0.8, 1.8]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.22} roughness={0.6} metalness={0} depthWrite={false} />
      </mesh>
      {showLabels && <SmallLabel position={[-3.6, -1.85, -0.4]} name="Lumen (H⁺)" />}
      {showLabels && <SmallLabel position={[3.75, 2.35, -0.4]} name="Stroma" />}

      {/* ---- electron conduit (the "Z") ---- */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.4} roughness={0.5} metalness={0.1} />
      </mesh>
      {electrons.map((e, i) => (
        <mesh key={i} position={e.pos}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.4} roughness={0.3} metalness={0} />
        </mesh>
      ))}

      {/* ---- water splitting zone at PSII base ---- */}
      <PartGroup id="water-splitting" position={explodeOffset([-1.6, -0.6, 0], explode)} onSelect={onSelect}>
        {[-3.62, -3.42].map((x, i) => (
          <group key={i} position={[x, -0.78, 0.25]} scale={waterScale}>
            <mesh>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.1} {...emissiveProps(sel('water-splitting'))} />
            </mesh>
            {[-0.07, 0.07].map((dx, k) => (
              <mesh key={k} position={[dx, 0.09, 0]}>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.1} {...emissiveProps(sel('water-splitting'))} />
              </mesh>
            ))}
          </group>
        ))}
        {o2.map((b, i) => (
          <mesh key={`o${i}`} position={[b.x, b.y, 0.1]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#fca5a5" transparent opacity={b.op} roughness={0.3} metalness={0.1} />
          </mesh>
        ))}
        {waterH.map((b, i) => (
          <mesh key={`h${i}`} position={[b.x, b.y, 0.1]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#fef9c3" transparent opacity={b.op} emissive="#facc15" emissiveIntensity={0.8} />
          </mesh>
        ))}
        {stationLabel(-3.0, -1.15, 'H₂O → O₂ + H⁺')}
      </PartGroup>

      {/* ---- PSII ---- */}
      <PartGroup id="psii" position={explodeOffset([-1.4, 0.8, 0], explode)} onSelect={onSelect}>
        <mesh position={[-3.0, 0.35, 0]}>
          <boxGeometry args={[0.55, 1.5, 0.55]} />
          <meshStandardMaterial
            color="#0d9488"
            emissive={sel('psii') ? '#38bdf8' : '#14b8a6'}
            emissiveIntensity={sel('psii') ? 0.4 : 0.25 + spot('psii')}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        {/* excitation column */}
        <mesh position={[-3.0, 1.15, 0]}>
          <cylinderGeometry args={[0.09, 0.14, 1.25, 12]} />
          <meshStandardMaterial
            color="#fde047"
            emissive={sel('psii') ? '#38bdf8' : '#facc15'}
            emissiveIntensity={sel('psii') ? 0.4 : psiiGlow}
            transparent
            opacity={0.85}
            roughness={0.3}
            metalness={0}
          />
        </mesh>
        {stationLabel(-3.0, 2.05, 'PSII (P680)')}
      </PartGroup>

      {/* ---- Plastoquinone pool ---- */}
      <PartGroup id="plastoquinone" position={explodeOffset([-0.9, 0.6, 0], explode)} onSelect={onSelect}>
        {pqX.map((x, k) => (
          <mesh key={k} position={[x, 0.42 + k * 0.22, 0]}>
            <sphereGeometry args={[0.15, 16, 14]} />
            <meshStandardMaterial
              color="#fb923c"
              emissive={sel('plastoquinone') ? '#38bdf8' : '#f97316'}
              emissiveIntensity={sel('plastoquinone') ? 0.4 : 0.3 + spot('plastoquinone')}
              roughness={0.35}
              metalness={0.12}
            />
          </mesh>
        ))}
        {stationLabel(-1.6, 0.95, 'Plastoquinone')}
      </PartGroup>

      {/* ---- Cytochrome b6f ---- */}
      <PartGroup id="cyt-b6f" position={explodeOffset([-0.4, 0.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[-0.8, 0.12, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.5]} />
          <meshStandardMaterial
            color="#7c3aed"
            emissive={sel('cyt-b6f') ? '#38bdf8' : '#a78bfa'}
            emissiveIntensity={sel('cyt-b6f') ? 0.4 : 0.25 + spot('cyt-b6f')}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        {pumpedH.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#fef9c3" transparent opacity={p.op} emissive="#facc15" emissiveIntensity={0.8} />
          </mesh>
        ))}
        {stationLabel(-0.8, 0.72, 'Cyt b₆f')}
      </PartGroup>

      {/* ---- Plastocyanin ---- */}
      <PartGroup id="plastocyanin" position={explodeOffset([0.1, -0.5, 0], explode)} onSelect={onSelect}>
        {[0, 1].map((k) => (
          <mesh key={k} position={[0.2 + k * 0.22 - 0.11, -0.08 + k * 0.14, 0.05 * k]}>
            <sphereGeometry args={[0.11, 14, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.35} metalness={0.35} {...emissiveProps(sel('plastocyanin'))} />
          </mesh>
        ))}
        {stationLabel(0.2, -0.55, 'Plastocyanin')}
      </PartGroup>

      {/* ---- PSI ---- */}
      <PartGroup id="psi" position={explodeOffset([0.9, 0.8, 0], explode)} onSelect={onSelect}>
        <mesh position={[1.6, 0.35, 0]}>
          <boxGeometry args={[0.55, 1.5, 0.55]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive={sel('psi') ? '#38bdf8' : '#38bdf8'}
            emissiveIntensity={sel('psi') ? 0.4 : 0.25 + spot('psi')}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[1.6, 1.15, 0]}>
          <cylinderGeometry args={[0.09, 0.14, 1.25, 12]} />
          <meshStandardMaterial
            color="#fde047"
            emissive={sel('psi') ? '#38bdf8' : '#facc15'}
            emissiveIntensity={sel('psi') ? 0.4 : psiGlow}
            transparent
            opacity={0.85}
            roughness={0.3}
            metalness={0}
          />
        </mesh>
        {stationLabel(1.6, 2.05, 'PSI (P700)')}
      </PartGroup>

      {/* ---- Ferredoxin ---- */}
      <PartGroup id="ferredoxin" position={explodeOffset([1.5, 0.3, 0], explode)} onSelect={onSelect}>
        {[
          [2.72, 0.32, 0],
          [2.88, 0.28, 0.06],
          [2.8, 0.16, -0.06],
        ].map((p, k) => (
          <mesh key={k} position={p as [number, number, number]}>
            <sphereGeometry args={[0.1, 14, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.35} metalness={0.2} {...emissiveProps(sel('ferredoxin'))} />
          </mesh>
        ))}
        {stationLabel(2.8, 0.72, 'Ferredoxin')}
      </PartGroup>

      {/* ---- NADP+ reductase -> NADPH ---- */}
      <PartGroup id="nadp-reductase" position={explodeOffset([1.8, -0.3, 0], explode)} onSelect={onSelect}>
        <mesh position={[3.4, 0.02, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial
            color="#0d9488"
            emissive={sel('nadp-reductase') ? '#38bdf8' : '#2dd4bf'}
            emissiveIntensity={sel('nadp-reductase') ? 0.4 : 0.25 + spot('nadp-reductase')}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[3.95, -0.05, 0]} scale={si === 5 ? 0.6 + 0.55 * (stageT / 4) : 0.6}>
          <sphereGeometry args={[0.16, 16, 14]} />
          <meshStandardMaterial
            color="#bef264"
            emissive={sel('nadp-reductase') ? '#38bdf8' : '#a3e635'}
            emissiveIntensity={sel('nadp-reductase') ? 0.4 : 0.9}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {stationLabel(3.4, 0.62, 'NADP⁺ reductase')}
        {showLabels && <SmallLabel position={[3.95, -0.45, 0]} name="NADPH" />}
      </PartGroup>

      {/* ---- O2 label ---- */}
      {showLabels && si === 0 && <SmallLabel position={[-3.0, 1.0, 0.2]} name="O₂ released" />}
    </group>
  );
}
