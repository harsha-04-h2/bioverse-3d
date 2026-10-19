'use client';

import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 9.4 — pBR322 cloning vector: a circular plasmid with
   ori, amp^R, tet^R, rop, and restriction sites (EcoRI + BamHI inside tet^R,
   PstI + SalI inside amp^R). Slow turntable rotation from animTime. */

const R = 1.7;
const D2R = Math.PI / 180;

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected ? { emissive: '#38bdf8', emissiveIntensity: 0.5 } : { emissive: '#000000', emissiveIntensity: 0 };
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

const polar = (deg: number, r: number): [number, number, number] => [
  Math.cos(deg * D2R) * r,
  0,
  Math.sin(deg * D2R) * r,
];

const GENES = [
  { id: 'tetr', start: 50, arc: 110, color: '#14b8a6', tube: 0.11, label: 'tetᴿ' },
  { id: 'ampr', start: 200, arc: 120, color: '#f59e0b', tube: 0.11, label: 'ampᴿ' },
  { id: 'ori', start: -12, arc: 24, color: '#22c55e', tube: 0.13, label: 'ori' },
  { id: 'rop', start: 24, arc: 20, color: '#a78bfa', tube: 0.09, label: 'rop' },
];
const SITES = [
  { id: 'site-ecori', deg: 85, color: '#f472b6', name: 'EcoRI' },
  { id: 'site-bamhi', deg: 130, color: '#fb7185', name: 'BamHI' },
  { id: 'site-psti', deg: 240, color: '#60a5fa', name: 'PstI' },
  { id: 'site-sali', deg: 285, color: '#34d399', name: 'SalI' },
];

export default function PBR322(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  return (
    <group rotation={[0, animTime * 0.22, 0]}>
      {/* base plasmid backbone ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.055, 12, 128]} />
        <meshStandardMaterial color="#64748b" roughness={0.45} metalness={0.15} />
      </mesh>

      {/* gene arcs — each clickable via its own select handler below */}
      {GENES.map((g) => (
        <group key={g.id}>
          <group
            onClick={(e) => { e.stopPropagation(); onSelect(g.id); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            {(() => {
              const mid = (g.start + g.arc / 2) * D2R;
              const off: [number, number, number] = [Math.cos(mid) * explode * 0.55, 0, Math.sin(mid) * explode * 0.55];
              return (
                <group position={off}>
                  <group rotation={[0, -g.start * D2R, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[R, g.tube, 14, 72, g.arc * D2R]} />
                      <meshStandardMaterial color={g.color} roughness={0.4} metalness={0.1} {...emissiveProps(sel(g.id))} />
                    </mesh>
                  </group>
                </group>
              );
            })()}
          </group>
          {showLabels && (
            <PartLabel
              position={polar(g.start + g.arc / 2, R + 0.12 + explode * 0.55).map((v, k) => (k === 1 ? 0.34 : v)) as [number, number, number]}
              name={g.label}
            />
          )}
        </group>
      ))}

      {/* ori knob */}
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('ori'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh position={polar(0, R + explode * 0.55)}>
          <sphereGeometry args={[0.17, 18, 14]} />
          <meshStandardMaterial color="#22c55e" roughness={0.35} {...emissiveProps(sel('ori'))} />
        </mesh>
      </group>

      {/* restriction-site ticks */}
      {SITES.map((s) => {
        const dir = [Math.cos(s.deg * D2R), 0, Math.sin(s.deg * D2R)] as [number, number, number];
        const pos: [number, number, number] = [
          dir[0] * (R + 0.18 + explode * 0.9), 0, dir[2] * (R + 0.18 + explode * 0.9),
        ];
        return (
          <group key={s.id}>
            <group
              position={pos}
              rotation={[0, -s.deg * D2R, 0]}
              onClick={(e) => { e.stopPropagation(); onSelect(s.id); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <mesh>
                <boxGeometry args={[0.08, 0.32, 0.08]} />
                <meshStandardMaterial color={s.color} roughness={0.35} metalness={0.15} {...emissiveProps(sel(s.id))} />
              </mesh>
            </group>
            {showLabels && (
              <PartLabel
                position={[dir[0] * (R + 0.66 + explode * 0.9), 0.3, dir[2] * (R + 0.66 + explode * 0.9)]}
                name={s.name}
              />
            )}
          </group>
        );
      })}

      {showLabels && <PartLabel position={[0, 0.55, 0]} name="pBR322 · 4361 bp" />}
    </group>
  );
}
