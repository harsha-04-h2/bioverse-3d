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

/** Animation loop: 12 s per electron circuit. */
const LOOP = 12;
const CX = 0;
const CY = 0.4;
const R = 1.5;
const ELECTRONS = 7;

const D2R = Math.PI / 180;
function ringPos(deg: number): [number, number, number] {
  return [CX + R * Math.cos(deg * D2R), CY + R * Math.sin(deg * D2R), 0];
}

export default function CyclicPhotophosphorylation(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = animTime;

  // Electrons circulate clockwise, one full loop per LOOP seconds.
  const packets = useMemo(() => {
    const out: { pos: [number, number, number]; deg: number }[] = [];
    for (let i = 0; i < ELECTRONS; i++) {
      const deg = 90 - (((t / LOOP + i / ELECTRONS) % 1) * 360);
      out.push({ pos: ringPos(deg), deg });
    }
    return out;
  }, [t]);

  // PSI flashes each time a packet passes it.
  const psiFlash = useMemo(() => {
    let g = 0;
    for (const p of packets) {
      const d = Math.min(Math.abs(p.deg - 90), 360 - Math.abs(p.deg - 90));
      g = Math.max(g, Math.max(0, 1 - d / 28));
    }
    return g;
  }, [packets]);

  // Protons pumped into the lumen at cyt b6f drift downward.
  const protons = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const prog = ((t * 0.45 + i / 6) % 1) * 0.999;
        return {
          x: 0.14 * Math.sin(i * 2.4),
          y: CY - R - 0.05 - prog * 1.35,
          op: 0.9 * (1 - prog * 0.4),
        };
      }),
    [t],
  );

  // ATP sparkles emitted from the synthase head, continuous 3 s cycles.
  const atp = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const q = (t / 3 + i / 4) % 1;
        const vis = q < 0.55;
        return { y: -1.05 + q * 2.1, op: vis ? 1 - (q / 0.55) * 0.75 : 0, vis };
      }),
    [t],
  );

  const loopGeo = useMemo(() => {
    const pts = Array.from({ length: 72 }, (_, i) => {
      const deg = (i / 72) * 360;
      return new THREE.Vector3(CX + R * Math.cos(deg * D2R), CY + R * Math.sin(deg * D2R), 0);
    });
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, 120, 0.04, 8, true);
  }, []);

  // Direction cones along the loop (clockwise flow).
  const cones = useMemo(
    () =>
      [60, 0, -60, -120, 180, 120].map((deg) => {
        const [x, y] = ringPos(deg);
        const phi = Math.atan2(-Math.cos(deg * D2R), Math.sin(deg * D2R)); // clockwise tangent
        return { x, y, rot: phi - Math.PI / 2 };
      }),
    [],
  );

  return (
    <group>
      {showLabels && (
        <Html position={[0, 2.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Cyclic electron flow · ATP only, no NADPH</span>
        </Html>
      )}

      {/* ---- the loop conduit + direction cones + electron packets ---- */}
      <mesh geometry={loopGeo}>
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.38} roughness={0.5} metalness={0.1} />
      </mesh>
      {cones.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0]} rotation={[0, 0, c.rot]}>
          <coneGeometry args={[0.09, 0.22, 10]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {packets.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.4} roughness={0.3} metalness={0} />
        </mesh>
      ))}

      {/* ---- PSI (top): flashes as electrons return ---- */}
      <PartGroup id="psi" position={explodeOffset([0, 1.4, 0], explode)} onSelect={onSelect}>
        <mesh position={ringPos(90)}>
          <boxGeometry args={[0.52, 0.85, 0.45]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive={sel('psi') ? '#38bdf8' : '#facc15'}
            emissiveIntensity={sel('psi') ? 0.4 : 0.3 + 1.1 * psiFlash}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, CY + R + 0.55, 0]} name="PSI (P700)" />}
        {showLabels && <SmallLabel position={[0, CY + R + 0.16, 0]} name="Light re-energises each electron" />}
      </PartGroup>

      {/* ---- Ferredoxin ---- */}
      <PartGroup id="ferredoxin" position={explodeOffset([1.3, 0.6, 0], explode)} onSelect={onSelect}>
        {[
          [0, 0.1, 0],
          [0.16, 0.02, 0.05],
          [0.08, -0.1, -0.05],
        ].map((o, k) => {
          const [bx, by] = ringPos(30);
          return (
            <mesh key={k} position={[bx + o[0], by + o[1], o[2]]}>
              <sphereGeometry args={[0.1, 14, 12]} />
              <meshStandardMaterial color="#ea580c" roughness={0.35} metalness={0.2} {...emissiveProps(sel('ferredoxin'))} />
            </mesh>
          );
        })}
        {showLabels && <SmallLabel position={[ringPos(30)[0] + 0.45, ringPos(30)[1] + 0.3, 0]} name="Ferredoxin" />}
      </PartGroup>

      {/* ---- Plastoquinone ---- */}
      <PartGroup id="plastoquinone" position={explodeOffset([1.3, -0.7, 0], explode)} onSelect={onSelect}>
        {[0, 1].map((k) => {
          const [bx, by] = ringPos(-30);
          return (
            <mesh key={k} position={[bx + 0.12 * Math.sin(t * 1.6 + k * Math.PI), by + k * 0.2 - 0.1, 0]}>
              <sphereGeometry args={[0.14, 16, 14]} />
              <meshStandardMaterial
                color="#fb923c"
                emissive={sel('plastoquinone') ? '#38bdf8' : '#f97316'}
                emissiveIntensity={sel('plastoquinone') ? 0.4 : 0.35}
                roughness={0.35}
                metalness={0.12}
              />
            </mesh>
          );
        })}
        {showLabels && <SmallLabel position={[ringPos(-30)[0] + 0.45, ringPos(-30)[1] - 0.25, 0]} name="Plastoquinone" />}
      </PartGroup>

      {/* ---- Cytochrome b6f (bottom): pumps H+ into the lumen ---- */}
      <PartGroup id="cyt-b6f" position={explodeOffset([0, -1.3, 0], explode)} onSelect={onSelect}>
        <mesh position={ringPos(-90)}>
          <boxGeometry args={[0.5, 0.66, 0.45]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.12} {...emissiveProps(sel('cyt-b6f'))} />
        </mesh>
        {protons.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#fef9c3" transparent opacity={p.op} emissive="#facc15" emissiveIntensity={0.8} />
          </mesh>
        ))}
        {showLabels && <SmallLabel position={[-0.75, CY - R + 0.1, 0]} name="Cyt b₆f" />}
        {showLabels && <SmallLabel position={[0.7, -1.55, 0]} name="H⁺ pumped" />}
      </PartGroup>

      {/* ---- Plastocyanin ---- */}
      <PartGroup id="plastocyanin" position={explodeOffset([-1.3, -0.5, 0], explode)} onSelect={onSelect}>
        {[0, 1].map((k) => {
          const [bx, by] = ringPos(210);
          return (
            <mesh key={k} position={[bx + k * 0.2 - 0.1, by + k * 0.12, 0.05 * k]}>
              <sphereGeometry args={[0.11, 14, 12]} />
              <meshStandardMaterial color="#b45309" roughness={0.35} metalness={0.35} {...emissiveProps(sel('plastocyanin'))} />
            </mesh>
          );
        })}
        {showLabels && <SmallLabel position={[ringPos(210)[0] - 0.5, ringPos(210)[1] - 0.2, 0]} name="Plastocyanin" />}
      </PartGroup>

      {/* ---- membrane + lumen below the loop ---- */}
      <mesh position={[0, -2.55, -0.2]}>
        <boxGeometry args={[5.4, 0.16, 2.2]} />
        <meshStandardMaterial color="#15803d" transparent opacity={0.5} roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[0, -3.35, -0.2]}>
        <boxGeometry args={[5.4, 1.3, 2.2]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.2} roughness={0.6} metalness={0} depthWrite={false} />
      </mesh>
      {showLabels && <SmallLabel position={[-2.4, -3.35, -0.2]} name="Lumen (H⁺)" />}
      {showLabels && <SmallLabel position={[2.45, 0.9, -0.2]} name="Stroma" />}

      {/* ---- ATP synthase on the membrane ---- */}
      <PartGroup id="atp-synthase" position={explodeOffset([1.2, -1.6, 0], explode)} onSelect={onSelect}>
        <mesh position={[1.1, -2.55, 0]} rotation={[0, t * 3, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.4, 18]} />
          <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.12} {...emissiveProps(sel('atp-synthase'))} />
        </mesh>
        <mesh position={[1.1, -2.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 10]} />
          <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
        </mesh>
        <mesh position={[1.1, -1.95, 0]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial
            color="#eab308"
            emissive={sel('atp-synthase') ? '#38bdf8' : '#facc15'}
            emissiveIntensity={sel('atp-synthase') ? 0.4 : 0.35}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {atp.map(
          (a, i) =>
            a.vis && (
              <mesh key={i} position={[1.1 + 0.15 * Math.sin(i * 2.1), a.y, 0.1 * Math.sin(i * 1.3)]}>
                <sphereGeometry args={[0.08, 10, 10]} />
                <meshStandardMaterial color="#bef264" transparent opacity={a.op} emissive="#a3e635" emissiveIntensity={1.0} />
              </mesh>
            ),
        )}
        {showLabels && <PartLabel position={[1.1, -1.45, 0]} name="ATP synthase" />}
      </PartGroup>
    </group>
  );
}
