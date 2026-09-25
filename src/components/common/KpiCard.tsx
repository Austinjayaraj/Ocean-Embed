import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export default function KpiCard({ title, value, unit, icon, color = '#0866C6', className = '' }: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3 ${className}`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{title}</p>
        <p className="text-lg font-bold text-gray-800 leading-tight">
          {value}{unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
