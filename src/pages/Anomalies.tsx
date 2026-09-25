import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter, MapPin, Activity, Clock, Globe, ArrowDown, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
import { anomalies, anomalyDepthData, getAnomalies } from '../data/mockData';
import type { Anomaly } from '../types/ocean';

const FILTERS = ['All', 'High', 'Moderate', 'Low', 'Marine Heatwave'];

function severityColor(s: string): string {
  switch (s) {
    case 'Marine Heatwave': return '#EF4444';
    case 'High': return '#F97316';
    case 'Moderate': return '#F59E0B';
    case 'Low': return '#22C55E';
    default: return '#9CA3AF';
  }
}

function severityBg(s: string): string {
  switch (s) {
    case 'Marine Heatwave': return 'bg-red-50 border-red-200';
    case 'High': return 'bg-orange-50 border-orange-200';
    case 'Moderate': return 'bg-amber-50 border-amber-200';
    case 'Low': return 'bg-green-50 border-green-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

const AnomalyCard = ({ anomaly }: { anomaly: Anomaly }) => (
  <div className={`rounded-lg border p-3 ${severityBg(anomaly.severity)}`}>
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <MapPin size={13} style={{ color: severityColor(anomaly.severity) }} />
        <span className="text-sm font-semibold text-gray-800">{anomaly.location.region}</span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold border"
          style={{ color: severityColor(anomaly.severity), borderColor: severityColor(anomaly.severity), background: `${severityColor(anomaly.severity)}18` }}
        >
          {anomaly.severity}
        </span>
        <span className="text-xs text-amber-600 bg-amber-100 px-1 py-0.5 rounded">DEMO</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
      <div>
        <span className="text-gray-500">Depth: </span>
        <span className="font-mono font-semibold text-gray-700">{anomaly.depthRangeMin}–{anomaly.depthRangeMax} m</span>
      </div>
      <div>
        <span className="text-gray-500">Anomaly: </span>
        <span className="font-mono font-bold" style={{ color: severityColor(anomaly.severity) }}>
          +{anomaly.anomalyValue}°C
        </span>
      </div>
      <div className="col-span-2">
        <span className="text-gray-500">Detected: </span>
        <span className="text-gray-600">{anomaly.detectedDate}</span>
      </div>
    </div>
    <p className="text-xs text-gray-500 leading-snug">{anomaly.description}</p>
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function Anomalies() {
  const [filter, setFilter] = useState('All');
  const filtered: Anomaly[] = getAnomalies(filter);

  const counts = {
    total: anomalies.length,
    high: anomalies.filter(a => a.severity === 'High' || a.severity === 'Marine Heatwave').length,
    moderate: anomalies.filter(a => a.severity === 'Moderate').length,
    low: anomalies.filter(a => a.severity === 'Low').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={20} className="text-amber-500" />
              <h1 className="text-xl font-bold text-[#071B33]">Subsurface Ocean Anomaly Intelligence</h1>
              <DemoBadge />
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              Detect unusual subsurface temperature structures relative to the expected climatological ocean state.
              Anomalies are deviations of the OceanEmbed reconstruction from the GLORYS climatological baseline.
            </p>
          </div>
        </div>
      </motion.div>

      {/* How anomalies work — key story for judges */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-[#071B33] rounded-lg p-4"
      >
        <p className="text-xs font-bold text-[#18BFEF] uppercase tracking-widest mb-3">How Subsurface Anomaly Detection Works</p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Expected Ocean State', sub: 'GLORYS climatological baseline', color: '#0866C6' },
            { label: 'Reconstructed State', sub: 'OceanEmbed output (0–1000m)', color: '#18BFEF' },
            { label: 'Difference', sub: 'Reconstruction − Climatology', color: '#F59E0B' },
            { label: 'Subsurface Anomaly', sub: 'Significant deviations flagged', color: '#EF4444' },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-shrink-0 px-3 py-2 rounded border text-center" style={{ borderColor: `${step.color}50`, background: `${step.color}12` }}>
                <p className="text-white text-xs font-semibold whitespace-nowrap">{step.label}</p>
                <p className="text-white/40 text-xs whitespace-nowrap">{step.sub}</p>
              </div>
              {i < arr.length - 1 && <ArrowDown size={14} className="text-gray-600 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="Active Anomalies" value={counts.total} icon={<Activity size={16} />} color="#F59E0B" />
        <KpiCard title="High / Heatwave" value={counts.high} icon={<AlertTriangle size={16} />} color="#EF4444" />
        <KpiCard title="Regions Monitored" value="24" icon={<Globe size={16} />} color="#0866C6" />
        <KpiCard title="Latest Detection" value="18 Sep 2026" icon={<Clock size={16} />} color="#18BFEF" />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Anomaly depth profile */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <SectionHeader title="Anomaly Magnitude vs. Depth" subtitle="Bay of Bengal – Central | 18 Sep 2026">
            <DemoBadge />
          </SectionHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={anomalyDepthData}
              layout="vertical"
              margin={{ top: 4, right: 20, bottom: 4, left: 16 }}
            >
              <defs>
                <linearGradient id="anomalyGrad" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 3]} tickFormatter={v => `+${v}°C`} tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="depth" reversed domain={[0, 1000]} tickFormatter={v => `${v}m`} tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v: unknown) => [`+${Number(v).toFixed(2)}°C`, 'Anomaly (demo)'] as [string, string]} labelFormatter={(v: unknown) => `Depth: ${v}m`} />
              <Area type="monotone" dataKey="anomaly" stroke="#EF4444" strokeWidth={2} fill="url(#anomalyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Peak anomaly at ~100m depth. Values are illustrative demo data.</p>
        </motion.div>

        {/* Anomaly by region */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <SectionHeader title="Anomaly Count by Region">
            <DemoBadge />
          </SectionHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { region: 'Bay of Bengal', count: anomalies.filter(a => a.location.region === 'Bay of Bengal').length },
                { region: 'Arabian Sea', count: anomalies.filter(a => a.location.region === 'Arabian Sea').length },
                { region: 'Indian Ocean', count: anomalies.filter(a => a.location.region === 'North Indian Ocean').length },
              ]}
              margin={{ top: 4, right: 12, bottom: 28, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} angle={-12} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Anomalies (demo)" radius={[4, 4, 0, 0]}>
                <Cell fill="#0866C6" />
                <Cell fill="#18BFEF" />
                <Cell fill="#45D6C8" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filter + Inventory */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Anomaly Inventory" subtitle={`${filtered.length} records matched — all values are illustrative demo data`} />
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <div className="flex gap-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filter === f ? 'bg-[#0866C6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(a => <AnomalyCard key={a.id} anomaly={a} />)}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
            <p>No anomalies match the selected filter.</p>
          </div>
        )}
      </motion.div>

      {/* Scientific disclaimer */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-start gap-2 bg-amber-50 rounded-lg border border-amber-100 p-3"
      >
        <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Scientific Disclaimer:</strong> All anomaly values, severities, and detections shown here are illustrative mock data
          for prototype demonstration. They do not represent real current ocean anomalies.
          OceanEmbed provides ocean-state information that can support downstream monitoring and decision-support workflows.
          It is <em>not</em> a standalone disaster prediction system.
        </p>
      </motion.div>
    </div>
  );
}
