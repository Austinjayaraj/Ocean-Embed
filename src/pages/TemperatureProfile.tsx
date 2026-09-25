import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import DataTable from '../components/common/DataTable';
import TemperatureDepthChart from '../components/charts/TemperatureDepthChart';
import { defaultProfile } from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

function diffColor(diff: number | null): string {
  if (diff === null) return '#9CA3AF';
  const abs = Math.abs(diff);
  if (abs < 0.4) return '#22C55E';
  if (abs < 0.7) return '#F59E0B';
  return '#EF4444';
}

const columns = [
  { key: 'depth', label: 'Depth (m)', render: (v: unknown) => <span className="font-mono font-semibold text-gray-700">{String(v)} m</span> },
  { key: 'predicted', label: 'Predicted (°C)', render: (v: unknown) => <span className="font-mono text-[#0866C6] font-bold">{String(v)}</span> },
  { key: 'argoReference', label: 'ARGO Ref (°C)', render: (v: unknown) => <span className="font-mono text-[#45D6C8]">{v !== null ? String(v) : '—'}</span> },
  {
    key: 'difference',
    label: 'Difference (°C)',
    render: (v: unknown) => {
      const diff = v as number | null;
      return (
        <span className="font-mono font-semibold" style={{ color: diffColor(diff) }}>
          {diff !== null ? (diff > 0 ? '+' : '') + diff : '—'}
        </span>
      );
    },
  },
  { key: 'uncertainty', label: 'Uncertainty (±°C)', render: (v: unknown) => <span className="font-mono text-amber-600">±{String(v)}</span> },
];

export default function TemperatureProfile() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#071B33]">Subsurface Temperature Reconstruction</h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-gray-500">Reconstructed temperature profile from surface observations using OceanEmbed encoder–decoder architecture.</p>
        </div>
      </motion.div>

      {/* Location bar */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-center gap-3 bg-[#071B33] rounded-lg px-4 py-2.5 text-sm"
      >
        <MapPin size={14} className="text-[#18BFEF]" />
        <span className="text-white font-medium">{defaultProfile.location.name}</span>
        <span className="text-gray-400">|</span>
        <span className="text-[#45D6C8] font-mono">{defaultProfile.location.lat}°N, {defaultProfile.location.lng}°E</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-300">18 Sep 2026</span>
      </motion.div>

      {/* Chart */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <SectionHeader title="Temperature vs. Depth" subtitle="Predicted and ARGO reference profiles from surface to 1000m">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block w-6 h-0.5 bg-[#0866C6]" /> Predicted
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block w-6 h-0.5 bg-[#45D6C8] border-dashed" style={{ borderTop: '2px dashed #45D6C8', background: 'none' }} /> ARGO Ref
            </span>
          </div>
        </SectionHeader>
        <TemperatureDepthChart data={defaultProfile.depths} height={480} showThermocline={true} />
        <div className="mt-2 flex items-start gap-2 bg-blue-50 rounded p-3">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Y-axis: Depth (0m = surface, 1000m = deep ocean). Blue solid line = OceanEmbed prediction.
            Cyan dashed line = ARGO independent reference. Amber dashed line = estimated thermocline depth (~80m).
          </p>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <SectionHeader title="Temperature Profile Table" subtitle="All 15 standard depth levels" />
        <DataTable
          columns={columns}
          data={defaultProfile.depths as unknown as Record<string, unknown>[]}
        />
        <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded p-3 border border-amber-100">
          <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> Values shown are illustrative mock data for demonstration purposes. ARGO observations serve as independent validation and are not used in model training. Training target: GLORYS reanalysis.
          </p>
        </div>
      </motion.div>

      {/* Colour legend for difference */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-center gap-4 text-xs text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3"
      >
        <span className="font-medium text-gray-600">Difference colour scale:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> &lt; 0.4°C — Good</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> 0.4–0.7°C — Moderate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> &gt; 0.7°C — High</span>
      </motion.div>
    </div>
  );
}
