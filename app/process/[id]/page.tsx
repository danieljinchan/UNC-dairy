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

  // Flagship equipment with an interactive machine map.
  const flagship = equipment.filter((eq) => eq.photoRef);
  const standard = equipment.filter((eq) => !eq.photoRef);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-navy/60">
        <Link href="/" className="transition-colors hover:text-mid-blue">
          {process.facility.name}
        </Link>
        <span className="mx-2 text-navy/30">/</span>
        <span className="font-medium text-navy">{process.name}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {process.name} Process
        </h1>
        <p className="mt-2 text-sm text-navy/55">
          {equipment.length} pieces of equipment in this process.
        </p>
      </header>

      {/* Flagship equipment — prominent interactive cards */}
      {flagship.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy/60">
            Featured Equipment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {flagship.map((eq) => (
              <Link
                key={eq.id}
                href={`/equipment/${eq.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-sky/50 bg-navy p-6 text-white shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-sky">
                      Interactive machine map
                    </div>
                    <h3 className="mt-1 text-xl font-bold group-hover:text-sky">
                      {eq.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/65">
                      {eq.manufacturer}
                    </p>
                  </div>
                  <RiskBadge level={eq.risk} />
                </div>
                <div className="mt-5 flex gap-8 text-sm">
                  <div>
                    <div className="text-white/55">Tracked parts</div>
                    <div className="font-semibold">{eq.partCount}</div>
                  </div>
                  <div>
                    <div className="text-white/55">Worst-case cost</div>
                    <div className="font-semibold">
                      {formatCurrency(eq.topCostOfInaction)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold text-sky">
                  Explore zones &amp; wear parts &rarr;
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {standard.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy/60">
            Equipment
          </h2>
          <div className="unc-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pale-blue text-left text-xs uppercase tracking-wide text-navy/55">
                <tr>
                  <th className="px-5 py-3">Equipment</th>
                  <th className="px-5 py-3">Manufacturer</th>
                  <th className="px-5 py-3">Parts</th>
                  <th className="px-5 py-3">Worst-case cost</th>
                  <th className="px-5 py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky/30">
                {standard.map((eq) => (
                  <tr
                    key={eq.id}
                    className="transition-colors hover:bg-pale-blue"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/equipment/${eq.id}`}
                        className="font-medium text-mid-blue hover:underline"
                      >
                        {eq.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-navy/65">
                      {eq.manufacturer}
                    </td>
                    <td className="px-5 py-3 text-navy/65">{eq.partCount}</td>
                    <td className="px-5 py-3 text-navy">
                      {formatCurrency(eq.topCostOfInaction)}
                    </td>
                    <td className="px-5 py-3">
                      <RiskBadge level={eq.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
