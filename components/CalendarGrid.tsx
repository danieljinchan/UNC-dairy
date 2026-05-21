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
  PM: "bg-mid-blue",
  PREDICTED_FAILURE: "bg-risk-red",
  WORK_ORDER: "bg-risk-amber",
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
    <div className="unc-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-sky/40 px-5 py-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-full border border-sky/60 px-4 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-pale-blue"
        >
          &larr; Prev
        </button>
        <h2 className="text-lg font-bold text-navy">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-full border border-sky/60 px-4 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-pale-blue"
        >
          Next &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-sky/40 bg-pale-blue text-center text-xs font-semibold uppercase tracking-wide text-navy/55">
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
                className="min-h-[7rem] border-b border-r border-sky/25 bg-pale-blue/40"
              />
            );
          }
          const key = `${year}-${month}-${d}`;
          const dayTasks = byDay.get(key) ?? [];
          return (
            <div
              key={idx}
              className={`min-h-[7rem] border-b border-r border-sky/25 p-1.5 ${
                isToday(d) ? "bg-pale-blue" : ""
              }`}
            >
              <div
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday(d) ? "bg-navy text-white" : "text-navy/55"
                }`}
              >
                {d}
              </div>
              <div className="space-y-1">
                {dayTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    className="flex items-start gap-1 rounded-lg bg-pale-blue px-1.5 py-1 text-[11px] leading-tight text-navy/80 transition-colors hover:bg-sky/40"
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
