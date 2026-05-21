import Link from "next/link";
import { RiskBadge } from "@/components/RiskBadge";
import { formatCurrency } from "@/lib/cost";
import {
  getFacility,
  getProcessesWithRisk,
  getAllPartsWithCost,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const facility = await getFacility();
  if (!facility) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        No facility found. Run <code className="font-mono">npm run seed</code> to
        load sample data.
      </div>
    );
  }

  const [processes, parts] = await Promise.all([
    getProcessesWithRisk(facility.id),
    getAllPartsWithCost(facility.id),
  ]);

  // Predicted-failure exposure = sum of cost-of-inaction for at-risk parts.
  const predictedFailureCost = parts
    .filter((p) => p.failureProbability >= 0.3)
    .reduce((sum, p) => sum + p.costOfInaction, 0);

  const balance = facility.annualMaintenanceBudget - predictedFailureCost;
  const shortfall = balance < 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{facility.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Facility overview — processes, equipment risk roll-ups, and budget
          exposure.
        </p>
      </header>

      {/* Budget status banner */}
      <section
        className={`rounded-lg border p-5 ${
          shortfall
            ? "border-red-200 bg-red-50"
            : "border-green-200 bg-green-50"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Budget Status
            </div>
            <div
              className={`mt-1 text-2xl font-bold ${
                shortfall ? "text-red-700" : "text-green-700"
              }`}
            >
              {shortfall ? "Shortfall" : "Surplus"}{" "}
              {formatCurrency(Math.abs(balance))}
            </div>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-slate-500">Annual budget</div>
              <div className="font-semibold text-slate-900">
                {formatCurrency(facility.annualMaintenanceBudget)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">
                Predicted-failure exposure
              </div>
              <div className="font-semibold text-slate-900">
                {formatCurrency(predictedFailureCost)}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Exposure is the total cost of inaction across all parts with a
          failure probability of 30% or higher. See{" "}
          <Link href="/budget" className="font-medium text-blue-600 underline">
            Budget
          </Link>{" "}
          for horizon breakdowns.
        </p>
      </section>

      {/* Process cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Processes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((proc) => (
            <Link
              key={proc.id}
              href={`/process/${proc.id}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                  {proc.name}
                </h3>
                <RiskBadge level={proc.risk} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Equipment</dt>
                  <dd className="font-semibold text-slate-900">
                    {proc.equipmentCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tracked parts</dt>
                  <dd className="font-semibold text-slate-900">
                    {proc.partCount}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500">Worst-case downtime cost</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatCurrency(proc.topCostOfInaction)}
                  </dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
