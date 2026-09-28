import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, Line } from '@react-three/drei';
import { Cpu, Play, Pause } from 'lucide-react';

const INPUT_VARIABLES = [
  { id: 'SST', name: 'Sea Surface Temp', value: '28.7 °C', color: '#EF4444' },
  { id: 'SSS', name: 'Sea Surface Salinity', value: '34.4 PSU', color: '#0866C6' },
  { id: 'SLA', name: 'Sea Level Anomaly', value: '+0.12 m', color: '#18BFEF' },
  { id: 'U_CURR', name: 'Current U-Vector', value: '+0.32 m/s', color: '#45D6C8' },
  { id: 'V_CURR', name: 'Current V-Vector', value: '-0.18 m/s', color: '#45D6C8' },
  { id: 'U_WIND', name: 'Wind U-Vector', value: '+4.2 m/s', color: '#A78BFA' },
  { id: 'V_WIND', name: 'Wind V-Vector', value: '+2.8 m/s', color: '#A78BFA' },
];

const STANDARD_DEPTHS = [0, 20, 50, 100, 200, 500, 1000];

// 3D Neural Latent Lattice (64 nodes)
function LatentManifold({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 64 points in a spherical 3D latent cloud
  const nodes = useMemo(() => {
    const list: THREE.Vector3[] = [];
    const count = 64;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 1.1 + Math.sin(i * 0.5) * 0.25;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      list.push(new THREE.Vector3(x, y, z));
    }
    return list;
  }, []);

  // Interconnecting synaptic lines
  const lines = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.8) {
          pairs.push([nodes[i], nodes[j]]);
        }
      }
    }
    return pairs;
  }, [nodes]);

  useFrame((_, delta) => {
    if (groupRef.current && active) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central glowing core sphere */}
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshBasicMaterial color="#18BFEF" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#45D6C8" transparent opacity={0.7} />
      </mesh>
      <pointLight color="#18BFEF" intensity={2.5} distance={3} />

      {/* 64 Latent Vector Nodes */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color={idx % 3 === 0 ? '#45D6C8' : idx % 2 === 0 ? '#18BFEF' : '#38BDF8'} />
        </mesh>
      ))}

      {/* Synaptic interconnects */}
      {lines.map((pair, idx) => (
        <Line
          key={idx}
          points={pair}
          color="#18BFEF"
          lineWidth={0.5}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
}

// Flowing Input Particle Streams
function FlowingDataStream({
  startPos,
  color,
  active,
}: {
  startPos: [number, number, number];
  color: string;
  active: boolean;
}) {
  const pointsCount = 18;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;
    const t = clock.getElapsedTime() * 1.5;

    for (let i = 0; i < pointsCount; i++) {
      const progress = ((t + i / pointsCount) % 1.0);
      // Interpolate from startPos to center [0,0,0] along curve
      const x = startPos[0] * (1 - progress);
      const y = startPos[1] * (1 - progress) + Math.sin(progress * Math.PI) * 0.3;
      const z = startPos[2] * (1 - progress);

      dummy.position.set(x, y, z);
      const scale = (1 - progress * 0.4) * 0.04;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, pointsCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

// Depth Output Pillars
function DepthOutputPillars({ active }: { active: boolean }) {
  return (
    <group position={[3.5, 0, 0]}>
      {STANDARD_DEPTHS.map((d, i) => {
        const y = 1.6 - (i / (STANDARD_DEPTHS.length - 1)) * 3.2;
        return (
          <group key={d} position={[0, y, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.2, 0.22, 0.2]} />
              <meshBasicMaterial
                color={i < 2 ? '#EF4444' : i < 4 ? '#F59E0B' : '#0866C6'}
                transparent
                opacity={active ? 0.75 : 0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.24, 0.25, 0.22]} />
              <meshBasicMaterial color="#18BFEF" wireframe transparent opacity={0.4} />
            </mesh>
            <Html position={[0.75, 0, 0]} center style={{ pointerEvents: 'none' }}>
              <span className="text-[10px] font-mono-tech text-cyan-300 font-bold whitespace-nowrap">
                {d}m
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function OceanEmbeddingVisualizer({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [active, setActive] = useState(true);

  // Position of 7 input streams on the left
  const inputPositions = useMemo(() => {
    return INPUT_VARIABLES.map((_, i) => {
      const y = 2.0 - (i / (INPUT_VARIABLES.length - 1)) * 4.0;
      return [-3.6, y, 0] as [number, number, number];
    });
  }, []);

  return (
    <div
      className={`ocean-panel relative w-full overflow-hidden flex flex-col ${className}`}
      style={{ minHeight: 460, ...style }}
    >
      {/* Top HUD Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-[#030d1d]/85 font-mono-tech">
        <div className="flex items-center gap-2">
          <Cpu size={15} className="text-[#18BFEF]" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            OCEAN EMBEDDING ARCHITECTURE
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-400 font-bold">
            64-DIM LATENT MANIFOLD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive(!active)}
            className="p-1 rounded bg-[#030d1d] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
            title="Pause/Resume stream"
          >
            {active ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>

      {/* 3D R3F Viewport */}
      <div className="flex-1 relative bg-[#020612] min-h-[360px]">
        <Canvas
          camera={{ position: [0, 0, 5.4], fov: 48 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 4]} intensity={2.0} color="#18BFEF" />

          {/* 7 Flowing Streams into Encoder */}
          {inputPositions.map((pos, i) => (
            <FlowingDataStream
              key={i}
              startPos={pos}
              color={INPUT_VARIABLES[i].color}
              active={active}
            />
          ))}

          {/* Central Latent Manifold (64 Dimensions) */}
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <LatentManifold active={active} />
          </Float>

          {/* Depth Decoded Pillars on Right */}
          <DepthOutputPillars active={active} />
        </Canvas>

        {/* Input variables overlay tags (Left) */}
        <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-between pointer-events-none font-mono-tech">
          {INPUT_VARIABLES.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#040e20]/80 border border-cyan-500/30 text-[10px]"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.color }} />
              <span className="text-white font-bold">{v.id}</span>
              <span className="text-slate-400 hidden sm:inline">{v.value}</span>
            </div>
          ))}
        </div>

        {/* Center Encoder Label */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#030d1d]/85 border border-cyan-400/40 text-[11px] font-mono-tech text-cyan-300 font-bold uppercase tracking-wider backdrop-blur-md">
          STATE ENCODER → 64-DIM EMBEDDING → DEPTH DECODER
        </div>

        {/* Output variables overlay tags (Right) */}
        <div className="absolute right-3 top-3 pointer-events-none font-mono-tech">
          <div className="px-2.5 py-1 rounded bg-[#040e20]/85 border border-cyan-500/30 text-[10px] text-right">
            <span className="text-cyan-300 font-bold block">15-DEPTH PROFILES</span>
            <span className="text-slate-400 text-[9px]">0m to 1000m Subsurface</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-[#030d1d]/90 border-t border-cyan-500/20 text-xs font-mono-tech">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">1. ENCODER:</span>
          <span className="text-slate-300 text-[11px]">7 surface physical constraints</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-teal-400 font-bold">2. LATENT:</span>
          <span className="text-slate-300 text-[11px]">64-dim continuous ocean state</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">3. DECODER:</span>
          <span className="text-slate-300 text-[11px]">Depth-conditioned 0–1000m thermal field</span>
        </div>
      </div>
    </div>
  );
}
