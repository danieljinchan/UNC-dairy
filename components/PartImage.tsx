"use client";

import { useState } from "react";

/**
 * Renders a photo from /public/homogenizer if the file is present.
 * If the image is missing (404s) — or no `imageRef` is given at all — it
 * falls back to a clean styled placeholder so the app looks finished with
 * NO photos committed. Drop a real .jpg in with the documented filename and
 * it appears with zero code changes.
 */

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2l1.2-1.8A1 1 0 0 1 8.5 4.7h7a1 1 0 0 1 .8.5L17.5 7h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}

function Placeholder({
  label,
  className,
  ratioPad,
}: {
  label: string;
  className?: string;
  ratioPad?: string;
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-navy/40 bg-pale-blue ${className ?? ""}`}
      style={ratioPad ? { paddingBottom: ratioPad } : undefined}
    >
      <div
        className={
          ratioPad
            ? "absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
            : "flex flex-col items-center justify-center gap-2 p-4 text-center"
        }
      >
        <CameraIcon className="h-8 w-8 text-navy/55" />
        <div className="text-sm font-semibold text-navy">{label}</div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
          Photo coming soon
        </div>
      </div>
    </div>
  );
}

export function PartImage({
  imageRef,
  alt,
  className,
  /** When set (e.g. "62.5%"), reserves an aspect-ratio box. */
  ratioPad,
}: {
  imageRef: string | null | undefined;
  alt: string;
  className?: string;
  ratioPad?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!imageRef || failed) {
    return <Placeholder label={alt} className={className} ratioPad={ratioPad} />;
  }

  const src = `/homogenizer/${imageRef}`;

  if (ratioPad) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-sky/50 bg-pale-blue ${className ?? ""}`}
        style={{ paddingBottom: ratioPad }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`w-full rounded-2xl border border-sky/50 object-cover ${className ?? ""}`}
    />
  );
}
