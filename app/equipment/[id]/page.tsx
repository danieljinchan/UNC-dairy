import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskTypeBadge } from "@/components/TaskTypeBadge";
import { HomogenizerExplorer } from "@/components/HomogenizerExplorer";
import { DataBar } from "@/components/DataBar";
import { formatCurrency, formatPercent } from "@/lib/cost";
import { RISK_UI } from "@/lib/risk-ui";
import type { RiskLevel } from "@/lib/cost";
import { getEquipmentDetail, getInteractiveEquipment } from "@/lib/queries";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getEquipmentDetail(id);
  if (!detail) notFound();

  const { equipment, parts, risk } = detail;
  const interactive = await getInteractiveEquipment(id);

  const ui = RISK_UI[risk as RiskLevel];
  const attentionParts = parts.filter((p) => p.risk !== "GREEN");
  const healthyParts = parts.filter((p) => p.risk === "GREEN");
  const openExposure = attentionParts.reduce((s, p) => s + p.costOfInaction, 0);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
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
        <span className="font-medium text-navy">{equipment.name}</span>
      </nav>

      {/* Page header */}
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {equipment.name}
            </h1>
            <p className="mt-1 text-sm text-navy/55">
              {equipment.manufacturer}
              <span className="mx-2 text-navy/30">·</span>
              <span className="font-mono text-xs">
                Blueprint&nbsp;{equipment.blueprintRef}
              </span>
              <span className="mx-2 text-navy/30">·</span>
              <span className="font-mono text-xs">
                Cut&nbsp;sheet&nbsp;{equipment.cutSheetRef}
              </span>
            </p>
          </div>

          {/* Risk badge — prominent, at top-right */}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${ui.tint} ${ui.text} border-current/30`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${ui.bar}`} />
            {ui.label}
          </span>
        </div>
      </header>

      {/* Summary strip — key metrics at a glance */}
      <section className="unc-card grid grid-cols-2 divide-x divide-y divide-sky/30 overflow-hidden sm:grid-cols-4 sm:divide-y-0">
        {[
          {
            label: "Open exposure",
            value: formatCurrency(openExposure),
            sub:
              attentionParts.length === 0
                ? "No at-risk parts"
                : `${attentionParts.length} part${attentionParts.length !== 1 ? "s" : ""} at risk`,
            tone:
              openExposure > 0
                ? attentionParts.some((p) => p.risk === "RED")
                  ? "text-risk-red"
                  : "text-risk-amber"
                : "text-risk-green",
          },
          {
            label: "Parts tracked",
            value: String(parts.length),
            sub:
              attentionParts.length > 0
                ? `${attentionParts.length} need attention`
                : "All healthy",
            tone: attentionParts.length > 0 ? "text-risk-amber" : "text-risk-green",
          },
          {
            label: "Units / hour",
            value: equipment.unitsPerHour.toLocaleString(),
            sub: "Rated throughput",
            tone: "text-navy",
          },
          {
            label: "Margin / unit",
            value: formatCurrency(equipment.marginPerUnit),
            sub: "Contribution margin",
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

      {/* Interactive machine map — flagship equipment only */}
      {interactive && (
        <HomogenizerExplorer
          photoRef={interactive.equipment.photoRef}
          equipmentName={interactive.equipment.name}
          parts={interactive.parts}
        />
      )}

      {/* ── Parts needing attention ── */}
      {attentionParts.length > 0 ? (
        <section>
          <h2 className="section-label mb-3">
            Needs attention
            <span className="ml-1.5 font-normal text-navy/40">
              ({attentionParts.length})
            </span>
          </h2>
          <div className="space-y-3">
            {attentionParts.map((p) => {
              const pui = RISK_UI[p.risk as RiskLevel];
              return (
                <Link
                  key={p.id}
                  href={`/part/${p.id}`}
                  className={`group relative flex flex-wrap items-center gap-x-6 gap-y-3 overflow-hidden rounded-2xl ${pui.tint} p-4 pl-6 shadow-card transition-shadow hover:shadow-card-hover`}
                >
                  {/* Coloured accent strip */}
                  <span
                    className={`absolute inset-y-0 left-0 w-1.5 ${pui.bar}`}
                  />

                  {/* Name + part number */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-navy group-hover:text-mid-blue">
                        {p.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${pui.tint} ${pui.text}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${pui.bar}`}
                        />
                        {pui.label}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-navy/45">
                      {p.partNumber}
                    </p>
                  </div>

                  {/* Failure probability gauge */}
                  <div className="w-40 shrink-0">
                    <div className="flex items-center justify-between text-xs text-navy/55">
                      <span>Failure prob.</span>
                      <span className={`font-semibold tabular-nums ${pui.text}`}>
                        {formatPercent(p.failureProbability)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <DataBar
                        value={p.failureProbability}
                        className={pui.bar}
                      />
                    </div>
                  </div>

                  {/* Cost callout */}
                  <div className="shrink-0 text-right">
                    <div className="section-label">Cost of inaction</div>
                    <div className="mt-0.5 text-lg font-bold tabular-nums text-navy">
                      {formatCurrency(p.costOfInaction)}
                    </div>
                  </div>

                  <span className="shrink-0 text-navy/30 transition-colors group-hover:text-mid-blue">
                    ›
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-risk-green/5 p-5 pl-6 shadow-card">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-risk-green" />
            <p className="text-sm font-semibold text-risk-green">
              All parts healthy
            </p>
            <p className="mt-0.5 text-xs text-navy/50">
              No predicted failures on this equipment.
            </p>
          </div>
        </section>
      )}

      {/* ── Healthy parts — quiet reference table ── */}
      {healthyParts.length > 0 && (
        <section>
          <h2 className="section-label mb-3">
            Healthy parts
            <span className="ml-1.5 font-normal text-navy/40">
              ({healthyParts.length})
            </span>
          </h2>
          <div className="unc-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pale-blue text-left text-xs uppercase tracking-wide text-navy/45">
                <tr>
                  <th className="px-5 py-3">Part</th>
                  <th className="px-5 py-3 font-mono">Part #</th>
                  <th className="px-5 py-3">Failure prob.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky/30">
                {healthyParts.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-pale-blue"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/part/${p.id}`}
                        className="font-medium text-mid-blue hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-navy/45">
                      {p.partNumber}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 tabular-nums text-navy/60">
                          {formatPercent(p.failureProbability)}
                        </span>
                        <div className="w-24">
                          <DataBar
                            value={p.failureProbability}
                            className="bg-risk-green"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Maintenance schedule ── */}
      <section>
        <h2 className="section-label mb-3">Maintenance schedule</h2>
        {equipment.tasks.length === 0 ? (
          <p className="unc-card p-5 text-sm text-navy/55">
            No maintenance tasks scheduled.
          </p>
        ) : (
          <ul className="space-y-2">
            {equipment.tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 unc-card p-4"
              >
                <div className="flex items-center gap-3">
                  <TaskTypeBadge type={task.type} />
                  <span className="text-sm font-medium text-navy">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-navy/55">
                  <span>{fmtDate(task.scheduledDate)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      task.status === "DONE"
                        ? "bg-pale-blue text-navy/50"
                        : "bg-sky/40 text-navy"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
