"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/budget", label: "Budget" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy text-white">
      <div className="px-6 py-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-base font-extrabold text-navy">
            UD
          </span>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight">
              UNC Dairy
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-sky">
              Predictive Maintenance
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 px-4">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-sky text-navy shadow-card"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-5 text-xs text-white/45">
        Predictive Maintenance Platform
      </div>
    </aside>
  );
}
