import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  CheckCircle, ArrowRight, Play, Pause, RotateCcw,
  Sparkles, Layers, Box, Compass
} from 'lucide-react';
import type { OceanLocation, TemperatureProfile } from '../../types/ocean';
import { getTemperatureProfile, STANDARD_DEPTHS } from '../../data/mockData';

interface SubsurfaceReconstructionDiveProps {
  location: OceanLocation;
  onCompleteProfile?: () => void;
  onOpenXRay?: () => void;
  onBackToEncoder?: () => void;
}

const RECONSTRUCTION_STEPS = [
  { id: 1, label: 'SURFACE DATA', desc: 'SST, SSS, SLA, Current U/V, Wind U/V locked' },
  { id: 2, label: 'PREPROCESSING', desc: '0.25° spatial grid normalization' },
  { id: 3, label: 'OCEAN STATE ENCODER', desc: 'Latent neural manifold mapping' },
  { id: 4, label: 'OCEAN EMBEDDING', desc: '64-dimensional latent vector generated' },
  { id: 5, label: 'DEPTH DECODER', desc: 'Depth-aware continuous decoder activated' },
  { id: 6, label: 'SUBSURFACE PROFILE', desc: '15 hydrographic depth layers reconstructed' },
];

// 3D Underwater Subsurface Column with Scanning Plane
function UnderwaterColumnScene({
  currentDepth,
  revealedDepths,
}: {
  currentDepth: number;
  revealedDepths: number[];
}) {
  const particlesRef = useRef<THREE.Points>(null);

  // Depth rings at the 15 standard depths
  const depthRings = useMemo(() => {
    return STANDARD_DEPTHS.map((d) => {
      // y from +2.8 (0m) to -2.8 (1000m)
      const y = 2.8 - (d / 1000) * 5.6;
      const ratio = 1 - d / 1000;
      // Thermal spectrum color: surface warm coral -> deep cold cyan
      const col = new THREE.Color().setHSL(0.55 + (1 - ratio) * 0.18, 0.85, 0.45);
      return { depth: d, y, color: col };
    });
  }, []);

  // Bioluminescent ocean particles
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.03;
    }
  });

  const scanPlaneY = 2.8 - (currentDepth / 1000) * 5.6;

  return (
    <group>
      {/* Cylindrical column outer water boundary */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 5.8, 32, 1, true]} />
        <meshStandardMaterial
          color="#041830"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>

      {/* Discrete 15 Depth Rings */}
      {depthRings.map((r) => {
        const isRevealed = revealedDepths.includes(r.depth);
        return (
          <group key={r.depth} position={[0, r.y, 0]}>
            {/* Horizontal disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.95, 32]} />
              <meshBasicMaterial
                color={r.color}
                transparent
                opacity={isRevealed ? 0.35 : 0.05}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Glowing circumference ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.93, 1.98, 32]} />
              <meshBasicMaterial
                color={r.color}
                transparent
                opacity={isRevealed ? 0.9 : 0.15}
              />
            </mesh>
          </group>
        );
      })}

      {/* Active Scanning Plane cutting through ocean volume */}
      <group position={[0, scanPlaneY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.05, 36]} />
          <meshBasicMaterial
            color="#18BFEF"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.03, 2.12, 36]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        <pointLight color="#18BFEF" intensity={3.5} distance={3.5} />
      </group>

      {/* Drifting marine particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial size={0.035} color="#45D6C8" transparent opacity={0.65} />
      </points>
    </group>
  );
}

export default function SubsurfaceReconstructionDive({
  location,
  onCompleteProfile,
  onOpenXRay,
  onBackToEncoder,
}: SubsurfaceReconstructionDiveProps) {
  const profile: TemperatureProfile = useMemo(() => getTemperatureProfile(location), [location]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [diveDepth, setDiveDepth] = useState(0);
  const [isDiving, setIsDiving] = useState(true);
  const [diveFinished, setDiveFinished] = useState(false);

  // Progressive scientific reconstruction sequence (Steps 1 to 6)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < RECONSTRUCTION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  // Downward vertical camera dive through 0m to 1000m
  useEffect(() => {
    if (!isDiving || diveFinished) return;

    const interval = setInterval(() => {
      setDiveDepth((prev) => {
        if (prev >= 1000) {
          setDiveFinished(true);
          return 1000;
        }
        return Math.min(1000, prev + 25);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isDiving, diveFinished]);

  // Which of the 15 standard depths have been reached
  const revealedDepths = useMemo(() => {
    return STANDARD_DEPTHS.filter((d) => d <= diveDepth);
  }, [diveDepth]);

  // Current scanned layer temperature
  const currentTemp = useMemo(() => {
    const exact = profile.depths.find((d) => d.depth === diveDepth);
    if (exact) return exact.predicted;
    // Interpolate
    for (let i = 0; i < profile.depths.length - 1; i++) {
      if (diveDepth >= profile.depths[i].depth && diveDepth <= profile.depths[i + 1].depth) {
        const d0 = profile.depths[i];
        const d1 = profile.depths[i + 1];
        const frac = (diveDepth - d0.depth) / (d1.depth - d0.depth);
        return Math.round((d0.predicted + frac * (d1.predicted - d0.predicted)) * 10) / 10;
      }
    }
    return 7.2;
  }, [diveDepth, profile]);

  const waterBgColor = useMemo(() => {
    const ratio = Math.min(1, diveDepth / 1000);
    // 0m: #031c38 (sunlit surface), 1000m: #01050e (deep abyssal darkness)
    const r = Math.round(THREE.MathUtils.lerp(3, 1, ratio));
    const g = Math.round(THREE.MathUtils.lerp(28, 5, ratio));
    const b = Math.round(THREE.MathUtils.lerp(56, 14, ratio));
    return `rgb(${r}, ${g}, ${b})`;
  }, [diveDepth]);

  const handleRestartDive = () => {
    setActiveStepIndex(0);
    setDiveDepth(0);
    setDiveFinished(false);
    setIsDiving(true);
  };

  return (
    <div className="space-y-4 font-mono-tech">
      {/* Header Banner */}
      <div className="ocean-panel-glow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-cyan-400/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              STAGE 4: AI SUBSURFACE RECONSTRUCTION
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px]">
              0–1000m HYDROGRAPHIC SCANNER
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-display flex items-center gap-2">
            <span>Reconstructing Hidden Ocean Column</span>
            <span className="text-sm font-normal text-slate-400">· {location.name}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-sans">
            The AI decoder penetrates beneath the surface skin, synthesising vertical density stratification and thermocline depth across all 15 hydrographic levels.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onBackToEncoder && (
            <button
              onClick={onBackToEncoder}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#030d1d] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Back to Encoder</span>
            </button>
          )}

          {diveFinished && onCompleteProfile && (
            <button
              onClick={onCompleteProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(24,191,239,0.4)] transition-all cursor-pointer"
            >
              <Layers size={14} className="text-white" />
              <span>INSPECT PROFILE & VALIDATION</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Reconstruction Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 6-Step Reconstruction Progress Sequence (Section 8) */}
        <div className="lg:col-span-4 ocean-panel p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              RECONSTRUCTION PIPELINE
            </span>
            <span className="text-[10px] text-cyan-300 font-mono-tech">
              {activeStepIndex + 1}/6 COMPLETE
            </span>
          </div>

          <div className="space-y-2.5">
            {RECONSTRUCTION_STEPS.map((step, idx) => {
              const isDone = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded border transition-all ${
                    isCurrent
                      ? 'bg-[#031d3d] border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(24,191,239,0.3)]'
                      : isDone
                      ? 'bg-[#03152a]/80 border-cyan-500/35 text-white'
                      : 'bg-[#020712]/60 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wide flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isDone ? 'bg-[#18BFEF] text-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {step.id}
                      </span>
                      {step.label}
                    </span>
                    {isDone ? (
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-bold">
                        <CheckCircle size={12} /> ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono-tech">PENDING</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-6">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Real-time Status Card */}
          <div className="p-3 rounded bg-[#020712] border border-cyan-500/20 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>SCAN PROGRESS:</span>
              <span className="text-cyan-300 font-bold">{((diveDepth / 1000) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-75"
                style={{ width: `${(diveDepth / 1000) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>PENETRATION: <strong className="text-white">{diveDepth}m</strong></span>
              <span>LEVELS: <strong className="text-teal-300">{revealedDepths.length}/15</strong></span>
            </div>
          </div>
        </div>

        {/* Center / Right Column: 3D Vertical Ocean Column & Layer Revealer (Section 9) */}
        <div className="lg:col-span-8 ocean-panel p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Header readout */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-400" />
                VERTICAL HYDROGRAPHIC SOUNDING
              </span>
              <span className="text-[11px] text-cyan-300 font-mono-tech px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">
                DEPTH: <strong className="text-white">{diveDepth} m</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDiving(!isDiving)}
                className="p-1.5 rounded bg-[#030d1d] hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs"
                title={isDiving ? 'Pause Dive' : 'Resume Dive'}
              >
                {isDiving ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={handleRestartDive}
                className="p-1.5 rounded bg-[#030d1d] hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs"
                title="Restart Dive"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas for Vertical Column with dynamic water darkening */}
          <div
            className="relative w-full h-[380px] rounded-lg overflow-hidden border border-cyan-500/20 transition-colors duration-200"
            style={{ backgroundColor: waterBgColor }}
          >
            <Canvas
              camera={{ position: [0, 0, 7.5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={Math.max(0.15, 0.55 - (diveDepth / 1000) * 0.4)} />
              {/* Sunbeam filtering down from ocean surface */}
              <directionalLight
                position={[0, 5, 2]}
                intensity={Math.max(0.05, 1.8 - (diveDepth / 1000) * 1.6)}
                color="#67e8f9"
              />
              {/* Active laser scan point light */}
              <pointLight
                position={[0, 2.8 - (diveDepth / 1000) * 5.6, 1.8]}
                intensity={2.8}
                color="#18BFEF"
                distance={4.2}
              />

              <UnderwaterColumnScene
                currentDepth={diveDepth}
                revealedDepths={revealedDepths}
              />
            </Canvas>

            {/* Depth Overlay HUD on Canvas (left scale) */}
            <div className="absolute top-2 left-2 bottom-2 flex flex-col justify-between text-[9px] font-mono-tech text-slate-400 pointer-events-none">
              <span className="text-red-400 font-bold">0m (Surface: 28.4°C)</span>
              <span className="text-amber-400">100m (Thermocline: 23.5°C)</span>
              <span className="text-teal-400">300m (Intermediate: 15.7°C)</span>
              <span className="text-cyan-400">500m (Mesopelagic: 12.8°C)</span>
              <span className="text-blue-400">1000m (Abyssal Base: 7.2°C)</span>
            </div>

            {/* Floating Live Telemetry (bottom-right on canvas) */}
            <div className="absolute bottom-3 right-3 p-2.5 rounded bg-[#030d1d]/90 border border-cyan-400/40 text-xs backdrop-blur-md font-mono-tech shadow-xl">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                ACTIVE SCANNER
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {currentTemp.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-cyan-300">
                Layer: {diveDepth <= 80 ? 'Mixed Layer' : diveDepth <= 200 ? 'Thermocline Core' : diveDepth <= 700 ? 'Intermediate' : 'Deep Abyssal'}
              </div>
            </div>
          </div>

          {/* Revealed Depths Ribbon (15 Hydrographic Levels) */}
          <div className="mt-3 pt-2 border-t border-cyan-500/15 overflow-x-auto">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5 font-bold">
              15 HYDROGRAPHIC LEVELS REVEALED:
            </span>
            <div className="flex items-center gap-1.5 min-w-max pb-1">
              {STANDARD_DEPTHS.map((d) => {
                const isRevealed = revealedDepths.includes(d);
                const item = profile.depths.find((dp) => dp.depth === d);
                return (
                  <div
                    key={d}
                    className={`px-2 py-1 rounded text-center border transition-all ${
                      isRevealed
                        ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200'
                        : 'bg-[#020712] border-slate-800 text-slate-600'
                    }`}
                  >
                    <p className="text-[9px] font-bold">{d}m</p>
                    <p className="text-[10px] font-bold text-white">
                      {isRevealed && item ? `${item.predicted}°C` : '—'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          {diveFinished && (
            <div className="mt-3 pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle size={14} />
                RECONSTRUCTION COMPLETE: ALL 15 LAYERS REVEALED
              </span>

              <div className="flex items-center gap-2">
                {onCompleteProfile && (
                  <button
                    onClick={onCompleteProfile}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0866C6] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Layers size={13} />
                    <span>View Profile</span>
                  </button>
                )}
                {onOpenXRay && (
                  <button
                    onClick={onOpenXRay}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Box size={13} />
                    <span>Open 3D Ocean X-Ray</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
