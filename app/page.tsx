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
      <div className="rounded-2xl border border-risk-amber/30 bg-risk-amber/10 p-6 text-navy">
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
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {facility.name}
        </h1>
        <p className="mt-2 text-sm text-navy/55">
          Facility overview — processes, equipment risk roll-ups, and budget
          exposure.
        </p>
      </header>

      {/* Budget status banner */}
      <section
        className={`rounded-2xl border p-6 shadow-card ${
          shortfall
            ? "border-risk-red/30 bg-risk-red/10"
            : "border-risk-green/30 bg-risk-green/10"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
              Budget Status
            </div>
            <div
              className={`mt-1 text-3xl font-bold ${
                shortfall ? "text-risk-red" : "text-risk-green"
              }`}
            >
              {shortfall ? "Shortfall" : "Surplus"}{" "}
              {formatCurrency(Math.abs(balance))}
            </div>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-navy/55">Annual budget</div>
              <div className="font-semibold text-navy">
                {formatCurrency(facility.annualMaintenanceBudget)}
              </div>
            </div>
            <div>
              <div className="text-navy/55">Predicted-failure exposure</div>
              <div className="font-semibold text-navy">
                {formatCurrency(predictedFailureCost)}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-navy/65">
          Exposure is the total cost of inaction across all parts with a failure
          probability of 30% or higher. See{" "}
          <Link
            href="/budget"
            className="font-semibold text-mid-blue underline"
          >
            Budget
          </Link>{" "}
          for horizon breakdowns.
        </p>
      </section>

      {/* Process cards */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy/60">
          Processes
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((proc) => (
            <Link
              key={proc.id}
              href={`/process/${proc.id}`}
              className="group unc-card p-6 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-navy group-hover:text-mid-blue">
                  {proc.name}
                </h3>
                <RiskBadge level={proc.risk} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-navy/55">Equipment</dt>
                  <dd className="font-semibold text-navy">
                    {proc.equipmentCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/55">Tracked parts</dt>
                  <dd className="font-semibold text-navy">{proc.partCount}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-navy/55">Worst-case downtime cost</dt>
                  <dd className="font-semibold text-navy">
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
