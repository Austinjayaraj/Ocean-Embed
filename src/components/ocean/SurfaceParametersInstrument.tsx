import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Thermometer, Droplets, TrendingUp, Navigation, Wind,
  Compass, ArrowRight, ShieldCheck, Activity, Layers, RotateCcw
} from 'lucide-react';
import type { OceanLocation, OceanObservation } from '../../types/ocean';
import { getOceanObservation } from '../../data/mockData';

interface SurfaceParametersInstrumentProps {
  location: OceanLocation;
  observation?: OceanObservation;
  onProceedToConvergence?: () => void;
  onBackToGlobe?: () => void;
}

// ─── Micro-Visualizer: Current Flow Particles ────────────────────────
function CurrentVectorCanvas({ u, v }: { u: number; v: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;
    const numParticles = 24;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: (0.4 + Math.random() * 0.6) * 1.5,
      size: 1.2 + Math.random() * 1.2,
      alpha: 0.2 + Math.random() * 0.7,
    }));

    const mag = Math.sqrt(u * u + v * v) || 0.1;
    const dirX = u / mag;
    const dirY = -v / mag; // Inverted for screen Y

    const render = () => {
      ctx.fillStyle = 'rgba(3, 10, 20, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Draw faint vector guide axis
      ctx.strokeStyle = 'rgba(24, 191, 239, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - dirX * 25, height / 2 - dirY * 25);
      ctx.lineTo(width / 2 + dirX * 25, height / 2 + dirY * 25);
      ctx.stroke();

      // Draw particles
      particles.forEach((p) => {
        p.x += dirX * p.speed;
        p.y += dirY * p.speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(69, 214, 200, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Directional arrow head in center
      const cx = width / 2;
      const cy = height / 2;
      ctx.fillStyle = '#45D6C8';
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [u, v]);

  return <canvas ref={canvasRef} width={120} height={48} className="rounded bg-[#020712] border border-cyan-500/20" />;
}

// ─── Micro-Visualizer: Wind Stream Vector ─────────────────────────────
function WindVectorCanvas({ u, v }: { u: number; v: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;
    const numParticles = 28;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: (0.8 + Math.random() * 1.2) * 1.8,
      length: 5 + Math.random() * 8,
      alpha: 0.25 + Math.random() * 0.65,
    }));

    const mag = Math.sqrt(u * u + v * v) || 0.1;
    const dirX = u / mag;
    const dirY = -v / mag;

    const render = () => {
      ctx.fillStyle = 'rgba(3, 10, 20, 0.3)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += dirX * p.speed;
        p.y += dirY * p.speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.strokeStyle = `rgba(167, 139, 250, ${p.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - dirX * p.length, p.y - dirY * p.length);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [u, v]);

  return <canvas ref={canvasRef} width={120} height={48} className="rounded bg-[#020712] border border-purple-500/20" />;
}

// ─── Micro-Visualizer: SST Temperature Gradient Bar ──────────────────
function SstGradientGauge({ value }: { value: number }) {
  // Range from 22°C to 32°C
  const min = 22;
  const max = 32;
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-1.5">
      <div className="relative h-3 w-full rounded-sm overflow-hidden border border-red-500/30"
        style={{
          background: 'linear-gradient(90deg, #18BFEF 0%, #45D6C8 30%, #F59E0B 70%, #EF4444 100%)',
        }}
      >
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] -translate-x-1/2"
          style={{ left: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono-tech text-slate-400">
        <span>22.0°C</span>
        <span className="text-white font-bold">{value.toFixed(1)}°C CURRENT</span>
        <span>32.0°C</span>
      </div>
    </div>
  );
}

// ─── Micro-Visualizer: SSS Salinity Gauge ─────────────────────────────
function SssSalinityGauge({ value }: { value: number }) {
  // Salinity range from 31.0 to 37.0 PSU
  const min = 31.0;
  const max = 37.0;
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-1.5">
      <div className="relative h-3 w-full rounded-sm overflow-hidden border border-blue-500/30"
        style={{
          background: 'linear-gradient(90deg, #38BDF8 0%, #0866C6 50%, #042f66 100%)',
        }}
      >
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-200 shadow-[0_0_8px_#38BDF8] -translate-x-1/2"
          style={{ left: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono-tech text-slate-400">
        <span>31.0 (Fresh)</span>
        <span className="text-cyan-300 font-bold">{value.toFixed(1)} PSU</span>
        <span>37.0 (Saline)</span>
      </div>
    </div>
  );
}

// ─── Micro-Visualizer: Sea Level Anomaly Bipolar Deviation ───────────
function SlaDeviationGauge({ value }: { value: number }) {
  // Range from -0.30m to +0.30m
  const maxAbs = 0.30;
  const isPos = value >= 0;
  const halfPercent = Math.min(100, (Math.abs(value) / maxAbs) * 50);

  return (
    <div className="w-full space-y-1.5">
      <div className="relative h-3 w-full rounded-sm bg-[#040e20] border border-cyan-500/30 overflow-hidden">
        {/* Center zero line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-500 z-10" />

        {/* Deviation bar */}
        {isPos ? (
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_8px_rgba(24,191,239,0.5)]"
            style={{ left: '50%', width: `${halfPercent}%` }}
          />
        ) : (
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-l from-indigo-500 to-blue-500 shadow-[0_0_8px_rgba(8,102,198,0.5)]"
            style={{ right: '50%', width: `${halfPercent}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[9px] font-mono-tech text-slate-400">
        <span>-0.30m</span>
        <span className="text-teal-300 font-bold">{value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)} m</span>
        <span>+0.30m</span>
      </div>
    </div>
  );
}

export default function SurfaceParametersInstrument({
  location,
  observation,
  onProceedToConvergence,
  onBackToGlobe,
}: SurfaceParametersInstrumentProps) {
  const obs = observation || getOceanObservation(location);

  // Compute derived current and wind magnitudes
  const currentMagnitude = Math.round(Math.sqrt(obs.uCurrent * obs.uCurrent + obs.vCurrent * obs.vCurrent) * 100) / 100;
  const currentHeading = Math.round((Math.atan2(obs.uCurrent, obs.vCurrent) * (180 / Math.PI) + 360) % 360);

  const windMagnitude = Math.round(Math.sqrt(obs.uWind * obs.uWind + obs.vWind * obs.vWind) * 10) / 10;
  const windHeading = Math.round((Math.atan2(obs.uWind, obs.vWind) * (180 / Math.PI) + 360) % 360);

  const parameters = [
    {
      id: 'SST',
      name: 'Sea Surface Temperature',
      abbr: 'SST',
      value: obs.sst,
      unit: '°C',
      status: obs.sst > 28.5 ? 'ELEVATED / WARM POOL' : 'NORMAL RANGE',
      statusColor: obs.sst > 28.5 ? '#F59E0B' : '#22C55E',
      source: 'CMEMS OSTIA L4 Multi-Sensor Satellite IR',
      component: <SstGradientGauge value={obs.sst} />,
      icon: <Thermometer size={16} className="text-red-400" />,
      accent: '#EF4444',
      badge: 'THERMAL SKIN',
    },
    {
      id: 'SSS',
      name: 'Sea Surface Salinity',
      abbr: 'SSS',
      value: obs.sss,
      unit: 'PSU',
      status: obs.sss < 33.5 ? 'RIVER RUNOFF PLUME' : 'NORMAL SALINITY',
      statusColor: '#0866C6',
      source: 'SMOS / SMAP L4 Microwave Radiometry',
      component: <SssSalinityGauge value={obs.sss} />,
      icon: <Droplets size={16} className="text-blue-400" />,
      accent: '#0866C6',
      badge: 'HALINE LAYER',
    },
    {
      id: 'SLA',
      name: 'Sea Level Anomaly',
      abbr: 'SLA',
      value: obs.sla > 0 ? `+${obs.sla.toFixed(2)}` : obs.sla.toFixed(2),
      unit: 'm',
      status: obs.sla > 0.08 ? 'POSITIVE THERMAL EXPANSION' : 'NORMAL TOPOGRAPHY',
      statusColor: '#18BFEF',
      source: 'Sentinel-3 / Jason-CS Radar Altimetry',
      component: <SlaDeviationGauge value={obs.sla} />,
      icon: <TrendingUp size={16} className="text-teal-400" />,
      accent: '#18BFEF',
      badge: 'DYNAMIC TOPOGRAPHY',
    },
    {
      id: 'CURRENT_U',
      name: 'Surface Current U (Eastward)',
      abbr: 'CURRENT U',
      value: obs.uCurrent > 0 ? `+${obs.uCurrent.toFixed(2)}` : obs.uCurrent.toFixed(2),
      unit: 'm/s',
      status: 'GEOSTROPHIC JET',
      statusColor: '#45D6C8',
      source: 'OSCAR / CMEMS Surface Velocity Grids',
      component: <CurrentVectorCanvas u={obs.uCurrent} v={0} />,
      icon: <Navigation size={16} className="text-[#45D6C8]" />,
      accent: '#45D6C8',
      badge: 'ZONAL DRIFT',
    },
    {
      id: 'CURRENT_V',
      name: 'Surface Current V (Northward)',
      abbr: 'CURRENT V',
      value: obs.vCurrent > 0 ? `+${obs.vCurrent.toFixed(2)}` : obs.vCurrent.toFixed(2),
      unit: 'm/s',
      status: 'MERIDIONAL FLUX',
      statusColor: '#45D6C8',
      source: 'OSCAR / CMEMS Surface Velocity Grids',
      component: <CurrentVectorCanvas u={0} v={obs.vCurrent} />,
      icon: <Navigation size={16} className="text-[#45D6C8]" style={{ transform: 'rotate(90deg)' }} />,
      accent: '#45D6C8',
      badge: 'MERIDIONAL DRIFT',
    },
    {
      id: 'WIND_U',
      name: 'Surface Wind U (Zonal 10m)',
      abbr: 'WIND U',
      value: obs.uWind > 0 ? `+${obs.uWind.toFixed(1)}` : obs.uWind.toFixed(1),
      unit: 'm/s',
      status: 'MONSOONAL WESTERLY',
      statusColor: '#A78BFA',
      source: 'ERA5 Reanalysis / MetOp Scatterometers',
      component: <WindVectorCanvas u={obs.uWind} v={0} />,
      icon: <Wind size={16} className="text-purple-400" />,
      accent: '#A78BFA',
      badge: 'ZONAL STRESS',
    },
    {
      id: 'WIND_V',
      name: 'Surface Wind V (Meridional 10m)',
      abbr: 'WIND V',
      value: obs.vWind > 0 ? `+${obs.vWind.toFixed(1)}` : obs.vWind.toFixed(1),
      unit: 'm/s',
      status: 'CROSS-EQUATORIAL FLOW',
      statusColor: '#A78BFA',
      source: 'ERA5 Reanalysis / MetOp Scatterometers',
      component: <WindVectorCanvas u={0} v={obs.vWind} />,
      icon: <Wind size={16} className="text-purple-400" style={{ transform: 'rotate(90deg)' }} />,
      accent: '#A78BFA',
      badge: 'MERIDIONAL STRESS',
    },
  ];

  return (
    <div className="space-y-4 font-mono-tech">
      {/* Target Observation Header Banner */}
      <div className="ocean-panel-glow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-cyan-400/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              STAGE 2: SURFACE OBSERVATION STATION
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              0.25° MULTI-SENSOR RECEPTOR
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-display flex items-center gap-2">
            <span>{location.name}</span>
            <span className="text-sm font-normal text-slate-400">
              ({location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E)
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-sans">
            Seven synchronized surface variables locked. These observables represent the boundary conditions required by the Ocean State Encoder.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onBackToGlobe && (
            <button
              onClick={onBackToGlobe}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#030d1d] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Back to Globe</span>
            </button>
          )}

          {onProceedToConvergence && (
            <button
              onClick={onProceedToConvergence}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(24,191,239,0.35)] transition-all cursor-pointer"
            >
              <Layers size={14} className="text-cyan-200" />
              <span>CONVERGE INTO OCEAN STATE ENCODER</span>
              <ArrowRight size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Surface Instrument Grid - 7 Scientific Instruments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {parameters.map((param, index) => (
          <motion.div
            key={param.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="instrument-card p-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded bg-[#030d1d] border border-cyan-500/25">
                    {param.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white tracking-wider block">
                      {param.abbr}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate max-w-[130px]">
                      {param.name}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#020712] border border-slate-800 text-[9px] text-cyan-300 font-semibold">
                  {param.badge}
                </span>
              </div>

              {/* Value & Unit Instrument Display */}
              <div className="my-2.5 px-3 py-2 rounded bg-[#020712]/90 border border-cyan-500/15 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {param.value}
                  </span>
                  <span className="text-xs text-cyan-300 ml-1.5 font-normal">
                    {param.unit}
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: `${param.statusColor}20`,
                    color: param.statusColor,
                    border: `1px solid ${param.statusColor}40`,
                  }}
                >
                  {param.status}
                </span>
              </div>

              {/* Small Micro-Visualization */}
              <div className="my-2">
                {param.component}
              </div>
            </div>

            {/* Sensor Source & Demo Indicator */}
            <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[9px] text-slate-400">
              <span className="truncate max-w-[170px]" title={param.source}>
                {param.source}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={10} /> VERIFIED
              </span>
            </div>
          </motion.div>
        ))}

        {/* Vector Field Synthesis Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="instrument-card p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#081e3d]/80 to-[#020712]/90 border-cyan-400/40"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-400/40">
                  <Compass size={16} className="text-[#18BFEF]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white tracking-wider block">
                    TOTAL VELOCITY
                  </span>
                  <span className="text-[9px] text-cyan-300 block">
                    Current & Wind Vector Synthesis
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[9px] text-cyan-200 border border-cyan-400/40 font-bold">
                SYNTHESIS
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <div className="p-2 rounded bg-[#020712] border border-cyan-500/20 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Current Speed:</span>
                  <span className="text-emerald-400 font-bold">{currentMagnitude} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] mt-0.5">
                  <span>Flow Heading:</span>
                  <span className="text-white">{currentHeading}° azimuth</span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#020712] border border-purple-500/20 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Wind Speed (10m):</span>
                  <span className="text-purple-300 font-bold">{windMagnitude} m/s</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] mt-0.5">
                  <span>Wind Heading:</span>
                  <span className="text-white">{windHeading}° azimuth</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[9px]">
            <span className="text-slate-400">Boundary Condition Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Activity size={10} /> 100% READY
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
