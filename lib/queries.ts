import { prisma } from "@/lib/prisma";
import {
  costOfInaction,
  equipmentRisk,
  processRisk,
  riskLevel,
  type RiskLevel,
} from "@/lib/cost";

/** The single facility for the MVP (first one found). */
export async function getFacility() {
  return prisma.facility.findFirst();
}

/**
 * Predicted-failure cost for one part: cost of inaction using the
 * parent equipment's throughput and margin.
 */
export function partCostOfInaction(part: {
  expectedDowntimeMin: number;
  equipment: { unitsPerHour: number; marginPerUnit: number };
}): number {
  return costOfInaction(
    part.expectedDowntimeMin,
    part.equipment.unitsPerHour,
    part.equipment.marginPerUnit
  );
}

export type EquipmentWithRisk = {
  id: string;
  name: string;
  manufacturer: string;
  risk: RiskLevel;
  partCount: number;
  topCostOfInaction: number;
};

/** Processes for the facility, each with a rolled-up risk level. */
export async function getProcessesWithRisk(facilityId: string) {
  const processes = await prisma.process.findMany({
    where: { facilityId },
    include: {
      equipment: { include: { parts: true } },
    },
    orderBy: { name: "asc" },
  });

  return processes.map((proc) => {
    const equipmentRisks: RiskLevel[] = proc.equipment.map((eq) =>
      equipmentRisk(eq.parts.map((p) => p.failureProbability))
    );
    const allParts = proc.equipment.flatMap((eq) => eq.parts);
    const topCost = proc.equipment
      .flatMap((eq) =>
        eq.parts.map((p) =>
          costOfInaction(
            p.expectedDowntimeMin,
            eq.unitsPerHour,
            eq.marginPerUnit
          )
        )
      )
      .reduce((max, v) => Math.max(max, v), 0);

    return {
      id: proc.id,
      name: proc.name,
      risk: processRisk(equipmentRisks),
      equipmentCount: proc.equipment.length,
      partCount: allParts.length,
      topCostOfInaction: topCost,
    };
  });
}

/** A process with its equipment, each equipment risk-flagged. */
export async function getProcessDetail(processId: string) {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    include: {
      facility: true,
      equipment: {
        include: { parts: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!process) return null;

  const equipment: EquipmentWithRisk[] = process.equipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    manufacturer: eq.manufacturer,
    risk: equipmentRisk(eq.parts.map((p) => p.failureProbability)),
    partCount: eq.parts.length,
    topCostOfInaction: eq.parts.reduce(
      (max, p) =>
        Math.max(
          max,
          costOfInaction(
            p.expectedDowntimeMin,
            eq.unitsPerHour,
            eq.marginPerUnit
          )
        ),
      0
    ),
  }));

  return { process, equipment };
}

/** Equipment detail: parts (with cost-of-inaction) and PM schedule. */
export async function getEquipmentDetail(equipmentId: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      process: true,
      parts: { orderBy: { failureProbability: "desc" } },
      tasks: { orderBy: { scheduledDate: "asc" } },
    },
  });
  if (!equipment) return null;

  const parts = equipment.parts.map((p) => ({
    ...p,
    risk: riskLevel(p.failureProbability),
    costOfInaction: costOfInaction(
      p.expectedDowntimeMin,
      equipment.unitsPerHour,
      equipment.marginPerUnit
    ),
  }));

  return {
    equipment,
    parts,
    risk: equipmentRisk(equipment.parts.map((p) => p.failureProbability)),
  };
}

/** Single part detail with its equipment for cost calculations. */
export async function getPartDetail(partId: string) {
  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: { equipment: { include: { process: true } } },
  });
  if (!part) return null;

  return {
    part,
    risk: riskLevel(part.failureProbability),
    costOfInaction: costOfInaction(
      part.expectedDowntimeMin,
      part.equipment.unitsPerHour,
      part.equipment.marginPerUnit
    ),
  };
}

/** All parts in the facility with computed cost-of-inaction and risk. */
export async function getAllPartsWithCost(facilityId: string) {
  const parts = await prisma.part.findMany({
    where: { equipment: { process: { facilityId } } },
    include: { equipment: { include: { process: true } } },
  });

  return parts.map((p) => ({
    ...p,
    risk: riskLevel(p.failureProbability),
    costOfInaction: costOfInaction(
      p.expectedDowntimeMin,
      p.equipment.unitsPerHour,
      p.equipment.marginPerUnit
    ),
  }));
}

/** Maintenance tasks across the facility, with part + equipment context. */
export async function getTasks(facilityId: string) {
  return prisma.maintenanceTask.findMany({
    where: { equipment: { process: { facilityId } } },
    include: {
      part: true,
      equipment: { include: { process: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });
}
