import type { RiskLevel } from "@/lib/cost";

const STYLES: Record<RiskLevel, { dot: string; badge: string; label: string }> = {
  RED: {
    dot: "bg-red-600",
    badge: "bg-red-100 text-red-800 border-red-200",
    label: "High Risk",
  },
  YELLOW: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    label: "Watch",
  },
  GREEN: {
    dot: "bg-green-600",
    badge: "bg-green-100 text-green-800 border-green-200",
    label: "Healthy",
  },
};

export function RiskDot({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${STYLES[level].dot}`}
      title={STYLES[level].label}
      aria-label={STYLES[level].label}
    />
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const s = STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
