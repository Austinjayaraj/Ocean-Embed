import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  className?: string;
}

export default function DataTable({ columns, data, className = '' }: DataTableProps) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-cyan-500/20 bg-[#061120]/60 ${className}`}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#0b1d36]/90 border-b border-cyan-500/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3.5 py-2.5 font-mono-tech text-[10px] font-semibold text-cyan-300 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-500/10 font-mono-tech">
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors hover:bg-cyan-500/10 ${
                i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3.5 py-2 text-slate-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
