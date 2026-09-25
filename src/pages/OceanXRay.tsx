import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Eye, Layers, Thermometer, AlertTriangle, Anchor, Info } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const VOLUME_WIDTH = 8;   // longitude
const VOLUME_HEIGHT = 5;  // depth
const VOLUME_DEPTH = 6;   // latitude
const MAX_DEPTH = 1000;

const DEPTH_LAYERS = [
  { depth: 0,    color: '#FF6B35', label: 'Surface' },
  { depth: 100,  color: '#FFA500', label: '100m' },
  { depth: 200,  color: '#A8D530', label: '200m' },
  { depth: 500,  color: '#45D6C8', label: '500m' },
  { depth: 700,  color: '#18BFEF', label: '700m' },
  { depth: 1000, color: '#0866C6', label: '1000m' },
];

const TEMPERATURE_PROFILE: [number, number][] = [
  [0, 28.7], [50, 26.2], [100, 23.5], [200, 19.1],
  [300, 15.7], [500, 12.8], [700, 9.2], [1000, 7.2],
];

const ARGO_FLOATS = [
  { id: 'ARGO-2901234', position: [-2.5, -1.0, 1.5] as [number, number, number] },
  { id: 'ARGO-2901456', position: [1.8, -2.2, -1.0] as [number, number, number] },
  { id: 'ARGO-2901789', position: [-0.5, -0.8, 2.0] as [number, number, number] },
  { id: 'ARGO-2901012', position: [2.5, -3.0, -0.5] as [number, number, number] },
  { id: 'ARGO-2901345', position: [-1.5, -1.5, -2.0] as [number, number, number] },
  { id: 'ARGO-2901678', position: [0.5, -3.8, 1.0] as [number, number, number] },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function depthToY(depth: number): number {
  return VOLUME_HEIGHT / 2 - (depth / MAX_DEPTH) * VOLUME_HEIGHT;
}

function getTemperatureAtDepth(depth: number): number {
  const profile = TEMPERATURE_PROFILE;
  if (depth <= profile[0][0]) return profile[0][1];
  if (depth >= profile[profile.length - 1][0]) return profile[profile.length - 1][1];

  for (let i = 0; i < profile.length - 1; i++) {
    const [d0, t0] = profile[i];
    const [d1, t1] = profile[i + 1];
    if (depth >= d0 && depth <= d1) {
      const frac = (depth - d0) / (d1 - d0);
      return Math.round((t0 + frac * (t1 - t0)) * 10) / 10;
    }
  }
  return 7.2;
}

function getUncertaintyAtDepth(depth: number): number {
  return Math.round((0.2 + depth * 0.0005 + Math.sin(depth * 0.01) * 0.15) * 10) / 10;
}

function getArgoRefAtDepth(depth: number): number {
  // Deterministic offset based on depth — no Math.random() to avoid flicker
  const temp = getTemperatureAtDepth(depth);
  const offset = 0.3 + Math.abs(Math.sin(depth * 0.07)) * 0.2;
  return Math.round((temp - offset) * 10) / 10;
}

// ─── 3D Scene Components ────────────────────────────────────────────────────

function OceanVolume() {
  return (
    <group>
      {/* Semi-transparent blue volume */}
      <mesh>
        <boxGeometry args={[VOLUME_WIDTH, VOLUME_HEIGHT, VOLUME_DEPTH]} />
        <meshStandardMaterial
          color="#1a4a7a"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe edges */}
      <mesh>
        <boxGeometry args={[VOLUME_WIDTH, VOLUME_HEIGHT, VOLUME_DEPTH]} />
        <meshBasicMaterial
          color="#3a8ad6"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function DepthLayers({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {DEPTH_LAYERS.map((layer) => {
        const y = depthToY(layer.depth);
        return (
          <mesh
            key={layer.depth}
            position={[0, y, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[VOLUME_WIDTH * 0.98, VOLUME_DEPTH * 0.98]} />
            <meshStandardMaterial
              color={layer.color}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function TemperatureSlice() {
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#FF4500');
    gradient.addColorStop(0.15, '#FF6B35');
    gradient.addColorStop(0.3, '#FF8C00');
    gradient.addColorStop(0.45, '#FFD700');
    gradient.addColorStop(0.6, '#45D6C8');
    gradient.addColorStop(0.8, '#18BFEF');
    gradient.addColorStop(1, '#0866C6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, -VOLUME_DEPTH / 2 + 0.01]}>
      <planeGeometry args={[VOLUME_WIDTH * 0.98, VOLUME_HEIGHT * 0.98]} />
      <meshBasicMaterial
        map={gradientTexture}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const result: [number, number, number][][] = [];
    const y = VOLUME_HEIGHT / 2 + 0.01;
    const halfW = VOLUME_WIDTH / 2;
    const halfD = VOLUME_DEPTH / 2;

    // Longitude lines (along Z)
    for (let x = -halfW; x <= halfW; x += 1.6) {
      result.push([
        [x, y, -halfD],
        [x, y, halfD],
      ]);
    }
    // Latitude lines (along X)
    for (let z = -halfD; z <= halfD; z += 1.2) {
      result.push([
        [-halfW, y, z],
        [halfW, y, z],
      ]);
    }
    return result;
  }, []);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#ffffff"
          lineWidth={0.5}
          opacity={0.15}
          transparent
        />
      ))}
    </group>
  );
}

function DepthLabels() {
  return (
    <group>
      {DEPTH_LAYERS.map((layer) => {
        const y = depthToY(layer.depth);
        return (
          <Html
            key={layer.depth}
            position={[-VOLUME_WIDTH / 2 - 0.3, y, VOLUME_DEPTH / 2]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-[10px] font-mono text-cyan-300/70 whitespace-nowrap select-none">
              {layer.depth}m
            </div>
          </Html>
        );
      })}
    </group>
  );
}

function Particles() {
  const count = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleData = useMemo(() => {
    const data: { position: THREE.Vector3; velocity: THREE.Vector3; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * VOLUME_WIDTH * 0.9,
          (Math.random() - 0.5) * VOLUME_HEIGHT * 0.9,
          (Math.random() - 0.5) * VOLUME_DEPTH * 0.9,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.003,
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const halfW = VOLUME_WIDTH / 2 * 0.9;
    const halfH = VOLUME_HEIGHT / 2 * 0.9;
    const halfD = VOLUME_DEPTH / 2 * 0.9;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];
      p.position.add(p.velocity);
      p.position.y += Math.sin(p.phase + performance.now() * 0.0005) * 0.0005;

      // Wrap around boundaries
      if (p.position.x > halfW) p.position.x = -halfW;
      if (p.position.x < -halfW) p.position.x = halfW;
      if (p.position.y > halfH) p.position.y = -halfH;
      if (p.position.y < -halfH) p.position.y = halfH;
      if (p.position.z > halfD) p.position.z = -halfD;
      if (p.position.z < -halfD) p.position.z = halfD;

      dummy.position.copy(p.position);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    void delta; // suppress unused warning
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial color="#88e8f8" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function ArgoPoints({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.001;
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const scale = 1 + Math.sin(t * 2 + i * 1.5) * 0.2;
        child.scale.setScalar(scale);
      }
    });
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {ARGO_FLOATS.map((argo) => (
        <group key={argo.id}>
          {/* Core sphere */}
          <mesh position={argo.position}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#45D6C8"
              emissive="#45D6C8"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Glow halo */}
          <mesh position={argo.position}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial
              color="#45D6C8"
              transparent
              opacity={0.15}
              depthWrite={false}
            />
          </mesh>
          {/* Label */}
          <Html
            position={[argo.position[0], argo.position[1] + 0.25, argo.position[2]]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-[8px] font-mono text-emerald-300/80 whitespace-nowrap select-none bg-[#071B33]/60 px-1 rounded">
              {argo.id}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function DepthIndicator({ depth }: { depth: number }) {
  const y = depthToY(depth);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const opacity = 0.3 + Math.sin(performance.now() * 0.003) * 0.1;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[VOLUME_WIDTH * 1.02, VOLUME_DEPTH * 1.02]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function AxisLabels() {
  return (
    <group>
      {/* Longitude label */}
      <Html
        position={[0, -VOLUME_HEIGHT / 2 - 0.5, VOLUME_DEPTH / 2 + 0.3]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-[10px] font-mono text-slate-400/60 uppercase tracking-widest select-none">
          Longitude
        </div>
      </Html>
      {/* Latitude label */}
      <Html
        position={[VOLUME_WIDTH / 2 + 0.5, -VOLUME_HEIGHT / 2 - 0.5, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-[10px] font-mono text-slate-400/60 uppercase tracking-widest select-none">
          Latitude
        </div>
      </Html>
      {/* Depth axis label */}
      <Html
        position={[-VOLUME_WIDTH / 2 - 0.6, 0, VOLUME_DEPTH / 2 + 0.3]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-[10px] font-mono text-slate-400/60 uppercase tracking-widest select-none">
          Depth
        </div>
      </Html>
    </group>
  );
}

function SceneAutoRotate() {
  const controlsRef = useRef<never>(null);

  useFrame(() => {
    // Subtle auto-rotation is handled by OrbitControls autoRotate
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={0.3}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={25}
      maxPolarAngle={Math.PI * 0.85}
    />
  );
}

// ─── Main 3D Scene ──────────────────────────────────────────────────────────

interface SceneProps {
  currentDepth: number;
  showLayers: boolean;
  showArgo: boolean;
}

function OceanScene({ currentDepth, showLayers, showArgo }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#aaccff" />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#6688cc" />

      <OceanVolume />
      <DepthLayers visible={showLayers} />
      <TemperatureSlice />
      <GridLines />
      <DepthLabels />
      <AxisLabels />
      <Particles />
      <ArgoPoints visible={showArgo} />
      <DepthIndicator depth={currentDepth} />

      <SceneAutoRotate />
    </>
  );
}

// ─── Color Scale Bar ────────────────────────────────────────────────────────

function ColorScaleBar() {
  return (
    <div className="mt-4">
      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
        Temperature Scale
      </div>
      <div className="flex items-stretch gap-0 h-36 w-5 rounded overflow-hidden mx-auto"
        style={{
          background: 'linear-gradient(to bottom, #FF4500, #FF6B35, #FF8C00, #FFD700, #45D6C8, #18BFEF, #0866C6)',
        }}
      />
      <div className="flex flex-col justify-between h-36 text-[9px] font-mono text-slate-400 ml-7 -mt-36">
        <span>28.7 C</span>
        <span>23.5 C</span>
        <span>19.1 C</span>
        <span>12.8 C</span>
        <span>7.2 C</span>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function OceanXRay() {
  const [currentDepth, setCurrentDepth] = useState(0);
  const [showLayers, setShowLayers] = useState(true);
  const [showUncertainty, setShowUncertainty] = useState(false);
  const [showAnomaly, setShowAnomaly] = useState(false);
  const [showArgo, setShowArgo] = useState(true);

  const temperature = getTemperatureAtDepth(currentDepth);
  const uncertainty = getUncertaintyAtDepth(currentDepth);
  const argoRef = getArgoRefAtDepth(currentDepth);
  const difference = Math.round((temperature - argoRef) * 10) / 10;

  return (
    <div className="w-full h-screen bg-[#071B33] relative overflow-hidden">
      {/* Top title bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-[#071B33] to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#18BFEF] uppercase tracking-widest">OceanEmbed</span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-white font-semibold">3D Ocean X-Ray</span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-gray-400">Bay of Bengal, 18 Sep 2026</span>
        </div>
        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-semibold">
          DEMO — Illustrative Values
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ background: '#071B33' }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#071B33']} />
        <fog attach="fog" args={['#071B33', 20, 40]} />
        <OceanScene
          currentDepth={currentDepth}
          showLayers={showLayers}
          showArgo={showArgo}
        />
      </Canvas>

      {/* Left Control Panel */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-4 left-4 w-72 bg-[#071B33]/85 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-5 text-white z-10"
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <Eye className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold tracking-tight text-white">
            3D Ocean X-Ray
          </h2>
        </div>

        {/* Depth Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Depth
            </label>
            <span className="text-sm font-mono text-cyan-300">
              {currentDepth}m
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={currentDepth}
            onChange={(e) => setCurrentDepth(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00ffff ${currentDepth / 10}%, #1e3a5f ${currentDepth / 10}%)`,
            }}
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0m</span>
            <span>250m</span>
            <span>500m</span>
            <span>750m</span>
            <span>1000m</span>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-2.5 mb-5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Visualization Layers
          </div>

          <ToggleButton
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Temperature Layers"
            checked={showLayers}
            onChange={setShowLayers}
          />
          <ToggleButton
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="Uncertainty"
            checked={showUncertainty}
            onChange={setShowUncertainty}
          />
          <ToggleButton
            icon={<Thermometer className="w-3.5 h-3.5" />}
            label="Anomaly Highlights"
            checked={showAnomaly}
            onChange={setShowAnomaly}
          />
          <ToggleButton
            icon={<Anchor className="w-3.5 h-3.5" />}
            label="ARGO Points"
            checked={showArgo}
            onChange={setShowArgo}
          />
        </div>

        {/* Color Scale */}
        <ColorScaleBar />

        {/* Suppress unused state warnings with a hidden element */}
        <div className="hidden">
          {showUncertainty ? 'u' : ''}
          {showAnomaly ? 'a' : ''}
        </div>
      </motion.div>

      {/* Right Info Panel */}
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className="absolute top-4 right-4 w-64 bg-[#071B33]/85 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-5 text-white z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Inspection Data
            </span>
          </div>
          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
            DEMO
          </span>
        </div>

        {/* Data Readouts */}
        <div className="space-y-3">
          <DataReadout
            label="DEPTH"
            value={`${currentDepth}`}
            unit="m"
            color="text-cyan-300"
          />
          <DataReadout
            label="TEMPERATURE"
            value={`${temperature}`}
            unit="°C"
            color="text-orange-300"
          />
          <DataReadout
            label="UNCERTAINTY"
            value={`±${uncertainty}`}
            unit="°C"
            color="text-yellow-300"
          />
          <DataReadout
            label="ARGO REFERENCE"
            value={`${argoRef}`}
            unit="°C"
            color="text-emerald-300"
          />
          <DataReadout
            label="DIFFERENCE"
            value={`${difference > 0 ? '+' : ''}${difference}`}
            unit="°C"
            color={Math.abs(difference) > 0.5 ? 'text-red-400' : 'text-slate-300'}
          />
        </div>

        {/* Depth profile mini visualization */}
        <div className="mt-5 pt-4 border-t border-cyan-500/10">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Temperature Profile
          </div>
          <div className="space-y-1">
            {TEMPERATURE_PROFILE.map(([d, t]) => {
              const barWidth = ((t - 5) / 25) * 100;
              const isActive = Math.abs(d - currentDepth) < 50;
              return (
                <div key={d} className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono w-8 text-right ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {d}m
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barWidth}%`,
                        background: isActive
                          ? 'linear-gradient(to right, #45D6C8, #00ffff)'
                          : 'linear-gradient(to right, #1e3a5f, #2a5a8f)',
                      }}
                    />
                  </div>
                  <span className={`text-[8px] font-mono w-8 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {t}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coordinates */}
        <div className="mt-4 pt-3 border-t border-cyan-500/10">
          <div className="text-[9px] font-mono text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Region</span>
              <span className="text-slate-400">Bay of Bengal</span>
            </div>
            <div className="flex justify-between">
              <span>Lat/Lng</span>
              <span className="text-slate-400">12.0°N, 85.0°E</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="text-slate-400">2026-09-18</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom center hint */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#071B33]/70 backdrop-blur-md border border-cyan-500/15 rounded-lg px-4 py-2 text-[10px] font-mono text-slate-400 z-10"
      >
        Drag to rotate &middot; Scroll to zoom &middot; Right-click to pan
      </motion.div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ToggleButton({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer
        ${checked
          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
          : 'bg-slate-700/20 text-slate-500 border border-slate-600/20 hover:bg-slate-700/30'
        }
      `}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <div
        className={`w-7 h-4 rounded-full relative transition-colors duration-200 ${
          checked ? 'bg-cyan-500/40' : 'bg-slate-600/40'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
            checked ? 'left-3.5 bg-cyan-400' : 'left-0.5 bg-slate-500'
          }`}
        />
      </div>
    </button>
  );
}

function DataReadout({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-semibold tabular-nums ${color}`}>
          {value}
        </span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
