interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  operational: { dot: '#22C55E', text: '#166534', bg: '#f0fdf4' },
  Available: { dot: '#22C55E', text: '#166534', bg: '#f0fdf4' },
  success: { dot: '#22C55E', text: '#166534', bg: '#f0fdf4' },
  warning: { dot: '#F59E0B', text: '#92400e', bg: '#fffbeb' },
  Delayed: { dot: '#F59E0B', text: '#92400e', bg: '#fffbeb' },
  error: { dot: '#EF4444', text: '#991b1b', bg: '#fef2f2' },
  Unavailable: { dot: '#EF4444', text: '#991b1b', bg: '#fef2f2' },
  Down: { dot: '#EF4444', text: '#991b1b', bg: '#fef2f2' },
  pending: { dot: '#9CA3AF', text: '#374151', bg: '#f9fafb' },
  Degraded: { dot: '#F59E0B', text: '#92400e', bg: '#fffbeb' },
  Operational: { dot: '#22C55E', text: '#166534', bg: '#f0fdf4' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const displayLabel = label ?? status;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {displayLabel}
    </span>
  );
}
