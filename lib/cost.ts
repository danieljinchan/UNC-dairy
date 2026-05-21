// Cost engine for the Predictive Maintenance Platform.

export type RiskLevel = "RED" | "YELLOW" | "GREEN";

/**
 * Cost of leaving a predicted failure unaddressed.
 * Lost margin = downtime (hours) * throughput (units/hr) * margin per unit.
 */
export function costOfInaction(
  expectedDowntimeMin: number,
  unitsPerHour: number,
  marginPerUnit: number
): number {
  return expectedDowntimeMin * (unitsPerHour / 60) * marginPerUnit;
}

/** Map a failure probability (0-1) to a risk level. */
export function riskLevel(failureProbability: number): RiskLevel {
  if (failureProbability >= 0.6) return "RED";
  if (failureProbability >= 0.3) return "YELLOW";
  return "GREEN";
}

const RISK_RANK: Record<RiskLevel, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
};

/** Highest (worst) risk among a set of risk levels. Empty -> GREEN. */
export function worstRisk(levels: RiskLevel[]): RiskLevel {
  return levels.reduce<RiskLevel>(
    (worst, current) => (RISK_RANK[current] > RISK_RANK[worst] ? current : worst),
    "GREEN"
  );
}

/** Risk roll-up for an equipment item given its parts' failure probabilities. */
export function equipmentRisk(partFailureProbabilities: number[]): RiskLevel {
  return worstRisk(partFailureProbabilities.map(riskLevel));
}

/** Risk roll-up for a process given the risk of its equipment. */
export function processRisk(equipmentRisks: RiskLevel[]): RiskLevel {
  return worstRisk(equipmentRisks);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
