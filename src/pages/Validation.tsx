import { motion } from 'framer-motion';
import { CheckCircle, Info, Target, TrendingUp, BarChart2, Hash, ArrowRight } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
import DataTable from '../components/common/DataTable';
import { validationMetrics, validationEntries, scatterValidation, depthWiseError } from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

const columns = [
  {
    key: 'location',
    label: 'Location',
    render: (_v: unknown, row: unknown) => {
      const loc = (row as Record<string, unknown>).location as { name: string };
      return <span className="text-xs text-gray-600">{loc.name}</span>;
    },
  },
  { key: 'depth', label: 'Depth (m)', render: (v: unknown) => <span className="font-mono">{String(v)}m</span> },
  { key: 'predicted', label: 'Predicted (°C)', render: (v: unknown) => <span className="font-mono text-[#0866C6] font-bold">{String(v)}</span> },
  { key: 'argoValue', label: 'ARGO (°C)', render: (v: unknown) => <span className="font-mono text-[#45D6C8]">{String(v)}</span> },
  {
    key: 'error',
    label: 'Error (°C)',
    render: (v: unknown) => {
      const err = v as number;
      const color = err < 0.4 ? '#22C55E' : err < 0.7 ? '#F59E0B' : '#EF4444';
      return <span className="font-mono font-bold" style={{ color }}>±{err}</span>;
    },
  },
  { key: 'date', label: 'Date', render: (v: unknown) => <span className="text-xs text-gray-500">{String(v)}</span> },
];

export default function Validation() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={20} className="text-[#22C55E]" />
          <h1 className="text-xl font-bold text-[#071B33]">Independent ARGO Validation</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-gray-500 max-w-2xl">
          ARGO float observations serve as <strong>independent in-situ measurements</strong> to evaluate OceanEmbed's
          subsurface temperature reconstruction. ARGO data is held out from training — the model learns from GLORYS reanalysis.
        </p>
      </motion.div>

      {/* Critical GLORYS vs ARGO distinction */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-[#071B33] rounded-lg p-4"
      >
        <p className="text-xs font-bold text-[#18BFEF] uppercase tracking-widest mb-3">Training vs. Validation — Critical Distinction</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="rounded-lg p-3 border border-blue-800 bg-blue-900/30">
            <p className="text-xs font-bold text-[#18BFEF] uppercase tracking-wide mb-1">Training Target</p>
            <p className="text-white font-bold text-xl">GLORYS</p>
            <p className="text-gray-400 text-xs mt-1">Physical ocean reanalysis product (CMEMS).
              OceanEmbed is trained to predict GLORYS subsurface profiles from surface-only inputs.
              Used as training labels — <em>not</em> an independent check.</p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <ArrowRight size={20} />
              <span className="text-xs text-gray-500">Evaluated against</span>
            </div>
          </div>
          <div className="rounded-lg p-3 border border-green-800 bg-green-900/20">
            <p className="text-xs font-bold text-[#45D6C8] uppercase tracking-wide mb-1">Independent Validation</p>
            <p className="text-white font-bold text-xl">ARGO</p>
            <p className="text-gray-400 text-xs mt-1">Autonomous profiling floats — in-situ observations
              held out completely from training. Used <em>only</em> for independent evaluation of model skill.</p>
          </div>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="RMSE" value={validationMetrics.rmse} unit="°C" icon={<Target size={16} />} color="#EF4444" />
        <KpiCard title="Bias" value={`+${validationMetrics.bias}`} unit="°C" icon={<TrendingUp size={16} />} color="#F59E0B" />
        <KpiCard title="Correlation" value={validationMetrics.correlation} icon={<BarChart2 size={16} />} color="#22C55E" />
        <KpiCard title="Validated Profiles" value={validationMetrics.validatedProfiles.toLocaleString()} icon={<Hash size={16} />} color="#0866C6" />
      </motion.div>

      {/* Demo disclaimer for metrics */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3"
      >
        <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Illustrative Demo Values:</strong> RMSE {validationMetrics.rmse}°C, Bias +{validationMetrics.bias}°C,
          Correlation {validationMetrics.correlation}, Profiles {validationMetrics.validatedProfiles.toLocaleString()} — these are example target metrics
          for prototype design. Real validation requires running the trained OceanEmbed model against actual held-out ARGO profiles.
        </p>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scatter: Predicted vs ARGO */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <SectionHeader title="Predicted vs. ARGO Reference" subtitle="Perfect agreement = points on the 1:1 diagonal (green dashed)">
            <DemoBadge />
          </SectionHeader>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 20, bottom: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f0f0" />
              <XAxis
                type="number" dataKey="argo" name="ARGO" domain={[6, 30]}
                tick={{ fontSize: 11 }}
                label={{ value: 'ARGO Ref. (°C)', position: 'insideBottom', offset: -8, style: { fontSize: 11, fill: '#9ca3af' } }}
              />
              <YAxis
                type="number" dataKey="predicted" name="Predicted" domain={[6, 30]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Predicted (°C)', angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 11, fill: '#9ca3af' } }}
              />
              <ReferenceLine segment={[{ x: 6, y: 6 }, { x: 30, y: 30 }]} stroke="#22C55E" strokeDasharray="6 3" strokeWidth={1.5} />
              <Tooltip formatter={(v: unknown, n: unknown) => [`${Number(v).toFixed(1)}°C`, String(n)] as [string, string]} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterValidation} fill="#0866C6" fillOpacity={0.7} r={5} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-1">Illustrative scatter — points cluster near 1:1 line, indicating good reconstruction skill.</p>
        </motion.div>

        {/* Depth-wise RMSE */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <SectionHeader title="Depth-wise Reconstruction Error (RMSE)" subtitle="Error by standard depth level">
            <DemoBadge />
          </SectionHeader>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={depthWiseError}
              layout="vertical"
              margin={{ top: 4, right: 20, bottom: 4, left: 44 }}
            >
              <defs>
                <linearGradient id="rmseGrad" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#0866C6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0866C6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 1.8]} tickFormatter={v => `${v}°C`} tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="depth" reversed domain={[0, 1000]} tickFormatter={v => `${v}m`} tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(2)}°C`, 'RMSE (demo)'] as [string, string]} labelFormatter={(v: unknown) => `Depth: ${v}m`} />
              <Area type="monotone" dataKey="rmse" stroke="#0866C6" strokeWidth={2} fill="url(#rmseGrad)" name="RMSE" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-1">RMSE peaks near the thermocline (~100–200m), where thermal gradients are steepest.</p>
        </motion.div>
      </div>

      {/* Validation table */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <SectionHeader title="Validation Sample" subtitle={`Showing ${validationEntries.length} of ${validationMetrics.validatedProfiles} illustrative profiles`}>
          <DemoBadge />
        </SectionHeader>
        <DataTable
          columns={columns}
          data={validationEntries as unknown as Record<string, unknown>[]}
        />
      </motion.div>
    </div>
  );
}
