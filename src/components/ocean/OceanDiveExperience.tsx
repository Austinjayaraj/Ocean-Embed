import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, RefreshCw, Compass, Thermometer, ShieldCheck } from 'lucide-react';
import type { OceanLocation, TemperatureProfile } from '../../types/ocean';
import { getTemperatureProfile, getOceanObservation } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

interface OceanDiveExperienceProps {
  location: OceanLocation;
  isOpen: boolean;
  onClose: () => void;
}

// Dive depth sequence
const DIVE_STAGES = [
  { depth: 0, label: 'Surface Boundary', temp: 28.7, phase: 'SURFACE' },
  { depth: 50, label: 'Mixed Layer Base', temp: 26.2, phase: 'UPPER OCEAN' },
  { depth: 100, label: 'Thermocline Core', temp: 23.5, phase: 'THERMOCLINE' },
  { depth: 250, label: 'Intermediate Water', temp: 17.8, phase: 'SUBSURFACE' },
  { depth: 500, label: 'Mesopelagic Layer', temp: 12.8, phase: 'DEEP OCEAN' },
  { depth: 750, label: 'Bathypelagic Transition', temp: 9.2, phase: 'DEEP OCEAN' },
  { depth: 1000, label: 'Abyssal Reconstructed Base', temp: 7.2, phase: 'ABYSSAL RECONSTRUCTION' },
];

// 3D Underwater Subsurface Column
function SubsurfaceColumn({ currentDepth }: { currentDepth: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Instanced depth discs
  const discs = useMemo(() => {
    return [0, 50, 100, 250, 500, 750, 1000].map((d) => {
      const y = 3 - (d / 1000) * 6; // from y=3 (0m) to y=-3 (1000m)
      const ratio = 1 - d / 1000;
      // Color from warm coral (surface) to deep cyan/blue (1000m)
      const col = new THREE.Color().setHSL(0.55 + (1 - ratio) * 0.15, 0.9, 0.45);
      return { depth: d, y, color: col };
    });
  }, []);

  // Floating bioluminescent ocean particles
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  const scanPlaneY = 3 - (currentDepth / 1000) * 6;

  return (
    <group>
      {/* Ocean column water boundary */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 6.2, 32, 1, true]} />
        <meshStandardMaterial
          color="#062244"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>

      {/* Depth level horizontal discs */}
      {discs.map((disc) => (
        <group key={disc.depth} position={[0, disc.y, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.0, 32]} />
            <meshBasicMaterial
              color={disc.color}
              transparent
              opacity={currentDepth >= disc.depth ? 0.35 : 0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.98, 2.02, 32]} />
            <meshBasicMaterial
              color={disc.color}
              transparent
              opacity={currentDepth >= disc.depth ? 0.8 : 0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Active Scanning Plane cutting through column */}
      <group position={[0, scanPlaneY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.15, 36]} />
          <meshBasicMaterial
            color="#18BFEF"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight color="#18BFEF" intensity={3} distance={4} />
      </group>

      {/* Floating particles */}
      <points ref={pointsRef} geometry={particleGeo}>
        <pointsMaterial size={0.035} color="#45D6C8" transparent opacity={0.6} />
      </points>
    </group>
  );
}

export default function OceanDiveExperience({
  location,
  isOpen,
  onClose,
}: OceanDiveExperienceProps) {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [diveComplete, setDiveComplete] = useState(false);

  const currentStage = DIVE_STAGES[stageIndex];
  const profile: TemperatureProfile = useMemo(
    () => getTemperatureProfile(location),
    [location]
  );
  const obs = useMemo(() => getOceanObservation(location), [location]);

  // Progressive depth dive timer
  useEffect(() => {
    if (!isOpen) {
      setStageIndex(0);
      setDiveComplete(false);
      return;
    }

    setDiveComplete(false);
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      if (current < DIVE_STAGES.length) {
        setStageIndex(current);
      } else {
        clearInterval(interval);
        setDiveComplete(true);
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [isOpen]);

  const restartDive = () => {
    setStageIndex(0);
    setDiveComplete(false);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < DIVE_STAGES.length) {
        setStageIndex(current);
      } else {
        clearInterval(interval);
        setDiveComplete(true);
      }
    }, 1100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl h-[88vh] ocean-panel-glow flex flex-col overflow-hidden border-cyan-400/40"
        >
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 bg-[#030d1d]/90 font-mono-tech">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div>
                <div className="text-xs font-bold text-cyan-300 tracking-wider flex items-center gap-2">
                  <span>OCEANEMBED SUBSURFACE DIVE PROTOCOL</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                    AI RECONSTRUCTION
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <Compass size={11} className="text-cyan-400" />
                  <span>{location.name}</span>
                  <span>({location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={restartDive}
                className="p-1.5 rounded hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                title="Restart Dive Sequence"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Central Visualization Split */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
            {/* 3D Ocean Volume Viewport */}
            <div className="lg:col-span-7 relative h-full bg-[#020713]">
              <Canvas
                camera={{ position: [0, 0, 6.2], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ width: '100%', height: '100%' }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 5]} intensity={1.5} color="#18BFEF" />
                <pointLight position={[0, 0, 0]} intensity={1.5} color="#45D6C8" />
                <SubsurfaceColumn currentDepth={currentStage.depth} />
              </Canvas>

              {/* Water Depth Gauge Indicator (Overlay left) */}
              <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between font-mono-tech pointer-events-none">
                {DIVE_STAGES.map((s, idx) => {
                  const isActive = idx === stageIndex;
                  const isPassed = idx <= stageIndex;
                  return (
                    <div
                      key={s.depth}
                      className={`flex items-center gap-2 transition-all ${
                        isActive
                          ? 'text-cyan-300 font-bold scale-110 translate-x-1'
                          : isPassed
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive
                            ? 'bg-cyan-300 shadow-[0_0_8px_#18BFEF]'
                            : isPassed
                            ? 'bg-cyan-700'
                            : 'bg-slate-800'
                        }`}
                      />
                      <span className="text-[11px]">{s.depth}m</span>
                    </div>
                  );
                })}
              </div>

              {/* Live Telemetry HUD (Overlay bottom) */}
              <div className="absolute bottom-4 left-16 right-4 flex items-center justify-between p-3 rounded-lg bg-[#040e20]/80 border border-cyan-500/30 backdrop-blur-md font-mono-tech">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">CURRENT DEPTH</span>
                  <span className="text-xl font-bold text-cyan-300">{currentStage.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">PREDICTED TEMP</span>
                  <span className="text-xl font-bold text-emerald-300">{currentStage.temp.toFixed(1)} °C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">LAYER CLASSIFICATION</span>
                  <span className="text-xs font-semibold text-slate-200">{currentStage.phase}</span>
                </div>
              </div>
            </div>

            {/* Right Information & Reconstruction Telemetry Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 border-t lg:border-t-0 lg:border-l border-cyan-500/20 bg-[#040e20]/95 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <h3 className="text-sm font-bold text-white font-mono-tech uppercase tracking-wider flex items-center gap-2">
                    <Thermometer size={15} className="text-cyan-400" />
                    AI Reconstruction Status
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono-tech rounded border uppercase ${
                      diveComplete
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                    }`}
                  >
                    {diveComplete ? 'COMPLETE' : 'SCANNING 0–1000M'}
                  </span>
                </div>

                {/* 7 Surface Observation inputs */}
                <div className="mt-4">
                  <p className="text-[10px] text-slate-400 uppercase font-mono-tech tracking-wider mb-2">
                    Surface Inputs (7 Variables)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
                    <div className="p-2 rounded bg-black/40 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">SST</span>
                      <span className="text-red-400 font-bold">{obs.sst} °C</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">SSS</span>
                      <span className="text-cyan-400 font-bold">{obs.sss} PSU</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">SLA</span>
                      <span className="text-teal-300 font-bold">{obs.sla > 0 ? '+' : ''}{obs.sla} m</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">CURRENT VEC</span>
                      <span className="text-emerald-400 font-bold">{obs.currentSpeed} m/s</span>
                    </div>
                  </div>
                </div>

                {/* Reconstructed Profile Snippet */}
                <div className="mt-4">
                  <p className="text-[10px] text-slate-400 uppercase font-mono-tech tracking-wider mb-2">
                    Reconstructed 15-Level Thermal Structure
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 font-mono-tech text-xs">
                    {profile.depths.slice(0, stageIndex + 4).map((d) => (
                      <div
                        key={d.depth}
                        className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 border border-slate-800/80 text-[11px]"
                      >
                        <span className="text-slate-400">{d.depth}m</span>
                        <span className="text-cyan-300 font-bold">{d.predicted.toFixed(1)} °C</span>
                        <span className="text-[10px] text-slate-500">ARGO: {d.argoReference?.toFixed(1) ?? '—'}°</span>
                        <span className="text-[10px] text-amber-400">±{d.uncertainty}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-mono-tech font-bold uppercase mb-1">
                    <ShieldCheck size={13} /> OceanEmbed Transformation
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Satellite surface observations were converted into a 64-dimensional latent embedding,
                    reconstructing the full 0–1000m thermal column with independent ARGO validation.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-cyan-500/20 space-y-2 font-mono-tech">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/ocean-xray');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.4)] hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>ENTER FULL 3D OCEAN X-RAY</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/profile');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>VIEW 15-DEPTH PROFILE & DATA TABLE</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
