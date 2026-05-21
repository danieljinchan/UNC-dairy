import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
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
    {
      label: "Expected downtime",
      value: `${part.expectedDowntimeMin} min`,
    },
  ];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/process/${equipment.process.id}`}
          className="hover:text-blue-600"
        >
          {equipment.process.name}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/equipment/${equipment.id}`}
          className="hover:text-blue-600"
        >
          {equipment.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{part.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{part.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Installed on{" "}
            <Link
              href={`/equipment/${equipment.id}`}
              className="text-blue-600 hover:underline"
            >
              {equipment.name}
            </Link>
          </p>
        </div>
        <RiskBadge level={risk} />
      </header>

      {/* Cost of inaction callout */}
      <section
        className={`rounded-lg border p-5 ${
          risk === "RED"
            ? "border-red-200 bg-red-50"
            : risk === "YELLOW"
              ? "border-amber-200 bg-amber-50"
              : "border-green-200 bg-green-50"
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cost of inaction
        </div>
        <div className="mt-1 text-3xl font-bold text-slate-900">
          {formatCurrency(costOfInaction)}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Estimated lost margin if this part fails unplanned:{" "}
          {part.expectedDowntimeMin} min downtime at{" "}
          {equipment.unitsPerHour.toLocaleString()} units/hr and{" "}
          {formatCurrency(equipment.marginPerUnit)} margin/unit.
        </p>
      </section>

      {/* Fact grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div
            key={f.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {f.label}
            </div>
            <div className="mt-1 break-words text-sm font-semibold text-slate-900">
              {f.value}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
