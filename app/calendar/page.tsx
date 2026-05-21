import { CalendarGrid, type CalendarTask } from "@/components/CalendarGrid";
import { getFacility, getTasks } from "@/lib/queries";

export const dynamic = "force-dynamic";

const LEGEND = [
  { label: "Preventive (PM)", className: "bg-mid-blue" },
  { label: "Predicted Failure", className: "bg-risk-red" },
  { label: "Work Order", className: "bg-risk-amber" },
];

export default async function CalendarPage() {
  const facility = await getFacility();
  if (!facility) {
    return (
      <div className="rounded-2xl border border-risk-amber/30 bg-risk-amber/10 p-6 text-navy">
        No facility found. Run <code className="font-mono">npm run seed</code>{" "}
        to load sample data.
      </div>
    );
  }

  const tasks = await getTasks(facility.id);

  const calendarTasks: CalendarTask[] = tasks.map((t) => ({
    id: t.id,
    type: t.type,
    title: t.title,
    date: t.scheduledDate.toISOString(),
    href: t.partId
      ? `/part/${t.partId}`
      : `/equipment/${t.equipmentId}`,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Maintenance Calendar
        </h1>
        <p className="mt-2 text-sm text-navy/55">
          Scheduled maintenance tasks across {facility.name}. Click a task to
          open its equipment or part.
        </p>
      </header>

      <div className="flex flex-wrap gap-4 text-sm text-navy/65">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-full ${l.className}`} />
            {l.label}
          </div>
        ))}
      </div>

      <CalendarGrid tasks={calendarTasks} />
    </div>
  );
}
