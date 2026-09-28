import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Thermometer, Radio } from 'lucide-react';
import DemoBadge from '../components/common/DemoBadge';

// ─── Dimensions ─────────────────────────────────────────────────────────────
const VOLUME_WIDTH = 8.5;   // longitude
const VOLUME_HEIGHT = 5.2;  // depth (0 at top, 1000m at bottom)
const VOLUME_DEPTH = 6.5;   // latitude
const MAX_DEPTH = 1000;

const DEPTH_LAYERS = [
  { depth: 0,    color: '#FF4500', label: '0m Surface' },
  { depth: 50,   color: '#FF6B35', label: '50m Mixed Layer' },
  { depth: 100,  color: '#FFA500', label: '100m Thermocline' },
  { depth: 200,  color: '#A8D530', label: '200m' },
  { depth: 500,  color: '#45D6C8', label: '500m Mesopelagic' },
  { depth: 700,  color: '#18BFEF', label: '700m' },
  { depth: 1000, color: '#0866C6', label: '1000m Deep Abyss' },
];

const TEMPERATURE_PROFILE: [number, number][] = [
  [0, 28.7], [50, 26.2], [100, 23.5], [200, 19.1],
  [300, 15.7], [500, 12.8], [700, 9.2], [1000, 7.2],
];

const ARGO_FLOATS = [
  { id: 'ARGO-2901234', position: [-2.5, -1.0, 1.5] as [number, number, number], depth: 200 },
  { id: 'ARGO-2901456', position: [1.8, -2.2, -1.0] as [number, number, number], depth: 450 },
  { id: 'ARGO-2901789', position: [-0.5, -0.8, 2.0] as [number, number, number], depth: 150 },
  { id: 'ARGO-2901012', position: [2.5, -3.0, -0.5] as [number, number, number], depth: 600 },
  { id: 'ARGO-2901345', position: [-1.5, -1.5, -2.0] as [number, number, number], depth: 300 },
  { id: 'ARGO-2901678', position: [0.5, -3.8, 1.0] as [number, number, number], depth: 800 },
];

// Utility: convert depth (0–1000m) to Three.js Y coordinate
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
  return Math.round((0.2 + depth * 0.0006 + Math.sin(depth * 0.01) * 0.1) * 10) / 10;
}

function getAnomalyAtDepth(depth: number): number {
  // Peak anomaly around thermocline (80–150m)
  if (depth >= 75 && depth <= 200) return +1.8;
  if (depth > 200 && depth <= 400) return +1.1;
  return +0.3;
}

// ─── 3D Components ──────────────────────────────────────────────────────────

function OceanVolumeBox() {
  return (
    <group>
      {/* Outer bounding box with translucent water look */}
      <mesh>
        <boxGeometry args={[VOLUME_WIDTH, VOLUME_HEIGHT, VOLUME_DEPTH]} />
        <meshStandardMaterial
          color="#061d3a"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe edges */}
      <mesh>
        <boxGeometry args={[VOLUME_WIDTH, VOLUME_HEIGHT, VOLUME_DEPTH]} />
        <meshBasicMaterial
          color="#18BFEF"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function DepthPlaneLayers({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {DEPTH_LAYERS.map((layer) => {
        const y = depthToY(layer.depth);
        return (
          <group key={layer.depth} position={[0, y, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[VOLUME_WIDTH * 0.98, VOLUME_DEPTH * 0.98]} />
              <meshStandardMaterial
                color={layer.color}
                transparent
                opacity={0.18}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TemperatureSliceMesh({ visible }: { visible: boolean }) {
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    // Thermal spectrum: surface warm -> deep blue cold
    gradient.addColorStop(0, '#FF4500');
    gradient.addColorStop(0.15, '#FF6B35');
    gradient.addColorStop(0.3, '#FFA500');
    gradient.addColorStop(0.45, '#FFD700');
    gradient.addColorStop(0.6, '#45D6C8');
    gradient.addColorStop(0.8, '#18BFEF');
    gradient.addColorStop(1, '#0866C6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  if (!visible) return null;

  return (
    <group>
      {/* Back thermal wall */}
      <mesh position={[0, 0, -VOLUME_DEPTH / 2 + 0.02]}>
        <planeGeometry args={[VOLUME_WIDTH * 0.98, VOLUME_HEIGHT * 0.98]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Mid cross-section slice */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[VOLUME_WIDTH * 0.96, VOLUME_HEIGHT * 0.96]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Interactive Scanning Laser Plane
function ScanningPlane({
  currentDepth,
  visible,
}: {
  currentDepth: number;
  visible: boolean;
}) {
  const y = depthToY(currentDepth);

  if (!visible) return null;

  return (
    <group position={[0, y, 0]}>
      {/* Glowing scanning plane surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[VOLUME_WIDTH * 0.99, VOLUME_DEPTH * 0.99]} />
        <meshBasicMaterial
          color="#18BFEF"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Laser perimeter border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[VOLUME_WIDTH * 0.48, VOLUME_WIDTH * 0.495, 4]}
        />
        <meshBasicMaterial color="#38BDF8" toneMapped={false} />
      </mesh>

      {/* Scanning light emission */}
      <pointLight color="#18BFEF" intensity={3.5} distance={3.5} />
    </group>
  );
}

// Current Flow Particles
function OceanCurrentParticles({ visible }: { visible: boolean }) {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const list: { pos: THREE.Vector3; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * VOLUME_WIDTH * 0.9,
          (Math.random() - 0.5) * VOLUME_HEIGHT * 0.9,
          (Math.random() - 0.5) * VOLUME_DEPTH * 0.9
        ),
        speed: 0.005 + Math.random() * 0.012,
      });
    }
    return list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || !visible) return;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.pos.x += p.speed;
      if (p.pos.x > VOLUME_WIDTH * 0.45) p.pos.x = -VOLUME_WIDTH * 0.45;

      dummy.position.copy(p.pos);
      dummy.scale.set(0.04, 0.04, 0.04);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#45D6C8" transparent opacity={0.65} />
    </instancedMesh>
  );
}

// ARGO Float 3D Markers
function ArgoFloatMarkers({
  visible,
  onSelectArgo,
}: {
  visible: boolean;
  onSelectArgo: (id: string) => void;
}) {
  if (!visible) return null;

  return (
    <group>
      {ARGO_FLOATS.map((argo) => {
        return (
          <group key={argo.id} position={argo.position}>
            {/* Tether vertical line to surface */}
            <mesh position={[0, (VOLUME_HEIGHT / 2 - argo.position[1]) / 2, 0]}>
              <cylinderGeometry
                args={[0.005, 0.005, VOLUME_HEIGHT / 2 - argo.position[1], 4]}
              />
              <meshBasicMaterial color="#38BDF8" transparent opacity={0.4} />
            </mesh>

            {/* Float probe body */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectArgo(argo.id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <cylinderGeometry args={[0.08, 0.08, 0.28, 12]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Glowing probe beacon */}
            <mesh position={[0, 0.16, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#10B981" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Grid lines across surface
function CoordinateGridMesh({ visible }: { visible: boolean }) {
  const lines = useMemo(() => {
    const list: [number, number, number][][] = [];
    const y = VOLUME_HEIGHT / 2 + 0.01;
    const halfW = VOLUME_WIDTH / 2;
    const halfD = VOLUME_DEPTH / 2;

    for (let x = -halfW; x <= halfW; x += 1.7) {
      list.push([[x, y, -halfD], [x, y, halfD]]);
    }
    for (let z = -halfD; z <= halfD; z += 1.3) {
      list.push([[-halfW, y, z], [halfW, y, z]]);
    }
    return list;
  }, []);

  if (!visible) return null;

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#18BFEF"
          lineWidth={0.5}
          opacity={0.3}
          transparent
        />
      ))}
    </group>
  );
}

export default function OceanXRay() {
  const [depth, setDepth] = useState(100);
  const [showThermalSlice, setShowThermalSlice] = useState(true);
  const [showPlanes, setShowPlanes] = useState(true);
  const [showScanPlane, setShowScanPlane] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [showArgo, setShowArgo] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedArgo, setSelectedArgo] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  const currentTemp = getTemperatureAtDepth(depth);
  const currentUncertainty = getUncertaintyAtDepth(depth);
  const currentAnomaly = getAnomalyAtDepth(depth);

  const resetCamera = (type: 'default' | 'top' | 'side' | 'bottom') => {
    if (!controlsRef.current) return;
    if (type === 'default') {
      controlsRef.current.object.position.set(0, 3, 11);
    } else if (type === 'top') {
      controlsRef.current.object.position.set(0, 11, 0.1);
    } else if (type === 'side') {
      controlsRef.current.object.position.set(11, 0, 0);
    } else if (type === 'bottom') {
      controlsRef.current.object.position.set(0, -9, 6);
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="space-y-4 font-mono-tech">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              3D OCEAN X-RAY LABORATORY
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
              VOLUMETRIC SCANNER
            </span>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Interactive scientific ocean tomography. Move the depth scanner from surface down to 1000m to inspect reconstructed thermal layers, ARGO floats, and subsurface anomalies.
          </p>
        </div>

        {/* Viewport Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">CAMERA:</span>
          {[
            { id: 'default', label: 'Perspective' },
            { id: 'side', label: 'Cross-Section' },
            { id: 'top', label: 'Surface Top' },
            { id: 'bottom', label: 'Abyssal' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => resetCamera(c.id as any)}
              className="px-2.5 py-1 rounded bg-[#030d1d] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Full-Width Ocean Laboratory Canvas */}
      <div className="relative w-full h-[620px] rounded-xl overflow-hidden ocean-panel-glow border-cyan-400/30">
        <Canvas
          camera={{ position: [0, 3, 11], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', background: '#020612' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 8, 7]} intensity={1.5} color="#18BFEF" />
          <directionalLight position={[-6, -4, -5]} intensity={0.5} color="#0866C6" />
          <Stars radius={50} depth={30} count={1200} factor={2} fade />

          {/* 3D Ocean Volume elements */}
          <OceanVolumeBox />
          <DepthPlaneLayers visible={showPlanes} />
          <TemperatureSliceMesh visible={showThermalSlice} />
          <ScanningPlane currentDepth={depth} visible={showScanPlane} />
          <OceanCurrentParticles visible={showFlow} />
          <ArgoFloatMarkers visible={showArgo} onSelectArgo={setSelectedArgo} />
          <CoordinateGridMesh visible={showGrid} />

          <OrbitControls
            ref={controlsRef}
            dampingFactor={0.06}
            enableDamping
            minDistance={4}
            maxDistance={18}
          />
        </Canvas>

        {/* Top Left: Scanner Status Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#040e20]/85 border border-cyan-500/40 text-xs text-cyan-300 backdrop-blur-md">
            <Radio size={14} className="text-cyan-400 animate-pulse" />
            <span className="font-bold">SCANNING PLANE:</span>
            <span className="text-white font-bold">{depth} m</span>
          </div>
          {depth >= 70 && depth <= 120 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
              THERMOCLINE TRANSITION ZONE (~80–100m)
            </span>
          )}
        </div>

        {/* Top Right: Scientific Telemetry Readout Box (Section 11 Specification) */}
        <div className="absolute top-4 right-4 w-72 ocean-panel-glow p-3.5 border-cyan-400/40 backdrop-blur-md shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
            <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer size={14} className="text-red-400" />
              TOMOGRAPHY READOUT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
              DEMO
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-1.5 rounded bg-[#020712] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DEPTH</span>
              <span className="text-base font-bold text-cyan-300">{depth} m</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-[#020712] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">TEMPERATURE</span>
              <span className="text-base font-bold text-white">{currentTemp.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-[#020712] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">ANOMALY</span>
              <span className="text-base font-bold text-red-400">+{currentAnomaly.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-[#020712] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">CONFIDENCE</span>
              <span className="text-xs font-bold text-amber-300">DEMO (±{currentUncertainty.toFixed(1)}°C)</span>
            </div>
          </div>
        </div>

        {/* Selected ARGO float popup */}
        {selectedArgo && (
          <div className="absolute bottom-24 right-4 p-3 rounded-lg bg-[#040e20]/90 border border-emerald-500/40 text-xs text-slate-200 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
              <span>{selectedArgo}</span>
              <button
                onClick={() => setSelectedArgo(null)}
                className="text-slate-400 hover:text-white ml-3 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300">Independent profiling float validating intermediate depths.</p>
          </div>
        )}

        {/* Bottom Bar: Vertical Depth Controller (0m, 250m, 500m, 750m, 1000m) + Scrubbing Slider */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#030d1d]/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
          {/* Depth Preset Chips & Slider */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-1">
              {[0, 250, 500, 750, 1000].map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-2 py-1 rounded text-[11px] font-mono-tech border transition-all cursor-pointer ${
                    depth === d
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_8px_rgba(24,191,239,0.3)]'
                      : 'bg-[#020712] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>

            <div className="flex-1 w-full flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="flex-1 cursor-pointer"
              />
              <span className="text-cyan-300 text-xs font-bold whitespace-nowrap min-w-[75px] text-right">
                {depth}m DEPTH
              </span>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setShowThermalSlice(!showThermalSlice)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showThermalSlice
                  ? 'bg-red-500/20 border-red-400 text-red-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              Thermal Slice
            </button>
            <button
              onClick={() => setShowPlanes(!showPlanes)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showPlanes
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              Depth Planes
            </button>
            <button
              onClick={() => setShowFlow(!showFlow)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showFlow
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              Current Flow
            </button>
            <button
              onClick={() => setShowScanPlane(!showScanPlane)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showScanPlane
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              Scan Laser
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showGrid
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setShowArgo(!showArgo)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                showArgo
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-[#061224] border-slate-700/60 text-slate-400'
              }`}
            >
              ARGO Floats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
