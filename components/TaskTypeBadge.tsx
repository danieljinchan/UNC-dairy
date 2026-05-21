const STYLES: Record<string, { label: string; className: string }> = {
  PM: {
    label: "Preventive",
    className: "bg-sky/30 text-navy border-sky/50",
  },
  PREDICTED_FAILURE: {
    label: "Predicted Failure",
    className: "bg-risk-red/15 text-risk-red border-risk-red/30",
  },
  WORK_ORDER: {
    label: "Work Order",
    className: "bg-risk-amber/15 text-risk-amber border-risk-amber/30",
  },
};

export function TaskTypeBadge({ type }: { type: string }) {
  const s = STYLES[type] ?? {
    label: type,
    className: "bg-pale-blue text-navy/70 border-sky/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}
