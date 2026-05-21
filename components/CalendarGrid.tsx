"use client";

import { useState } from "react";
import Link from "next/link";

export type CalendarTask = {
  id: string;
  type: string;
  title: string;
  date: string; // ISO date string
  href: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_DOT: Record<string, string> = {
  PM: "bg-blue-500",
  PREDICTED_FAILURE: "bg-red-600",
  WORK_ORDER: "bg-amber-500",
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function CalendarGrid({ tasks }: { tasks: CalendarTask[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  // Bucket tasks by local day key.
  const byDay = new Map<string, CalendarTask[]>();
  for (const t of tasks) {
    const d = new Date(t.date);
    const key = dayKey(d);
    const list = byDay.get(key) ?? [];
    list.push(t);
    byDay.set(key, list);
  }

  // Build a grid of cells (leading blanks + days).
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          &larr; Prev
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Next &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d, idx) => {
          if (d === null) {
            return (
              <div
                key={idx}
                className="min-h-[7rem] border-b border-r border-slate-100 bg-slate-50/50"
              />
            );
          }
          const key = `${year}-${month}-${d}`;
          const dayTasks = byDay.get(key) ?? [];
          return (
            <div
              key={idx}
              className={`min-h-[7rem] border-b border-r border-slate-100 p-1.5 ${
                isToday(d) ? "bg-blue-50" : ""
              }`}
            >
              <div
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday(d)
                    ? "bg-blue-600 text-white"
                    : "text-slate-500"
                }`}
              >
                {d}
              </div>
              <div className="space-y-1">
                {dayTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    className="flex items-start gap-1 rounded bg-slate-50 px-1.5 py-1 text-[11px] leading-tight text-slate-700 hover:bg-slate-100"
                  >
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        TYPE_DOT[t.type] ?? "bg-slate-400"
                      }`}
                    />
                    <span className="line-clamp-2">{t.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
