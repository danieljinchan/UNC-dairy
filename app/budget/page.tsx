import Link from "next/link";
import { RiskBadge } from "@/components/RiskBadge";
import { formatCurrency, formatPercent } from "@/lib/cost";
import { getFacility, getAllPartsWithCost } from "@/lib/queries";

export const dynamic = "force-dynamic";

const HORIZONS = [
  { days: 90, label: "90 days" },
  { days: 180, label: "180 days" },
  { days: 365, label: "365 days" },
];

function daysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function BudgetPage() {
  const facility = await getFacility();
  if (!facility) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        No facility found. Run <code className="font-mono">npm run seed</code>{" "}
        to load sample data.
      </div>
    );
  }

  const parts = await getAllPartsWithCost(facility.id);

  // Predicted failures = parts with elevated failure probability.
  const predictedFailures = parts
    .filter((p) => p.failureProbability >= 0.3)
    .map((p) => ({ ...p, due: daysUntil(p.nextDue) }))
    .sort((a, b) => a.due - b.due);

  const horizons = HORIZONS.map((h) => {
    const inHorizon = predictedFailures.filter(
      (p) => p.due <= h.days && p.due >= -3650
    );
    const total = inHorizon.reduce((sum, p) => sum + p.costOfInaction, 0);
    const balance = facility.annualMaintenanceBudget - total;
    return { ...h, count: inHorizon.length, total, balance };
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Budget Reconciliation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Predicted-failure cost exposure measured against the{" "}
          {formatCurrency(facility.annualMaintenanceBudget)} annual maintenance
          budget.
        </p>
      </header>

      {/* Horizon cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {horizons.map((h) => {
          const shortfall = h.balance < 0;
          return (
            <div
              key={h.days}
              className={`rounded-lg border p-5 ${
                shortfall
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Within {h.label}
              </div>
              <div
                className={`mt-2 text-2xl font-bold ${
                  shortfall ? "text-red-700" : "text-green-700"
                }`}
              >
                {shortfall ? "Shortfall" : "Surplus"}{" "}
                {formatCurrency(Math.abs(h.balance))}
              </div>
              <dl className="mt-3 space-y-1 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Predicted failures</dt>
                  <dd className="font-semibold text-slate-900">{h.count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Predicted cost</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatCurrency(h.total)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Annual budget</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatCurrency(facility.annualMaintenanceBudget)}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </section>

      {/* Predicted failure detail table */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Predicted Failures (failure probability &ge; 30%)
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Part</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Next due</th>
                <th className="px-4 py-3">Failure prob.</th>
                <th className="px-4 py-3">Cost of inaction</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {predictedFailures.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/part/${p.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.equipment.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.due < 0
                      ? `${Math.abs(p.due)}d overdue`
                      : `${p.due}d`}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {formatPercent(p.failureProbability)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatCurrency(p.costOfInaction)}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={p.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
