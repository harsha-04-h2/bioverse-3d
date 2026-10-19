'use client';
import { type ReactNode } from 'react';
import { Html } from '@react-three/drei';

export interface BioModelProps {
  explode: number;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  animTime: number; // seconds; drive ALL motion deterministically from this
  cutaway?: boolean; // ignore for these models
}

function ClickableGroup({
  partId,
  onSelect,
  showLabels,
  label,
  labelPos,
  position,
  rotation,
  children,
}: {
  partId: string;
  onSelect: (id: string | null) => void;
  showLabels: boolean;
  label: string;
  labelPos: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(partId);
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
      {showLabels && label !== '' && (
        <Html position={labelPos} center zIndexRange={[40, 0]} className="bv-label">
          <span>{label}</span>
        </Html>
      )}
    </group>
  );
}

function partMaterial(
  color: string,
  partId: string,
  selectedId: string | null,
  transparent = false,
  opacity = 1,
): ReactNode {
  const selected = selectedId === partId;
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.45}
      metalness={0.08}
      emissive={selected ? '#38bdf8' : '#000000'}
      emissiveIntensity={selected ? 0.4 : 0}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

const SIDES = [-1, 1];
const POLLEN_ANGLES = [0, 1, 2, 3, 4, 5];

export default function FlowerLS(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;

  // Explode: spread parts vertically by explode * sign(baseY) * 0.9.
  const vy = (baseY: number, stay = false): number =>
    stay ? 0 : explode * Math.sign(baseY) * 0.9;

  const antherY = 0.1 + vy(0.1);
  const filamentY = -0.55 + vy(-0.55);
  const ovuleY = -1.225 + vy(-1.225);

  return (
    <group rotation={[0, 0, Math.sin(animTime * 0.6) * 0.02]}>
      {/* Ovary — stays fixed during explode */}
      <ClickableGroup
        partId="ovary"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Ovary"
        labelPos={[0.85, 0.15, 0]}
        position={[0, -1.2, 0]}
      >
        <mesh scale={[0.55, 0.7, 0.42]}>
          <sphereGeometry args={[1, 32, 32]} />
          {partMaterial('#86efac', 'ovary', selectedId, true, 0.9)}
        </mesh>
      </ClickableGroup>

      {/* Ovules — 4 small spheres inside the ovary, slightly front (z=0.18) so visible */}
      <ClickableGroup
        partId="ovule"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Ovule"
        labelPos={[0.62, 0, 0.2]}
        position={[0, ovuleY, 0]}
      >
        {(
          [
            [0.18, 0.125],
            [-0.18, 0.125],
            [0.18, -0.125],
            [-0.18, -0.125],
          ] as [number, number][]
        ).map(([x, y], k) => (
          <mesh key={k} position={[x, y, 0.18]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            {partMaterial('#fef3c7', 'ovule', selectedId)}
          </mesh>
        ))}
      </ClickableGroup>

      {/* Style */}
      <ClickableGroup
        partId="style"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Style"
        labelPos={[-0.5, 0.25, 0]}
        position={[0, -0.3 + vy(-0.3), 0]}
      >
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 1.2, 16]} />
          {partMaterial('#a7f3d0', 'style', selectedId)}
        </mesh>
      </ClickableGroup>

      {/* Stigma — flattened sphere + 3 tiny lobes on top */}
      <ClickableGroup
        partId="stigma"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Stigma"
        labelPos={[0.55, 0.2, 0]}
        position={[0, 0.4 + vy(0.4), 0]}
      >
        <mesh scale={[0.3, 0.13, 0.22]}>
          <sphereGeometry args={[1, 24, 24]} />
          {partMaterial('#6ee7b7', 'stigma', selectedId)}
        </mesh>
        {(
          [
            [0, 0.14, 0],
            [-0.12, 0.1, 0],
            [0.12, 0.1, 0],
          ] as [number, number, number][]
        ).map(([x, y, z], k) => (
          <mesh key={k} position={[x, y, z]}>
            <sphereGeometry args={[0.08, 14, 14]} />
            {partMaterial('#6ee7b7', 'stigma', selectedId)}
          </mesh>
        ))}
      </ClickableGroup>

      {/* Filaments — both thin cylinders in one clickable group */}
      <ClickableGroup
        partId="filament"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Filament"
        labelPos={[1.25, filamentY, 0]}
      >
        {SIDES.map((s) => (
          <mesh key={s} position={[s * 0.78, filamentY, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 12]} />
            {partMaterial('#fde68a', 'filament', selectedId)}
          </mesh>
        ))}
      </ClickableGroup>

      {/* Anthers — capsules + pollen grains around each */}
      <ClickableGroup
        partId="anther"
        onSelect={onSelect}
        showLabels={showLabels}
        label="Anther"
        labelPos={[1.25, antherY, 0]}
      >
        {SIDES.map((s) => (
          <group key={s} position={[s * 0.78, antherY, 0]}>
            <mesh>
              <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
              {partMaterial('#f59e0b', 'anther', selectedId)}
            </mesh>
            {POLLEN_ANGLES.map((k) => {
              const a = (k / 6) * Math.PI * 2;
              const bob = Math.sin(animTime * 2 + k + (s > 0 ? 3 : 0)) * 0.03;
              return (
                <mesh
                  key={k}
                  position={[0.26 * Math.cos(a), 0.3 * Math.sin(a) + bob, k % 2 === 0 ? 0.1 : -0.1]}
                >
                  <sphereGeometry args={[0.04, 10, 10]} />
                  {partMaterial('#fde68a', 'anther', selectedId)}
                </mesh>
              );
            })}
          </group>
        ))}
      </ClickableGroup>

      {/* Petals — large scaled spheres, spread outward in x during explode */}
      {SIDES.map((s) => (
        <ClickableGroup
          key={s}
          partId="petal"
          onSelect={onSelect}
          showLabels={showLabels}
          label={s > 0 ? 'Petal' : ''}
          labelPos={[0.75, 0.7, 0]}
          position={[s * (1.35 + explode * 0.5), -0.35 + vy(-0.35), 0]}
          rotation={[0, 0, -s * 0.35]}
        >
          <mesh scale={[0.85, 1.25, 0.16]}>
            <sphereGeometry args={[1, 32, 32]} />
            {partMaterial('#f9a8d4', 'petal', selectedId, true, 0.94)}
          </mesh>
        </ClickableGroup>
      ))}

      {/* Sepals — spread outward in x during explode */}
      {SIDES.map((s) => (
        <ClickableGroup
          key={s}
          partId="sepal"
          onSelect={onSelect}
          showLabels={showLabels}
          label={s > 0 ? 'Sepal' : ''}
          labelPos={[0.6, -0.6, 0]}
          position={[s * (1.12 + explode * 0.5), -1.05 + vy(-1.05), 0]}
          rotation={[0, 0, -s * 0.25]}
        >
          <mesh scale={[0.5, 0.85, 0.14]}>
            <sphereGeometry args={[1, 24, 24]} />
            {partMaterial('#4ade80', 'sepal', selectedId)}
          </mesh>
        </ClickableGroup>
      ))}

      {/* Thalamus — non-clickable, no label */}
      <group position={[0, -1.85 + vy(-1.85), 0]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.6, 0.25, 24]} />
          <meshStandardMaterial color="#65a30d" roughness={0.5} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
}
