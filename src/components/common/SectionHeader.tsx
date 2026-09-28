import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({ title, subtitle, badge, children }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gradient-to-b from-[#18BFEF] to-[#0866C6] rounded-full" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 bg-cyan-950/70 text-cyan-300 text-[10px] font-mono-tech uppercase font-medium rounded border border-cyan-500/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 ml-3.5">{subtitle}</p>}
      </div>
      {children && <div className="flex-shrink-0 ml-3.5 sm:ml-0">{children}</div>}
    </div>
  );
}
