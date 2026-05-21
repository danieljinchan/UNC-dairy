import type { RiskLevel } from "@/lib/cost";

/**
 * Shared visual vocabulary for risk levels. Centralizes the colour mapping so
 * cards, rows, badges and data bars all read consistently.
 */
type RiskUI = {
  label: string;
  bar: string; // solid fill — dots, data bars, accent strips
  text: string; // foreground text colour
  tint: string; // faint tinted surface
};

export const RISK_UI: Record<RiskLevel, RiskUI> = {
  RED: {
    label: "High risk",
    bar: "bg-risk-red",
    text: "text-risk-red",
    tint: "bg-risk-red/5",
  },
  YELLOW: {
    label: "Watch",
    bar: "bg-risk-amber",
    text: "text-risk-amber",
    tint: "bg-risk-amber/10",
  },
  GREEN: {
    label: "Healthy",
    bar: "bg-risk-green",
    text: "text-risk-green",
    tint: "bg-risk-green/5",
  },
};

/** Worst-first ordering helper. */
export const RISK_ORDER: Record<RiskLevel, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
};
