import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { formatCurrency } from "@/lib/cost";
import { getProcessDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProcessDetail(id);
  if (!detail) notFound();

  const { process, equipment } = detail;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600">
          {process.facility.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{process.name}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {process.name} Process
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {equipment.length} pieces of equipment in this process.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Equipment
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Manufacturer</th>
                <th className="px-4 py-3">Parts</th>
                <th className="px-4 py-3">Worst-case cost</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/equipment/${eq.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {eq.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {eq.manufacturer}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{eq.partCount}</td>
                  <td className="px-4 py-3 text-slate-900">
                    {formatCurrency(eq.topCostOfInaction)}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={eq.risk} />
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
