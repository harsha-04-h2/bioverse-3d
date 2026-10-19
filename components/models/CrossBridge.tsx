'use client';

import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import type { BioModelProps } from './types';

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

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
function smooth(x: number): number {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

const CYCLE = 10; // seconds per cross-bridge cycle
const STAGE_LEN = CYCLE / 4;

const STAGE_NAMES = [
  '1 · Myosin head binds actin — cross-bridge forms',
  '2 · Power stroke — head pivots, actin slides',
  '3 · ATP binds — myosin head detaches',
  '4 · ATP hydrolysed — head re-cocks',
];

const COCKED_ANGLE = -0.9; // rad, resting tilt
const STROKE_SWING = 0.75; // rad of forward pivot during the power stroke
const SLIDE = 0.9; // actin travel per stroke

export default function CrossBridge(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  const t10 = ((t % CYCLE) + CYCLE) % CYCLE;
  const stage = Math.min(3, Math.floor(t10 / STAGE_LEN));
  const ph = (t10 % STAGE_LEN) / STAGE_LEN;
  const e = smooth(ph);

  // attach: 0 detached, 1 fully bound
  const attach =
    stage === 0 ? e : stage === 1 ? 1 : stage === 2 ? 1 - e : 0;
  // stroke: 0 pre-stroke, 1 post-stroke (persists through detach, resets when re-cocked)
  const stroke = stage === 1 ? e : stage === 2 ? 1 : stage === 3 ? 1 - e : 0;
  // actin slides during the power stroke, eases back while detached (seamless loop)
  const actinX = stage === 1 ? SLIDE * e : stage === 2 ? SLIDE : stage === 3 ? SLIDE * (1 - e) : 0;

  const headAngle = COCKED_ANGLE * (1 - attach) + STROKE_SWING * stroke;
  const headDrop = (1 - attach) * 0.28; // detached head sits lower, away from actin

  // ATP appears only while it binds and is consumed (stage 3).
  const atpOp = stage === 2 ? Math.sin(Math.PI * ph) : 0;
  const powerGlow = stage === 1 ? 0.9 : 0.22;

  return (
    <group>
      {/* ---- Actin thin filament (slides during the power stroke) ---- */}
      <PartGroup id="actin" position={[actinX, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 5.2, 16]} />
          <meshStandardMaterial color="#f87171" roughness={0.45} metalness={0.05} {...emissiveProps(sel('actin'))} />
        </mesh>
        {/* binding site on actin */}
        <mesh position={[-0.2, 0.9, 0.13]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="#fecaca"
            roughness={0.35}
            emissive="#ef4444"
            emissiveIntensity={attach * 0.6}
          />
        </mesh>
        {showLabels && <PartLabel position={[2.1, 1.35, 0]} name="Actin" />}
      </PartGroup>

      {/* ---- Myosin thick filament stub ---- */}
      <group position={[0.1, -0.95, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 1.6, 20]} />
          <meshStandardMaterial color="#0f766e" roughness={0.45} metalness={0.1} />
        </mesh>
      </group>

      {/* ---- Myosin head: pivots about its base during the cycle ---- */}
      <PartGroup id="myosin-head" position={[0.1, -0.45 - headDrop, 0]} onSelect={onSelect}>
        <group rotation={[0, 0, headAngle]}>
          {/* lever arm */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 1.0, 12]} />
            <meshStandardMaterial color="#2dd4bf" roughness={0.4} metalness={0.1} {...emissiveProps(sel('myosin-head'))} />
          </mesh>
          {/* globular head */}
          <mesh position={[0, 1.08, 0]}>
            <sphereGeometry args={[0.2, 20, 16]} />
            <meshStandardMaterial color="#14b8a6" roughness={0.35} metalness={0.1} {...emissiveProps(sel('myosin-head'))} />
          </mesh>
          {/* ATP docks on the head during stage 3 */}
          <mesh position={[0.34, 1.08, 0]} visible={atpOp > 0.02}>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshStandardMaterial
              color="#facc15"
              transparent
              opacity={atpOp}
              roughness={0.3}
              emissive="#eab308"
              emissiveIntensity={0.7}
              depthWrite={false}
            />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[-1.15, 0.35, 0]} name="Myosin head" />}
      </PartGroup>

      {/* ---- Cross-bridge: glowing contact marker while bound ---- */}
      <PartGroup id="cross-bridge" position={[actinX, 0, 0]} onSelect={onSelect}>
        <mesh position={[-0.1, 0.72, 0]} visible={attach > 0.05} scale={attach}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.85 * attach}
            roughness={0.3}
            emissive={sel('cross-bridge') ? '#38bdf8' : '#f59e0b'}
            emissiveIntensity={sel('cross-bridge') ? 0.4 : 0.8}
            depthWrite={false}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.5, 1.05, 0.3]} name="Cross-bridge" />}
      </PartGroup>

      {/* ---- Power stroke: curved arrow that lights up in stage 2 ---- */}
      <PartGroup id="power-stroke" position={[0.1, -0.45, 0.28]} onSelect={onSelect}>
        <mesh rotation={[0, 0, -0.5]}>
          <torusGeometry args={[0.62, 0.045, 10, 32, 1.6]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={powerGlow}
            roughness={0.35}
            emissive={sel('power-stroke') ? '#38bdf8' : '#f59e0b'}
            emissiveIntensity={sel('power-stroke') ? 0.4 : stage === 1 ? 0.8 : 0.1}
            depthWrite={false}
          />
        </mesh>
        {showLabels && <PartLabel position={[0.95, -1.15, 0.3]} name="Power stroke" />}
      </PartGroup>

      {/* ---- ATP label (part group so it is clickable) ---- */}
      <PartGroup id="atp" position={[0, 0, 0]} onSelect={onSelect}>
        {showLabels && <PartLabel position={[1.15, 1.15, 0]} name="ATP" />}
      </PartGroup>

      {/* ---- Stage banner, driven by animTime ---- */}
      {showLabels && (
        <Html position={[0, 2.35, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[stage]}</span>
        </Html>
      )}
    </group>
  );
}
