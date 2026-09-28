interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  operational: { dot: '#22C55E', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
  Available: { dot: '#22C55E', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
  success: { dot: '#22C55E', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
  Operational: { dot: '#22C55E', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
  warning: { dot: '#F59E0B', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Delayed: { dot: '#F59E0B', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Degraded: { dot: '#F59E0B', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  error: { dot: '#EF4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
  Unavailable: { dot: '#EF4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
  Down: { dot: '#EF4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
  pending: { dot: '#9CA3AF', text: '#cbd5e1', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.3)' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const displayLabel = label ?? status;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono-tech uppercase font-medium shadow-sm"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.dot }} />
      {displayLabel}
    </span>
  );
}
