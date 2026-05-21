import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { PartImage } from "@/components/PartImage";
import { formatCurrency, formatPercent } from "@/lib/cost";
import { getPartDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPartDetail(id);
  if (!detail) notFound();

  const { part, risk, costOfInaction } = detail;
  const { equipment } = part;

  const facts: { label: string; value: string }[] = [
    { label: "Part number", value: part.partNumber },
    { label: "Supplier", value: part.supplier },
    { label: "Unit cost", value: formatCurrency(part.unitCost) },
    { label: "Lead time", value: `${part.leadTimeDays} days` },
    { label: "Last replaced", value: fmtDate(part.lastReplaced) },
    { label: "Next due", value: fmtDate(part.nextDue) },
    {
      label: "Failure probability",
      value: formatPercent(part.failureProbability),
    },
    { label: "Expected downtime", value: `${part.expectedDowntimeMin} min` },
  ];

  const orderHref = `mailto:orders@${part.supplier
    .toLowerCase()
    .replace(/[^a-z]+/g, "")}.example?subject=${encodeURIComponent(
    `Order: ${part.name} (${part.partNumber})`
  )}`;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-navy/60">
        <Link href="/" className="transition-colors hover:text-mid-blue">
          Dashboard
        </Link>
        <span className="mx-2 text-navy/30">/</span>
        <Link
          href={`/process/${equipment.process.id}`}
          className="transition-colors hover:text-mid-blue"
        >
          {equipment.process.name}
        </Link>
        <span className="mx-2 text-navy/30">/</span>
        <Link
          href={`/equipment/${equipment.id}`}
          className="transition-colors hover:text-mid-blue"
        >
          {equipment.name}
        </Link>
        <span className="mx-2 text-navy/30">/</span>
        <span className="font-medium text-navy">{part.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {part.name}
          </h1>
          <p className="mt-1 text-sm text-navy/55">
            Installed on{" "}
            <Link
              href={`/equipment/${equipment.id}`}
              className="text-mid-blue hover:underline"
            >
              {equipment.name}
            </Link>
          </p>
        </div>
        <RiskBadge level={risk} />
      </header>

      {/* Photo + cost callout */}
      <section className="grid gap-5 md:grid-cols-2">
        <PartImage imageRef={part.imageRef} alt={part.name} ratioPad="62.5%" />
        <div
          className={`flex flex-col justify-center rounded-2xl border p-6 shadow-card ${
            risk === "RED"
              ? "border-risk-red/30 bg-risk-red/10"
              : risk === "YELLOW"
                ? "border-risk-amber/30 bg-risk-amber/10"
                : "border-risk-green/30 bg-risk-green/10"
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
            Cost of inaction
          </div>
          <div className="mt-1 text-4xl font-bold text-navy">
            {formatCurrency(costOfInaction)}
          </div>
          <p className="mt-2 text-sm text-navy/65">
            Estimated lost margin if this part fails unplanned:{" "}
            {part.expectedDowntimeMin} min downtime at{" "}
            {equipment.unitsPerHour.toLocaleString()} units/hr and{" "}
            {formatCurrency(equipment.marginPerUnit)} margin/unit.
          </p>
          <a
            href={orderHref}
            className="mt-4 inline-flex w-fit items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mid-blue"
          >
            Order part from {part.supplier}
          </a>
        </div>
      </section>

      {/* Why at risk */}
      {part.whyAtRisk && (
        <section className="unc-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/60">
            Why it&apos;s at risk
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy/80">
            {part.whyAtRisk}
          </p>
        </section>
      )}

      {/* Fact grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="unc-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
              {f.label}
            </div>
            <div className="mt-1 break-words text-sm font-semibold text-navy">
              {f.value}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
