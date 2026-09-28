import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Layers, Cpu, ArrowRight, RotateCcw,
  Database
} from 'lucide-react';
import type { OceanLocation, OceanObservation } from '../../types/ocean';
import { getOceanObservation } from '../../data/mockData';

interface OceanStateConvergenceProps {
  location: OceanLocation;
  observation?: OceanObservation;
  onStartReconstruction: () => void;
  onBackToParameters?: () => void;
}

export default function OceanStateConvergence({
  location,
  observation,
  onStartReconstruction,
  onBackToParameters,
}: OceanStateConvergenceProps) {
  const obs = observation || getOceanObservation(location);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);

  // Periodic pulse animation for particle stream
  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 100);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // 64 Latent Embedding Dimensions computed deterministically from the 7 surface inputs
  const latentDimensions = useMemo(() => {
    const sst = obs.sst;
    const sss = obs.sss;
    const sla = obs.sla;
    const uC = obs.uCurrent;
    const vC = obs.vCurrent;
    const uW = obs.uWind;
    const vW = obs.vWind;

    const baseSeed = sst * 1.5 + sss * 0.8 + sla * 10 + uC * 4 + vC * 3 + uW * 0.2 + vW * 0.2;

    return Array.from({ length: 64 }, (_, i) => {
      const val = Math.sin(baseSeed + i * 0.38) * 0.85 + Math.cos(baseSeed * 0.5 + i * 0.17) * 0.15;
      return {
        idx: i,
        val: Math.round(val * 1000) / 1000,
        sign: val >= 0 ? '+' : '-',
      };
    });
  }, [obs]);

  const inputChannels = [
    { id: 'SST', name: 'Sea Surface Temp', val: `${obs.sst}°C`, color: '#EF4444' },
    { id: 'SSS', name: 'Sea Surface Salinity', val: `${obs.sss} PSU`, color: '#0866C6' },
    { id: 'SLA', name: 'Sea Level Anomaly', val: `${obs.sla > 0 ? '+' : ''}${obs.sla}m`, color: '#18BFEF' },
    { id: 'U_CURR', name: 'Current U-Vector', val: `${obs.uCurrent > 0 ? '+' : ''}${obs.uCurrent}m/s`, color: '#45D6C8' },
    { id: 'V_CURR', name: 'Current V-Vector', val: `${obs.vCurrent > 0 ? '+' : ''}${obs.vCurrent}m/s`, color: '#45D6C8' },
    { id: 'U_WIND', name: 'Wind U-Vector', val: `${obs.uWind > 0 ? '+' : ''}${obs.uWind}m/s`, color: '#A78BFA' },
    { id: 'V_WIND', name: 'Wind V-Vector', val: `${obs.vWind > 0 ? '+' : ''}${obs.vWind}m/s`, color: '#A78BFA' },
  ];

  return (
    <div className="space-y-4 font-mono-tech">
      {/* Header Banner */}
      <div className="ocean-panel-glow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-cyan-400/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              STAGE 3: OCEAN STATE CONVERGENCE & ENCODING
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/80 text-cyan-200 border border-cyan-500/20 text-[10px]">
              64-D LATENT MANIFOLD
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-display">
            Multi-Source Surface Convergence → Latent Ocean State
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-sans max-w-3xl">
            The seven observable surface parameters converge into the <strong>Ocean State Encoder</strong>.
            This neural architecture extracts nonlinear cross-parameter dependencies, projecting observable surface boundary conditions into a continuous 64-dimensional subsurface ocean representation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onBackToParameters && (
            <button
              onClick={onBackToParameters}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#030d1d] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Back to Parameters</span>
            </button>
          )}

          <button
            onClick={onStartReconstruction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(24,191,239,0.45)] transition-all cursor-pointer animate-pulse"
          >
            <Sparkles size={15} className="text-cyan-200" />
            <span>RECONSTRUCT SUBSURFACE OCEAN</span>
            <ArrowRight size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Convergence Visual Architecture Diagram */}
      <div className="ocean-panel p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
          {/* 1. Left Column: 7 Converging Input Parameters */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold border-b border-cyan-500/20 pb-1">
              <span>7 SURFACE INPUTS</span>
              <span className="text-cyan-300">OBSERVED</span>
            </div>

            {inputChannels.map((ch, idx) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                className="p-2 rounded bg-[#020712]/90 border border-cyan-500/20 hover:border-cyan-400/50 flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ch.color, boxShadow: `0 0 6px ${ch.color}` }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-white block group-hover:text-cyan-200">
                      {ch.id}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate max-w-[100px]">
                      {ch.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-300 font-mono-tech">
                    {ch.val}
                  </span>
                  <span className="text-[9px] text-emerald-400 block">LOCKED</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 2. Middle-Left: Data Streams Flowing into Central Encoder */}
          <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center h-full relative">
            <svg className="w-full h-72 pointer-events-none" viewBox="0 0 60 280">
              {inputChannels.map((ch, i) => {
                const y1 = 20 + i * 40;
                const y2 = 140; // Converge to center
                const offset = (pulsePhase + i * 14) % 100;
                return (
                  <g key={i}>
                    {/* Path */}
                    <path
                      d={`M 5 ${y1} C 35 ${y1}, 30 ${y2}, 55 ${y2}`}
                      fill="none"
                      stroke={ch.color}
                      strokeWidth="1.2"
                      strokeOpacity="0.4"
                    />
                    {/* Flowing Pulse Dot */}
                    <circle
                      cx={5 + (50 * offset) / 100}
                      cy={y1 + (y2 - y1) * Math.sin(((offset / 100) * Math.PI) / 2)}
                      r="2.5"
                      fill={ch.color}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 3. Center Column: Ocean State Encoder & 64-D Latent Embedding */}
          <div className="lg:col-span-5 space-y-4">
            {/* Encoder Core Unit */}
            <div className="p-4 rounded-lg bg-gradient-to-b from-[#081f3d] to-[#020914] border border-cyan-400/40 shadow-[0_0_25px_rgba(24,191,239,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                    <Cpu size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase">
                      OCEAN STATE ENCODER
                    </h3>
                    <p className="text-[10px] text-cyan-300">
                      Multi-Layer Perceptual Deep Neural Network
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Encoder Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
                <div className="p-1.5 rounded bg-[#020712] border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">INPUT DIM</span>
                  <span className="text-white font-bold">7 Channels</span>
                </div>
                <div className="p-1.5 rounded bg-[#020712] border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">MANIFOLD</span>
                  <span className="text-cyan-300 font-bold">64 Latent</span>
                </div>
                <div className="p-1.5 rounded bg-[#020712] border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">LATENCY</span>
                  <span className="text-emerald-400 font-bold">14 ms</span>
                </div>
              </div>

              {/* Latent Vector Visualization (64-D Grid) */}
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1 font-semibold">
                    <Layers size={11} className="text-cyan-400" />
                    LATENT EMBEDDING VECTOR: z ∈ ℝ⁶⁴
                  </span>
                  <span className="text-[9px] text-cyan-400">
                    {selectedDimension !== null ? `z[${selectedDimension}] = ${latentDimensions[selectedDimension].val}` : 'Hover dimension'}
                  </span>
                </div>

                <div className="grid grid-cols-16 sm:grid-cols-16 gap-1 p-2 rounded bg-[#020712] border border-cyan-500/20">
                  {latentDimensions.map((dim) => {
                    const isSelected = selectedDimension === dim.idx;
                    const intensity = Math.abs(dim.val);
                    const isPositive = dim.val >= 0;
                    const bgCol = isPositive
                      ? `rgba(24, 191, 239, ${0.2 + intensity * 0.7})`
                      : `rgba(8, 102, 198, ${0.2 + intensity * 0.7})`;

                    return (
                      <div
                        key={dim.idx}
                        onMouseEnter={() => setSelectedDimension(dim.idx)}
                        onMouseLeave={() => setSelectedDimension(null)}
                        className={`h-5 rounded-xs transition-all cursor-pointer relative group ${
                          isSelected ? 'ring-1 ring-white scale-125 z-20 shadow-[0_0_8px_#ffffff]' : ''
                        }`}
                        style={{ backgroundColor: bgCol }}
                        title={`z[${dim.idx}] = ${dim.val}`}
                      />
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 flex justify-between">
                  <span>z₀ (Surface Coupling)</span>
                  <span>z₃₂ (Thermocline Dynamics)</span>
                  <span>z₆₃ (Abyssal Geostrophy)</span>
                </p>
              </div>
            </div>
          </div>

          {/* 4. Middle-Right: Latent to Depth Decoder Flow */}
          <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center h-full relative">
            <svg className="w-full h-48 pointer-events-none" viewBox="0 0 60 200">
              <path
                d="M 5 100 C 30 100, 30 100, 55 100"
                fill="none"
                stroke="#18BFEF"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle
                cx={5 + (50 * pulsePhase) / 100}
                cy={100}
                r="3"
                fill="#45D6C8"
                className="shadow-[0_0_8px_#45D6C8]"
              />
            </svg>
          </div>

          {/* 5. Right Column: Depth-Aware Decoder Projection */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold border-b border-cyan-500/20 pb-1">
              <span>DEPTH DECODER</span>
              <span className="text-teal-300">15 LEVELS</span>
            </div>

            <div className="p-3 rounded bg-[#020712] border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                <Database size={13} className="text-[#45D6C8]" />
                <span>f_θ(z, depth) → T</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Continuous spatial decoder reconstructs temperature at any continuous depth coordinate from 0 to 1000m.
              </p>

              {/* Discrete Depths Preview Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[0, 20, 50, 100, 200, 500, 1000].map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-0.5 rounded bg-[#06182e] border border-cyan-500/25 text-[9px] text-cyan-200"
                  >
                    {d}m
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-emerald-400">
                <span>Model Target:</span>
                <span className="font-bold">GLORYS12V1</span>
              </div>
            </div>

            <button
              onClick={onStartReconstruction}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.4)] transition-all cursor-pointer"
            >
              <span>EXECUTE DEEP RECONSTRUCTION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
