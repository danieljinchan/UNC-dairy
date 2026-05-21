import type { RiskLevel } from "@/lib/cost";

const STYLES: Record<RiskLevel, { dot: string; badge: string; label: string }> = {
  RED: {
    dot: "bg-risk-red",
    badge: "bg-risk-red/15 text-risk-red border-risk-red/30",
    label: "High Risk",
  },
  YELLOW: {
    dot: "bg-risk-amber",
    badge: "bg-risk-amber/15 text-risk-amber border-risk-amber/30",
    label: "Watch",
  },
  GREEN: {
    dot: "bg-risk-green",
    badge: "bg-risk-green/15 text-risk-green border-risk-green/30",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
