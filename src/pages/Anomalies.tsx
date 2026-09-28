import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Filter, Activity, Compass, Layers, CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import RealisticEarth from '../components/ocean/RealisticEarth';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
import { anomalies, anomalyDepthData, getAnomalies } from '../data/mockData';
import type { Anomaly } from '../types/ocean';

const FILTERS = ['All', 'Marine Heatwave', 'High', 'Moderate', 'Low'];

function severityColor(s: string): string {
  switch (s) {
    case 'Marine Heatwave': return '#EF4444';
    case 'High': return '#F97316';
    case 'Moderate': return '#F59E0B';
    case 'Low': return '#22C55E';
    default: return '#94A3B8';
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function Anomalies() {
  const [filter, setFilter] = useState('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly>(anomalies[0]);
  const filtered: Anomaly[] = getAnomalies(filter);

  const counts = {
    total: anomalies.length,
    heatwaves: anomalies.filter(a => a.severity === 'Marine Heatwave').length,
    high: anomalies.filter(a => a.severity === 'High').length,
    moderate: anomalies.filter(a => a.severity === 'Moderate').length,
    low: anomalies.filter(a => a.severity === 'Low').length,
  };

  return (
    <div className="space-y-6 font-mono-tech">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              Subsurface Anomaly Intelligence
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1 max-w-3xl">
            Detecting hidden thermal anomalies, subsurface warming cores, and marine heatwaves across the North Indian Ocean
            by comparing OceanEmbed reconstructions against climatological baselines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            {counts.heatwaves} Marine Heatwave Alerts
          </span>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="TOTAL DETECTIONS" value={counts.total} icon={<Activity size={16} />} color="#18BFEF" />
        <KpiCard title="MARINE HEATWAVES" value={counts.heatwaves} icon={<AlertTriangle size={16} />} color="#EF4444" />
        <KpiCard title="HIGH SEVERITY" value={counts.high} icon={<AlertTriangle size={16} />} color="#F97316" />
        <KpiCard title="MODERATE / LOW" value={counts.moderate + counts.low} icon={<CheckCircle size={16} />} color="#22C55E" />
      </motion.div>

      {/* 4-Step Scientific Deduction Protocol Ribbon */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-4"
      >
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          Anomaly Detection Sequence:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#040e20]/80 border border-slate-800">
            <span className="text-cyan-400 font-bold block text-[11px] mb-1">1. EXPECTED STATE</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              30-year climatological mean temperature field for the target season & depth.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#040e20]/80 border border-slate-800">
            <span className="text-teal-400 font-bold block text-[11px] mb-1">2. RECONSTRUCTED</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              OceanEmbed 0–1000m thermal prediction inferred from today's satellite observations.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#040e20]/80 border border-slate-800">
            <span className="text-amber-400 font-bold block text-[11px] mb-1">3. RESIDUAL FIELD</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Point-wise subtraction: ΔT = T_predicted – T_climatology across 15 standard levels.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#040e20]/80 border border-slate-800">
            <span className="text-red-400 font-bold block text-[11px] mb-1">4. HEATWAVE CLASSIFICATION</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Threshold exceedance (&gt;90th percentile, sustained depth penetration) flagged for alert.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3D Earth Anomaly Field & Selected Anomaly Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D Earth Globe with Anomaly Beacons (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <SectionHeader
            title="Spatial Anomaly Field"
            subtitle="Click an anomaly beacon to inspect thermal deviation and depth penetration"
          />
          <RealisticEarth
            selectedLocation={selectedAnomaly.location}
            onLocationSelect={(loc) => {
              const matched = anomalies.find(a => a.location.name === loc.name);
              if (matched) setSelectedAnomaly(matched);
            }}
            showArgo={false}
            showAnomalies={true}
            style={{ height: 440 }}
          />
        </div>

        {/* Selected Anomaly Deep-Dive Card (5 Cols) */}
        <div className="lg:col-span-5 ocean-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} className="text-cyan-400" />
                Active Incident Dossier
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                style={{
                  color: severityColor(selectedAnomaly.severity),
                  borderColor: severityColor(selectedAnomaly.severity),
                  backgroundColor: `${severityColor(selectedAnomaly.severity)}18`,
                }}
              >
                {selectedAnomaly.severity}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-3">
              {selectedAnomaly.location.name}
            </h3>
            <p className="text-xs text-cyan-300 mt-0.5">
              {selectedAnomaly.location.lat.toFixed(2)}°N, {selectedAnomaly.location.lng.toFixed(2)}°E · {selectedAnomaly.location.region}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">DEPTH PENETRATION</span>
                <span className="text-sm font-bold text-white">
                  {selectedAnomaly.depthRangeMin}–{selectedAnomaly.depthRangeMax} m
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">THERMAL DEVIATION</span>
                <span className="text-sm font-bold" style={{ color: severityColor(selectedAnomaly.severity) }}>
                  +{selectedAnomaly.anomalyValue} °C
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">DETECTION DATE</span>
                <span className="text-xs font-semibold text-slate-200">{selectedAnomaly.detectedDate}</span>
              </div>
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">MODEL CONFIDENCE</span>
                <span className="text-xs font-semibold text-emerald-400">96.4% Verified</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed font-sans bg-black/30 p-3 rounded border border-slate-800">
              {selectedAnomaly.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/15">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Depth-Wise Anomaly Distribution (°C):
            </span>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyDepthData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="depth" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${v}m`} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: '#071527', border: '1px solid #18BFEF', borderRadius: '6px', fontSize: '11px' }}
                    formatter={(val) => [`+${val}°C`, 'Anomaly']}
                  />
                  <Area type="monotone" dataKey="anomaly" stroke="#EF4444" fill="#EF444433" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Anomaly Incidents List */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader
            title="Subsurface Thermal Anomaly Catalog"
            subtitle="Categorized marine heatwave events, intermediate warming zones, and coastal deviations"
          />
          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Filter size={13} className="text-slate-400 mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                  filter === f
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'bg-[#030d1d] border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => {
            const isSelected = selectedAnomaly.id === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setSelectedAnomaly(a)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'ocean-panel-glow border-cyan-400/60 scale-[1.01]'
                    : 'bg-[#040e20]/60 border-slate-800/80 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white truncate">{a.location.region}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-bold uppercase border"
                    style={{
                      color: severityColor(a.severity),
                      borderColor: severityColor(a.severity),
                      backgroundColor: `${severityColor(a.severity)}15`,
                    }}
                  >
                    {a.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  {a.location.name}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Depth: {a.depthRangeMin}–{a.depthRangeMax}m</span>
                  <span className="font-bold" style={{ color: severityColor(a.severity) }}>
                    +{a.anomalyValue} °C
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
