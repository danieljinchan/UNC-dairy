import { CalendarGrid, type CalendarTask } from "@/components/CalendarGrid";
import { getFacility, getTasks } from "@/lib/queries";

export const dynamic = "force-dynamic";

const LEGEND = [
  { label: "Preventive (PM)", className: "bg-blue-500" },
  { label: "Predicted Failure", className: "bg-red-600" },
  { label: "Work Order", className: "bg-amber-500" },
];

export default async function CalendarPage() {
  const facility = await getFacility();
  if (!facility) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
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
        <h1 className="text-2xl font-bold text-slate-900">
          Maintenance Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Scheduled maintenance tasks across {facility.name}. Click a task to
          open its equipment or part.
        </p>
      </header>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
