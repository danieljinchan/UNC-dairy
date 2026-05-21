"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PartImage } from "@/components/PartImage";
import { RiskBadge } from "@/components/RiskBadge";
import { HOMOGENIZER_ZONES, getZone } from "@/lib/homogenizer";
import { formatCurrency, formatPercent, type RiskLevel } from "@/lib/cost";
import type { InteractivePart } from "@/lib/queries";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const RISK_TINT: Record<RiskLevel, string> = {
  RED: "border-risk-red/70 bg-risk-red/25",
  YELLOW: "border-risk-amber/70 bg-risk-amber/25",
  GREEN: "border-risk-green/70 bg-risk-green/25",
};

const RISK_BAR: Record<RiskLevel, string> = {
  RED: "bg-risk-red",
  YELLOW: "bg-risk-amber",
  GREEN: "bg-risk-green",
};

/** Worst risk level among a set of parts (for zone highlight color). */
function zoneRisk(parts: InteractivePart[]): RiskLevel {
  if (parts.some((p) => p.risk === "RED")) return "RED";
  if (parts.some((p) => p.risk === "YELLOW")) return "YELLOW";
  return "GREEN";
}

/* ----------------------------- Part card ------------------------------- */

function PartCard({ part }: { part: InteractivePart }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-sky/50 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-pale-blue"
      >
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <PartImage imageRef={part.imageRef} alt={part.name} ratioPad="100%" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-navy">
            {part.name}
          </span>
          <span className="block font-mono text-[11px] text-navy/50">
            {part.partNumber}
          </span>
        </span>
        <RiskBadge level={part.risk} />
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-navy/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-sky/40 px-4 py-4">
          <PartImage
            imageRef={part.imageRef}
            alt={part.name}
            ratioPad="56.25%"
          />

          {/* Failure probability */}
          <div>
            <div className="flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                Failure probability
              </span>
              <span className="text-lg font-bold text-navy">
                {formatPercent(part.failureProbability)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-pale-blue">
              <div
                className={`h-full rounded-full ${RISK_BAR[part.risk]}`}
                style={{ width: `${Math.round(part.failureProbability * 100)}%` }}
              />
            </div>
          </div>

          {/* Why at risk */}
          {part.whyAtRisk && (
            <div className="rounded-xl bg-pale-blue p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                Why it&apos;s at risk
              </div>
              <p className="mt-1 text-sm leading-relaxed text-navy/80">
                {part.whyAtRisk}
              </p>
            </div>
          )}

          {/* PM timeline */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
              PM schedule
            </div>
            <dl className="mt-1 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-navy/55">Last replaced</dt>
                <dd className="font-semibold text-navy">
                  {fmtDate(part.lastReplaced)}
                </dd>
              </div>
              <div>
                <dt className="text-navy/55">Next due</dt>
                <dd className="font-semibold text-navy">
                  {fmtDate(part.nextDue)}
                </dd>
              </div>
              <div>
                <dt className="text-navy/55">Expected downtime</dt>
                <dd className="font-semibold text-navy">
                  {part.expectedDowntimeMin} min
                </dd>
              </div>
              <div>
                <dt className="text-navy/55">Lead time</dt>
                <dd className="font-semibold text-navy">
                  {part.leadTimeDays} days
                </dd>
              </div>
            </dl>
          </div>

          {/* Cost */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-risk-red/30 bg-risk-red/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                Cost of inaction
              </div>
              <div className="mt-0.5 text-lg font-bold text-risk-red">
                {formatCurrency(part.costOfInaction)}
              </div>
            </div>
            <div className="rounded-xl border border-sky/50 bg-pale-blue p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                Part cost
              </div>
              <div className="mt-0.5 text-lg font-bold text-navy">
                {formatCurrency(part.unitCost)}
              </div>
            </div>
          </div>

          {/* Supplier + order */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="text-navy/55">Supplier</div>
              <div className="font-semibold text-navy">{part.supplier}</div>
            </div>
            <a
              href={`mailto:orders@${part.supplier.toLowerCase().replace(/[^a-z]+/g, "")}.example?subject=${encodeURIComponent(
                `Order: ${part.name} (${part.partNumber})`
              )}`}
              className="shrink-0 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-mid-blue"
            >
              Order part
            </a>
          </div>

          <Link
            href={`/part/${part.id}`}
            className="block text-center text-sm font-medium text-mid-blue hover:underline"
          >
            Open full part detail &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Explorer -------------------------------- */

export function HomogenizerExplorer({
  photoRef,
  equipmentName,
  parts,
}: {
  photoRef: string | null;
  equipmentName: string;
  parts: InteractivePart[];
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);

  // Close the panel with Escape.
  useEffect(() => {
    if (!activeZone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveZone(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeZone]);

  const zone = activeZone ? getZone(activeZone) : null;
  const zoneParts = activeZone
    ? parts.filter((p) => p.zone === activeZone)
    : [];

  return (
    <div className="unc-card overflow-hidden p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/60">
          Interactive machine map
        </h2>
        <p className="text-xs text-navy/55">
          Click a highlighted zone to inspect its wear parts.
        </p>
      </div>

      {/* Photo + hotspots */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-sky/50 bg-pale-blue">
        <PartImage
          imageRef={photoRef}
          alt={`${equipmentName} exterior`}
          ratioPad="62.5%"
        />

        {/* Hotspot zones overlaid as percentage rectangles */}
        <div className="absolute inset-0">
          {HOMOGENIZER_ZONES.map((z) => {
            const zParts = parts.filter((p) => p.zone === z.key);
            if (zParts.length === 0) return null;
            const risk = zoneRisk(zParts);
            const active = hoverZone === z.key || activeZone === z.key;
            return (
              <button
                key={z.key}
                type="button"
                onClick={() => setActiveZone(z.key)}
                onMouseEnter={() => setHoverZone(z.key)}
                onMouseLeave={() => setHoverZone(null)}
                onFocus={() => setHoverZone(z.key)}
                onBlur={() => setHoverZone(null)}
                aria-label={`${z.label} — ${zParts.length} parts`}
                className={`group absolute rounded-xl border-2 transition-all ${RISK_TINT[risk]} ${
                  active
                    ? "ring-2 ring-white/80 brightness-110"
                    : "hover:brightness-110"
                }`}
                style={{
                  left: `${z.rect.x}%`,
                  top: `${z.rect.y}%`,
                  width: `${z.rect.w}%`,
                  height: `${z.rect.h}%`,
                }}
              >
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-white shadow-card transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {z.label} · {zParts.length}
                </span>
                <span className="absolute left-1.5 top-1.5 rounded-md bg-navy/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {zParts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {HOMOGENIZER_ZONES.map((z) => {
          const zParts = parts.filter((p) => p.zone === z.key);
          if (zParts.length === 0) return null;
          return (
            <button
              key={z.key}
              type="button"
              onClick={() => setActiveZone(z.key)}
              onMouseEnter={() => setHoverZone(z.key)}
              onMouseLeave={() => setHoverZone(null)}
              className="rounded-full border border-sky/60 bg-pale-blue px-3 py-1 text-xs font-semibold text-navy transition-colors hover:bg-sky/40"
            >
              {z.label}{" "}
              <span className="text-navy/50">({zParts.length})</span>
            </button>
          );
        })}
      </div>

      {/* Slide-in side panel */}
      {activeZone && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[1px]"
            onClick={() => setActiveZone(null)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${zone?.label ?? "Zone"} parts`}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-sky/50 bg-pale-blue shadow-card-hover"
          >
            <header className="flex items-start justify-between gap-3 border-b border-sky/50 bg-navy px-5 py-4 text-white">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-sky">
                  Zone
                </div>
                <h3 className="text-lg font-bold">{zone?.label}</h3>
                {zone?.blurb && (
                  <p className="mt-1 text-xs text-white/70">{zone.blurb}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveZone(null)}
                aria-label="Close panel"
                className="shrink-0 rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                {zoneParts.length} part{zoneParts.length === 1 ? "" : "s"} in
                this zone
              </p>
              {zoneParts.map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
