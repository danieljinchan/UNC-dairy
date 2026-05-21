import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { TaskTypeBadge } from "@/components/TaskTypeBadge";
import { formatCurrency, formatPercent } from "@/lib/cost";
import { getEquipmentDetail } from "@/lib/queries";

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
        <span className="text-slate-700">{equipment.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {equipment.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {equipment.manufacturer}
          </p>
        </div>
        <RiskBadge level={risk} />
      </header>

      {/* Equipment spec card */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Units / hour", value: equipment.unitsPerHour.toLocaleString() },
          {
            label: "Margin / unit",
            value: formatCurrency(equipment.marginPerUnit),
          },
          { label: "Blueprint", value: equipment.blueprintRef },
          { label: "Cut sheet", value: equipment.cutSheetRef },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {item.label}
            </div>
            <div className="mt-1 break-words text-sm font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </section>

      {/* Parts table */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Parts &amp; Failure Risk
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Part</th>
                <th className="px-4 py-3">Part #</th>
                <th className="px-4 py-3">Failure prob.</th>
                <th className="px-4 py-3">Cost of inaction</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/part/${p.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {p.partNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {formatPercent(p.failureProbability)}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
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

      {/* PM schedule */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Maintenance Schedule
        </h2>
        {equipment.tasks.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No maintenance tasks scheduled for this equipment.
          </p>
        ) : (
          <ul className="space-y-2">
            {equipment.tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <TaskTypeBadge type={task.type} />
                  <span className="text-sm font-medium text-slate-900">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{fmtDate(task.scheduledDate)}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      task.status === "DONE"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-50 text-blue-700"
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
