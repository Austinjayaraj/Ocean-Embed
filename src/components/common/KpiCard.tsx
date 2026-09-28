import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
  subtitle?: string;
}

export default function KpiCard({
  title,
  value,
  unit,
  icon,
  color = '#18BFEF',
  className = '',
  subtitle,
}: KpiCardProps) {
  return (
    <div
      className={`ocean-panel p-3.5 relative overflow-hidden transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-0.5 ${className}`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div
        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ background: color }}
      />
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}35`,
            color: color,
            boxShadow: `0 0 10px ${color}20`,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-gray-400 font-mono-tech uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-base font-bold text-white font-mono-tech leading-tight mt-0.5">
            {value}
            {unit && <span className="text-xs font-normal text-cyan-300/70 ml-1">{unit}</span>}
          </p>
          {subtitle && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
