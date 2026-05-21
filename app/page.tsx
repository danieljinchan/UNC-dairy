import Link from "next/link";
import { DataBar } from "@/components/DataBar";
import { formatCurrency, formatPercent } from "@/lib/cost";
import { RISK_UI, RISK_ORDER } from "@/lib/risk-ui";
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

  const atRiskParts = parts
    .filter((p) => p.failureProbability >= 0.3)
    .sort((a, b) => b.costOfInaction - a.costOfInaction);

  const predictedFailureCost = atRiskParts.reduce(
    (s, p) => s + p.costOfInaction,
    0
  );
  const balance = facility.annualMaintenanceBudget - predictedFailureCost;
  const shortfall = balance < 0;
  const equipmentCount = processes.reduce((s, p) => s + p.equipmentCount, 0);

  const sortedProcesses = [...processes].sort(
    (a, b) =>
      RISK_ORDER[b.risk] - RISK_ORDER[a.risk] ||
      b.topCostOfInaction - a.topCostOfInaction
  );

  const topConcerns = atRiskParts.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
            Facility
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy">
            {facility.name}
          </h1>
        </div>
        <Link
          href="/budget"
          className="text-sm font-semibold text-mid-blue hover:underline"
        >
          Budget detail →
        </Link>
      </header>

      {/* KPI strip — one card, four at-a-glance metrics */}
      <section className="unc-card grid grid-cols-2 divide-x divide-y divide-sky/30 overflow-hidden sm:grid-cols-4 sm:divide-y-0">
        {[
          {
            label: "Budget balance",
            value: `${shortfall ? "−" : "+"}${formatCurrency(Math.abs(balance))}`,
            sub: shortfall ? "Projected shortfall" : "Projected surplus",
            tone: shortfall ? "text-risk-red" : "text-risk-green",
          },
          {
            label: "Failure exposure",
            value: formatCurrency(predictedFailureCost),
            sub: "Total cost of inaction",
            tone: predictedFailureCost > 0 ? "text-risk-amber" : "text-navy",
          },
          {
            label: "Parts at risk",
            value: String(atRiskParts.length),
            sub: `of ${parts.length} tracked`,
            tone:
              atRiskParts.length > 0
                ? "text-risk-amber"
                : "text-risk-green",
          },
          {
            label: "Equipment monitored",
            value: String(equipmentCount),
            sub: `across ${processes.length} processes`,
            tone: "text-navy",
          },
        ].map((s) => (
          <div key={s.label} className="px-5 py-4">
            <div className="section-label">{s.label}</div>
            <div className={`mt-1.5 text-2xl font-bold tabular-nums ${s.tone}`}>
              {s.value}
            </div>
            <div className="mt-0.5 text-xs text-navy/45">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Hero — what needs attention right now */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-label">
            Needs attention
            {atRiskParts.length > 0 && (
              <span className="ml-1.5 font-normal text-navy/40">
                ({atRiskParts.length})
              </span>
            )}
          </h2>
          {atRiskParts.length > 3 && (
            <Link
              href="/budget"
              className="text-xs font-semibold text-mid-blue hover:underline"
            >
              View all {atRiskParts.length} →
            </Link>
          )}
        </div>

        {topConcerns.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-risk-green/5 p-5 pl-6 shadow-card">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-risk-green" />
            <p className="text-sm font-semibold text-risk-green">
              All clear — no predicted failures
            </p>
            <p className="mt-0.5 text-xs text-navy/50">
              All {parts.length} tracked parts are healthy.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {topConcerns.map((p) => {
              const ui = RISK_UI[p.risk];
              return (
                <Link
                  key={p.id}
                  href={`/part/${p.id}`}
                  className={`group relative overflow-hidden rounded-2xl ${ui.tint} p-5 pl-6 shadow-card transition-shadow hover:shadow-card-hover`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${ui.bar}`} />

                  {/* Risk label + equipment context */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${ui.text}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${ui.bar}`} />
                      {ui.label}
                    </span>
                    <span className="truncate text-xs text-navy/45">
                      {p.equipment.name}
                    </span>
                  </div>

                  {/* Part name */}
                  <h3 className="mt-3 text-base font-bold text-navy group-hover:text-mid-blue">
                    {p.name}
                  </h3>

                  {/* Failure probability gauge */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-navy/55">
                      <span>Failure probability</span>
                      <span className={`font-semibold tabular-nums ${ui.text}`}>
                        {formatPercent(p.failureProbability)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <DataBar value={p.failureProbability} className={ui.bar} />
                    </div>
                  </div>

                  {/* Cost callout */}
                  <div className="mt-4 flex items-end justify-between border-t border-navy/10 pt-3">
                    <div>
                      <div className="section-label">Cost of inaction</div>
                      <div className="mt-0.5 text-xl font-bold tabular-nums text-navy">
                        {formatCurrency(p.costOfInaction)}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-mid-blue group-hover:underline">
                      View part →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Processes — worst-first list, demoted below primary content */}
      <section>
        <h2 className="section-label mb-3">Processes</h2>
        <div className="unc-card divide-y divide-sky/30 overflow-hidden">
          {sortedProcesses.map((proc) => {
            const ui = RISK_UI[proc.risk];
            return (
              <Link
                key={proc.id}
                href={`/process/${proc.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-pale-blue"
              >
                {/* Risk accent strip */}
                <span className={`h-9 w-1.5 shrink-0 rounded-full ${ui.bar}`} />

                {/* Name + meta */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-navy group-hover:text-mid-blue">
                    {proc.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-navy/45">
                    {proc.equipmentCount} equipment &middot; {proc.partCount}{" "}
                    parts tracked
                  </p>
                </div>

                {/* Worst-case cost (hidden on mobile) */}
                <div className="hidden text-right sm:block">
                  <div className="section-label">Worst-case cost</div>
                  <div className="mt-0.5 font-semibold tabular-nums text-navy">
                    {formatCurrency(proc.topCostOfInaction)}
                  </div>
                </div>

                {/* Risk pill */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${ui.tint} ${ui.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${ui.bar}`} />
                  {ui.label}
                </span>

                <span className="shrink-0 text-navy/30 transition-colors group-hover:text-mid-blue">
                  ›
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
