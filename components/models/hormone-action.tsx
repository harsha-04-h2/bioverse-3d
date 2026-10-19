'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 19.5 — how hormones act, two pathways side by side (total 16 s, loops).
   LEFT (peptide hormone): hormone binds a membrane receptor → receptor changes
   shape → second messengers (cAMP) are released inside → an enzyme cascade fires.
   RIGHT (steroid hormone): lipid-soluble hormone crosses the membrane →
   binds an intracellular receptor → the complex enters the nucleus →
   it switches a gene on (mRNA leaves the nucleus).
   Every position is a deterministic function of animTime. */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

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

const LX = -3.1; // left (peptide) cell centre
const RX = 3.1; // right (steroid) cell centre

function pepStage(t: number): string {
  if (t < 3) return 'Hormone binds membrane receptor';
  if (t < 5) return 'Receptor changes shape';
  if (t < 10) return 'Second messengers released';
  if (t < 13) return 'Enzyme cascade fires';
  return 'Reset';
}
function steStage(t: number): string {
  if (t < 4) return 'Steroid crosses the membrane';
  if (t < 7) return 'Binds intracellular receptor';
  if (t < 10) return 'Complex enters nucleus';
  if (t < 13) return 'Gene switched on → mRNA';
  return 'Reset';
}

function CellShell({ x, color }: { x: number; color: string }): JSX.Element {
  return (
    <group position={[x, 0.3, 0]}>
      <mesh scale={[1.55, 1.25, 1.05]}>
        <sphereGeometry args={[1, 36, 26]} />
        <meshStandardMaterial color={color} transparent opacity={0.14} roughness={0.3} depthWrite={false} />
      </mesh>
      <mesh scale={[1.57, 1.27, 1.07]}>
        <sphereGeometry args={[1, 36, 26]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function HormoneAction(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const t = animTime % 16;
  const sel = (id: string) => selectedId === id;
  const exL = -explode * 1.3;
  const exR = explode * 1.3;

  /* ---------- peptide pathway ---------- */
  const receptorPos: [number, number, number] = [LX - 0.55, 1.35, 0.35];
  const pepHormones = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        home: [LX - 2.1 + i * 0.28, 2.35 - i * 0.15, 0.55] as [number, number, number],
        jitter: i * 0.9,
      })),
    [],
  );
  const messengers = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        target: [
          LX - 0.9 + (i % 4) * 0.55,
          -0.35 + Math.floor(i / 4) * 0.5,
          (rand(i * 3 + 1) - 0.5) * 0.6,
        ] as [number, number, number],
        delay: i * 0.32,
      })),
    [],
  );
  const enzymes = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        pos: [LX - 0.9 + i * 0.55, -0.35 + (i % 2) * 0.5, 0] as [number, number, number],
      })),
    [],
  );

  const pepBindK = smooth(t / 2.8);
  const pepConsume = 1 - smooth((t - 3) / 1.5);
  const receptorActive = t >= 3 && t < 5 ? 0.5 + 0.5 * Math.sin(t * 9) : t >= 5 && t < 10 ? 0.55 : 0;
  const resetFade = 1 - smooth((t - 13) / 2.2);

  /* ---------- steroid pathway ---------- */
  const steDots = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        home: [RX + 1.9, 1.5 + i * 0.22, 0.4] as [number, number, number],
        inside: [RX - 0.35 + (rand(i * 5 + 1) - 0.5) * 0.5, 0.55, 0.15] as [number, number, number],
      })),
    [],
  );
  const intraReceptor: [number, number, number] = [RX - 0.5, 0.15, 0.2];
  const nucleusC: [number, number, number] = [RX + 0.1, -0.15, 0];

  const crossK = smooth(t / 3.8); // steroid crossing the membrane
  const dockK = smooth((t - 4) / 2); // first steroid docks on the receptor
  const complexK = smooth((t - 6) / 0.8); // complex formed
  const enterK = smooth((t - 7) / 2.6); // complex travelling into the nucleus
  const nuclearFlash = t >= 8.6 && t < 9.8 ? Math.sin(((t - 8.6) / 1.2) * Math.PI) : 0;
  const geneK = smooth((t - 10) / 1.2) * (1 - smooth((t - 13) / 2));

  const complexPos: [number, number, number] = [
    lerp(intraReceptor[0], nucleusC[0], enterK),
    lerp(intraReceptor[1], nucleusC[1], enterK),
    lerp(intraReceptor[2], nucleusC[2], enterK),
  ];

  const mrna = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.6;
        return { dir: [Math.cos(a), Math.sin(a) * 0.7, Math.sin(a) * 0.5] as [number, number, number], delay: i * 0.35 };
      }),
    [],
  );

  const dnaRungs = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  return (
    <group>
      {/* ================= LEFT: peptide pathway ================= */}
      <group position={[exL, 0, 0]}>
        <CellShell x={LX} color="#7dd3fc" />
        {showLabels && (
          <Html position={[LX, 2.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>(a) Peptide hormone</span>
          </Html>
        )}
        {showLabels && (
          <Html position={[LX, 2.35, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span style={{ color: '#7dd3fc' }}>{pepStage(t)}</span>
          </Html>
        )}

        {/* nucleus (quiet in this pathway) */}
        <mesh position={[LX + 0.35, -0.5, 0]}>
          <sphereGeometry args={[0.42, 24, 18]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.75} roughness={0.4} />
        </mesh>

        {/* membrane receptor (Y-shape on the cell surface) */}
        <PartGroup id="membrane-receptor" position={[0, 0, 0]} onSelect={onSelect}>
          <group position={receptorPos} rotation={[0, 0, receptorActive * 0.35]}>
            <mesh position={[-0.07, 0.1, 0]} rotation={[0, 0, 0.5]}>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive={sel('membrane-receptor') ? '#38bdf8' : '#0ea5e9'}
                emissiveIntensity={sel('membrane-receptor') ? 0.4 : 0.25 + receptorActive * 0.9}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0.07, 0.1, 0]} rotation={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive={sel('membrane-receptor') ? '#38bdf8' : '#0ea5e9'}
                emissiveIntensity={sel('membrane-receptor') ? 0.4 : 0.25 + receptorActive * 0.9}
                roughness={0.35}
              />
            </mesh>
          </group>
          {showLabels && <PartLabel position={[receptorPos[0] - 1.15, receptorPos[1] + 0.25, 0]} name="Membrane receptor" />}
        </PartGroup>

        {/* peptide hormone dots docking */}
        {pepHormones.map((h, i) => {
          if (pepConsume < 0.02) return null;
          const wob = Math.sin(t * 3 + h.jitter) * 0.05 * (1 - pepBindK);
          const pos: [number, number, number] = [
            lerp(h.home[0], receptorPos[0], pepBindK) + wob,
            lerp(h.home[1], receptorPos[1] + 0.28, pepBindK),
            lerp(h.home[2], receptorPos[2], pepBindK),
          ];
          return (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.11, 14, 12]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={pepConsume} />
            </mesh>
          );
        })}
        {showLabels && t < 3 && <PartLabel position={[LX - 2.0, 2.6, 0]} name="Peptide hormone" />}

        {/* second messengers racing inward */}
        <PartGroup id="second-messenger" position={[0, 0, 0]} onSelect={onSelect}>
          {messengers.map((m, i) => {
            const p = smooth((t - 5 - m.delay) / 1.8);
            if (p <= 0.01 || resetFade < 0.02) return null;
            const sx = receptorPos[0] + 0.1;
            const sy = receptorPos[1] - 0.45;
            return (
              <mesh key={i} position={[lerp(sx, m.target[0], p), lerp(sy, m.target[1], p), lerp(0.2, m.target[2], p)]}>
                <sphereGeometry args={[0.08, 10, 10]} />
                <meshBasicMaterial
                  color={sel('second-messenger') ? '#38bdf8' : '#22d3ee'}
                  transparent
                  opacity={resetFade * (0.35 + 0.65 * p)}
                />
              </mesh>
            );
          })}
          {showLabels && t >= 5 && t < 13 && <PartLabel position={[LX + 1.35, 0.75, 0]} name="Second messengers" />}
        </PartGroup>

        {/* enzyme cascade lighting up in sequence */}
        <PartGroup id="enzyme-cascade" position={[0, 0, 0]} onSelect={onSelect}>
          {enzymes.map((e, i) => {
            const glow = smooth((t - 5.6 - i * 0.85) / 1.1) * resetFade;
            return (
              <mesh key={i} position={e.pos} rotation={[0, 0, i * 0.4]}>
                <boxGeometry args={[0.3, 0.22, 0.22]} />
                <meshStandardMaterial
                  color={sel('enzyme-cascade') ? '#38bdf8' : '#f472b6'}
                  emissive={sel('enzyme-cascade') ? '#38bdf8' : '#ec4899'}
                  emissiveIntensity={sel('enzyme-cascade') ? 0.4 : glow * 1.3}
                  roughness={0.4}
                />
              </mesh>
            );
          })}
          {showLabels && <PartLabel position={[LX - 0.1, -1.15, 0]} name="Enzyme cascade" />}
        </PartGroup>
      </group>

      {/* ================= RIGHT: steroid pathway ================= */}
      <group position={[exR, 0, 0]}>
        <CellShell x={RX} color="#fbbf24" />
        {showLabels && (
          <Html position={[RX, 2.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>(b) Steroid hormone</span>
          </Html>
        )}
        {showLabels && (
          <Html position={[RX, 2.35, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span style={{ color: '#fbbf24' }}>{steStage(t)}</span>
          </Html>
        )}

        {/* steroid hormone dots: outside → through the membrane → inside */}
        <PartGroup id="steroid-hormone" position={[0, 0, 0]} onSelect={onSelect}>
          {steDots.map((d, i) => {
            const k = i === 0 ? Math.max(crossK, dockK) : crossK; // first dot goes on to dock
            const pos: [number, number, number] =
              i === 0 && t >= 4
                ? [
                    lerp(d.inside[0], intraReceptor[0], dockK),
                    lerp(d.inside[1], intraReceptor[1], dockK),
                    lerp(d.inside[2], intraReceptor[2], dockK),
                  ]
                : [lerp(d.home[0], d.inside[0], k), lerp(d.home[1], d.inside[1], k), lerp(d.home[2], d.inside[2], k)];
            const absorbed = i === 0 && t >= 6; // merged into the complex
            if (absorbed || resetFade < 0.02) return null;
            return (
              <mesh key={i} position={pos}>
                <sphereGeometry args={[0.11, 14, 12]} />
                <meshBasicMaterial color={sel('steroid-hormone') ? '#38bdf8' : '#fde047'} transparent opacity={0.35 + 0.65 * resetFade} />
              </mesh>
            );
          })}
          {showLabels && t < 4 && <PartLabel position={[RX + 2.0, 1.9, 0]} name="Steroid hormone" />}
        </PartGroup>

        {/* intracellular receptor */}
        <PartGroup id="intracellular-receptor" position={[0, 0, 0]} onSelect={onSelect}>
          {complexK < 0.99 && (
            <mesh position={intraReceptor}>
              <sphereGeometry args={[0.16, 16, 12]} />
              <meshStandardMaterial
                color="#fb923c"
                emissive={sel('intracellular-receptor') ? '#38bdf8' : '#f97316'}
                emissiveIntensity={sel('intracellular-receptor') ? 0.4 : 0.3 + dockK * 0.5}
                roughness={0.35}
              />
            </mesh>
          )}
          {showLabels && t < 6 && <PartLabel position={[intraReceptor[0] - 1.15, intraReceptor[1] - 0.3, 0]} name="Intracellular receptor" />}
        </PartGroup>

        {/* hormone–receptor complex travelling to the nucleus */}
        {complexK > 0.01 && enterK < 0.99 && (
          <PartGroup id="hormone-receptor-complex" position={[0, 0, 0]} onSelect={onSelect}>
            <mesh position={complexPos} scale={[1, 1, 1]}>
              <sphereGeometry args={[0.2 * (0.6 + 0.4 * complexK), 18, 14]} />
              <meshStandardMaterial
                color={sel('hormone-receptor-complex') ? '#38bdf8' : '#f97316'}
                emissive={sel('hormone-receptor-complex') ? '#38bdf8' : '#fb923c'}
                emissiveIntensity={sel('hormone-receptor-complex') ? 0.4 : 0.7}
                roughness={0.3}
              />
            </mesh>
            {showLabels && t >= 6 && t < 10 && <PartLabel position={[complexPos[0], complexPos[1] + 0.55, 0]} name="Hormone–receptor complex" />}
          </PartGroup>
        )}

        {/* nucleus with DNA; flashes as the complex enters, gene glows after */}
        <PartGroup id="target-nucleus" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={nucleusC}>
            <sphereGeometry args={[0.55, 28, 20]} />
            <meshStandardMaterial
              color="#8b5cf6"
              transparent
              opacity={0.55}
              roughness={0.35}
              emissive={sel('target-nucleus') ? '#38bdf8' : '#a855f7'}
              emissiveIntensity={sel('target-nucleus') ? 0.4 : nuclearFlash * 0.9 + geneK * 0.35}
            />
          </mesh>
          {/* DNA double helix inside */}
          <group position={nucleusC}>
            {dnaRungs.map((i) => {
              const y = -0.28 + i * 0.095;
              const a = i * 0.85;
              const x1 = Math.cos(a) * 0.16;
              const z1 = Math.sin(a) * 0.16;
              const x2 = Math.cos(a + Math.PI) * 0.16;
              const z2 = Math.sin(a + Math.PI) * 0.16;
              return (
                <group key={i}>
                  <mesh position={[x1, y, z1]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color={geneK > 0.3 ? '#4ade80' : '#c4b5fd'} />
                  </mesh>
                  <mesh position={[x2, y, z2]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color={geneK > 0.3 ? '#4ade80' : '#c4b5fd'} />
                  </mesh>
                  <Line points={[[x1, y, z1], [x2, y, z2]]} color={geneK > 0.3 ? '#4ade80' : '#8b5cf6'} lineWidth={1} transparent opacity={0.8} />
                </group>
              );
            })}
          </group>
          {/* mRNA leaving the nucleus after gene activation */}
          {mrna.map((m, i) => {
            const p = smooth((t - 10 - m.delay) / 1.6);
            if (p <= 0.01 || geneK < 0.02) return null;
            return (
              <mesh
                key={i}
                position={[
                  nucleusC[0] + m.dir[0] * p * 0.9,
                  nucleusC[1] + m.dir[1] * p * 0.9,
                  nucleusC[2] + m.dir[2] * p * 0.9,
                ]}
              >
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshBasicMaterial color="#f87171" transparent opacity={geneK} />
              </mesh>
            );
          })}
          {showLabels && <PartLabel position={[nucleusC[0] + 0.1, nucleusC[1] - 0.95, 0]} name="Nucleus — gene activation" />}
        </PartGroup>
      </group>
    </group>
  );
}
