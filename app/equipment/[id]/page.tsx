import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { TaskTypeBadge } from "@/components/TaskTypeBadge";
import { HomogenizerExplorer } from "@/components/HomogenizerExplorer";
import { formatCurrency, formatPercent } from "@/lib/cost";
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

  // Flagship equipment (has a photoRef) gets the interactive zone explorer.
  const interactive = await getInteractiveEquipment(id);

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
        <span className="font-medium text-navy">{equipment.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {equipment.name}
          </h1>
          <p className="mt-1 text-sm text-navy/55">{equipment.manufacturer}</p>
        </div>
        <RiskBadge level={risk} />
      </header>

      {/* Equipment spec card */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Units / hour",
            value: equipment.unitsPerHour.toLocaleString(),
          },
          {
            label: "Margin / unit",
            value: formatCurrency(equipment.marginPerUnit),
          },
          { label: "Blueprint", value: equipment.blueprintRef },
          { label: "Cut sheet", value: equipment.cutSheetRef },
        ].map((item) => (
          <div key={item.label} className="unc-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
              {item.label}
            </div>
            <div className="mt-1 break-words text-sm font-semibold text-navy">
              {item.value}
            </div>
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

      {/* Parts table */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy/60">
          Parts &amp; Failure Risk
        </h2>
        <div className="unc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-pale-blue text-left text-xs uppercase tracking-wide text-navy/55">
              <tr>
                <th className="px-5 py-3">Part</th>
                <th className="px-5 py-3">Part #</th>
                <th className="px-5 py-3">Failure prob.</th>
                <th className="px-5 py-3">Cost of inaction</th>
                <th className="px-5 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky/30">
              {parts.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-pale-blue">
                  <td className="px-5 py-3">
                    <Link
                      href={`/part/${p.id}`}
                      className="font-medium text-mid-blue hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-navy/55">
                    {p.partNumber}
                  </td>
                  <td className="px-5 py-3 text-navy">
                    {formatPercent(p.failureProbability)}
                  </td>
                  <td className="px-5 py-3 text-navy">
                    {formatCurrency(p.costOfInaction)}
                  </td>
                  <td className="px-5 py-3">
                    <RiskBadge level={p.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PM schedule */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy/60">
          Maintenance Schedule
        </h2>
        {equipment.tasks.length === 0 ? (
          <p className="unc-card p-5 text-sm text-navy/55">
            No maintenance tasks scheduled for this equipment.
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
