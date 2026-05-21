/** Inline horizontal gauge — renders a 0-1 value as a filled track. */
export function DataBar({
  value,
  className = "bg-navy",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
      <div
        className={`h-full rounded-full ${className}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
