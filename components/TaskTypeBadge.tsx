const STYLES: Record<string, { label: string; className: string }> = {
  PM: {
    label: "Preventive",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PREDICTED_FAILURE: {
    label: "Predicted Failure",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  WORK_ORDER: {
    label: "Work Order",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
};

export function TaskTypeBadge({ type }: { type: string }) {
  const s = STYLES[type] ?? {
    label: type,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}
