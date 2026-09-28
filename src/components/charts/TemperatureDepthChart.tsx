import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface DataPoint {
  depth: number;
  predicted: number;
  argoReference?: number | null;
}

interface TemperatureDepthChartProps {
  data: DataPoint[];
  height?: number;
  showThermocline?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="ocean-panel-glow px-3 py-2 text-xs shadow-2xl font-mono-tech border border-cyan-400/40">
        <p className="text-cyan-300 font-semibold mb-1 text-[11px] uppercase tracking-wide">
          DEPTH: {label} m
        </p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold text-xs flex justify-between gap-4">
            <span>{p.name}:</span>
            <span>{p.value?.toFixed(2)} °C</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TemperatureDepthChart({
  data,
  height = 420,
  showThermocline = true,
}: TemperatureDepthChartProps) {
  // Sort by depth ascending for the vertical chart
  const sorted = [...data].sort((a, b) => a.depth - b.depth);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={sorted}
          layout="vertical"
          margin={{ top: 10, right: 28, bottom: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 4" stroke="rgba(24, 191, 239, 0.1)" horizontal={true} vertical={true} />
          <XAxis
            type="number"
            dataKey="predicted"
            domain={[5, 32]}
            tickCount={8}
            tickFormatter={(v) => `${v}°C`}
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
            stroke="rgba(24, 191, 239, 0.2)"
            label={{
              value: 'Temperature (°C)',
              position: 'insideBottom',
              offset: -12,
              style: { fontSize: 10, fill: '#38bdf8', fontFamily: 'JetBrains Mono' },
            }}
          />
          <YAxis
            type="number"
            dataKey="depth"
            domain={[0, 1000]}
            reversed={true}
            ticks={[0, 50, 100, 200, 300, 500, 700, 1000]}
            tickFormatter={(v) => `${v}m`}
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
            stroke="rgba(24, 191, 239, 0.2)"
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: 'JetBrains Mono' }}
            formatter={(value) => <span className="text-slate-300 font-semibold uppercase">{value}</span>}
          />
          {showThermocline && (
            <ReferenceLine
              y={80}
              stroke="#F59E0B"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: 'THERMOCLINE ~80m',
                position: 'right',
                style: { fontSize: 9, fill: '#fbbf24', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' },
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="predicted"
            name="OceanEmbed (Predicted)"
            stroke="#18BFEF"
            strokeWidth={3}
            dot={{ r: 3.5, fill: '#0866C6', stroke: '#18BFEF', strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="argoReference"
            name="ARGO Reference (In-situ)"
            stroke="#45D6C8"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: '#064e3b', stroke: '#45D6C8', strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: '#45D6C8', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
