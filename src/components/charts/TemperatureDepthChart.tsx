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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-400 mb-1 font-medium">Depth: {label} m</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value?.toFixed(1)} °C
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TemperatureDepthChart({ data, height = 420, showThermocline = true }: TemperatureDepthChartProps) {
  // Sort by depth ascending for the vertical chart
  const sorted = [...data].sort((a, b) => a.depth - b.depth);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 16, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" horizontal={true} vertical={true} />
        <XAxis
          type="number"
          dataKey="predicted"
          domain={[6, 31]}
          tickCount={7}
          tickFormatter={(v) => `${v}°`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -8, style: { fontSize: 11, fill: '#9ca3af' } }}
        />
        <YAxis
          type="number"
          dataKey="depth"
          domain={[0, 1000]}
          reversed={true}
          ticks={[0, 50, 100, 200, 300, 500, 700, 1000]}
          tickFormatter={(v) => `${v}m`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
        />
        {showThermocline && (
          <ReferenceLine
            y={80}
            stroke="#F59E0B"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: 'Thermocline ~80m', position: 'right', style: { fontSize: 10, fill: '#F59E0B' } }}
          />
        )}
        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicted"
          stroke="#0866C6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#0866C6', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="argoReference"
          name="ARGO Reference"
          stroke="#45D6C8"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={{ r: 3, fill: '#45D6C8', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
