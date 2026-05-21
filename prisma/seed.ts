import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: a date `days` from today (negative = past).
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // Clean slate (idempotent re-seed).
  await prisma.maintenanceTask.deleteMany();
  await prisma.part.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.process.deleteMany();
  await prisma.facility.deleteMany();

  const facility = await prisma.facility.create({
    data: {
      name: "Green Valley Creamery — Cottage Cheese & Milk Plant",
      annualMaintenanceBudget: 60000,
    },
  });

  const pasteurization = await prisma.process.create({
    data: { name: "Pasteurization", facilityId: facility.id },
  });
  const culturing = await prisma.process.create({
    data: { name: "Culturing", facilityId: facility.id },
  });
  const packaging = await prisma.process.create({
    data: { name: "Packaging", facilityId: facility.id },
  });

  // --- Pasteurization equipment ---
  const homogenizer = await prisma.equipment.create({
    data: {
      name: "Homogenizer",
      manufacturer: "GEA Niro",
      processId: pasteurization.id,
      blueprintRef: "BP-HOM-2200.pdf",
      cutSheetRef: "CS-GEA-HOM.pdf",
      unitsPerHour: 4000,
      marginPerUnit: 0.42,
    },
  });
  const htst = await prisma.equipment.create({
    data: {
      name: "HTST Pasteurizer",
      manufacturer: "Alfa Laval",
      processId: pasteurization.id,
      blueprintRef: "BP-HTST-flow.pdf",
      cutSheetRef: "CS-ALFA-HTST.pdf",
      unitsPerHour: 4200,
      marginPerUnit: 0.40,
    },
  });
  const cipPump = await prisma.equipment.create({
    data: {
      name: "CIP Pump",
      manufacturer: "Fristam",
      processId: pasteurization.id,
      blueprintRef: "BP-CIP-loop.pdf",
      cutSheetRef: "CS-FRISTAM-FPX.pdf",
      unitsPerHour: 3800,
      marginPerUnit: 0.38,
    },
  });
  const separator = await prisma.equipment.create({
    data: {
      name: "Cream Separator",
      manufacturer: "Tetra Pak",
      processId: pasteurization.id,
      blueprintRef: "BP-SEP-centrifuge.pdf",
      cutSheetRef: "CS-TETRA-SEP.pdf",
      unitsPerHour: 3900,
      marginPerUnit: 0.45,
    },
  });

  // --- Culturing equipment ---
  const cultureTank = await prisma.equipment.create({
    data: {
      name: "Culture Tank",
      manufacturer: "Feldmeier",
      processId: culturing.id,
      blueprintRef: "BP-CT-jacketed.pdf",
      cutSheetRef: "CS-FELD-TANK.pdf",
      unitsPerHour: 2600,
      marginPerUnit: 0.55,
    },
  });

  // --- Packaging equipment ---
  const filler1 = await prisma.equipment.create({
    data: {
      name: "Filler #1",
      manufacturer: "Oystar",
      processId: packaging.id,
      blueprintRef: "BP-FILL1-rotary.pdf",
      cutSheetRef: "CS-OYSTAR-F1.pdf",
      unitsPerHour: 2400,
      marginPerUnit: 0.62,
    },
  });
  const filler2 = await prisma.equipment.create({
    data: {
      name: "Filler #2",
      manufacturer: "Oystar",
      processId: packaging.id,
      blueprintRef: "BP-FILL2-rotary.pdf",
      cutSheetRef: "CS-OYSTAR-F2.pdf",
      unitsPerHour: 2200,
      marginPerUnit: 0.64,
    },
  });
  const casePacker = await prisma.equipment.create({
    data: {
      name: "Case Packer",
      manufacturer: "Douglas Machine",
      processId: packaging.id,
      blueprintRef: "BP-CP-cartoner.pdf",
      cutSheetRef: "CS-DOUGLAS-CP.pdf",
      unitsPerHour: 2300,
      marginPerUnit: 0.30,
    },
  });

  // --- Parts ---
  type PartSeed = {
    name: string;
    equipmentId: string;
    partNumber: string;
    supplier: string;
    unitCost: number;
    leadTimeDays: number;
    lastReplaced: number; // days from now (negative)
    nextDue: number; // days from now
    failureProbability: number;
    expectedDowntimeMin: number;
  };

  const parts: PartSeed[] = [
    // Homogenizer
    {
      name: "Piston Seal Kit",
      equipmentId: homogenizer.id,
      partNumber: "GEA-PS-118",
      supplier: "GEA Parts Direct",
      unitCost: 320,
      leadTimeDays: 5,
      lastReplaced: -210,
      nextDue: 45,
      failureProbability: 0.34,
      expectedDowntimeMin: 90,
    },
    {
      name: "Homogenizing Valve",
      equipmentId: homogenizer.id,
      partNumber: "GEA-HV-204",
      supplier: "GEA Parts Direct",
      unitCost: 1450,
      leadTimeDays: 12,
      lastReplaced: -400,
      nextDue: 120,
      failureProbability: 0.18,
      expectedDowntimeMin: 150,
    },
    {
      name: "Drive Coupling",
      equipmentId: homogenizer.id,
      partNumber: "GEA-DC-051",
      supplier: "Motion Industries",
      unitCost: 240,
      leadTimeDays: 3,
      lastReplaced: -120,
      nextDue: 200,
      failureProbability: 0.09,
      expectedDowntimeMin: 60,
    },
    // HTST Pasteurizer
    {
      name: "Plate Gasket Set",
      equipmentId: htst.id,
      partNumber: "AL-PG-880",
      supplier: "Alfa Laval Service",
      unitCost: 980,
      leadTimeDays: 9,
      lastReplaced: -330,
      nextDue: 30,
      failureProbability: 0.52,
      expectedDowntimeMin: 240,
    },
    {
      name: "Flow Diversion Valve",
      equipmentId: htst.id,
      partNumber: "AL-FDV-410",
      supplier: "Alfa Laval Service",
      unitCost: 1620,
      leadTimeDays: 14,
      lastReplaced: -260,
      nextDue: 75,
      failureProbability: 0.41,
      expectedDowntimeMin: 180,
    },
    {
      name: "RTD Temperature Probe",
      equipmentId: htst.id,
      partNumber: "AL-RTD-027",
      supplier: "Instrumart",
      unitCost: 210,
      leadTimeDays: 4,
      lastReplaced: -90,
      nextDue: 150,
      failureProbability: 0.15,
      expectedDowntimeMin: 45,
    },
    // CIP Pump
    {
      name: "Mechanical Seal",
      equipmentId: cipPump.id,
      partNumber: "FR-MS-302",
      supplier: "Fristam Pumps",
      unitCost: 165,
      leadTimeDays: 6,
      lastReplaced: -180,
      nextDue: 20,
      failureProbability: 0.64,
      expectedDowntimeMin: 120,
    },
    {
      name: "Impeller",
      equipmentId: cipPump.id,
      partNumber: "FR-IMP-115",
      supplier: "Fristam Pumps",
      unitCost: 430,
      leadTimeDays: 8,
      lastReplaced: -300,
      nextDue: 95,
      failureProbability: 0.27,
      expectedDowntimeMin: 90,
    },
    // Cream Separator
    {
      name: "Bowl Bearing",
      equipmentId: separator.id,
      partNumber: "TP-BB-770",
      supplier: "Tetra Pak Service",
      unitCost: 890,
      leadTimeDays: 15,
      lastReplaced: -420,
      nextDue: 55,
      failureProbability: 0.48,
      expectedDowntimeMin: 300,
    },
    {
      name: "Friction Pads",
      equipmentId: separator.id,
      partNumber: "TP-FP-233",
      supplier: "Tetra Pak Service",
      unitCost: 145,
      leadTimeDays: 7,
      lastReplaced: -160,
      nextDue: 110,
      failureProbability: 0.22,
      expectedDowntimeMin: 75,
    },
    {
      name: "Drive Belt",
      equipmentId: separator.id,
      partNumber: "TP-DB-409",
      supplier: "Motion Industries",
      unitCost: 95,
      leadTimeDays: 2,
      lastReplaced: -240,
      nextDue: 165,
      failureProbability: 0.31,
      expectedDowntimeMin: 60,
    },
    // Culture Tank
    {
      name: "Agitator Motor Bearing",
      equipmentId: cultureTank.id,
      partNumber: "FM-AMB-512",
      supplier: "Motion Industries",
      unitCost: 275,
      leadTimeDays: 5,
      lastReplaced: -200,
      nextDue: 40,
      failureProbability: 0.38,
      expectedDowntimeMin: 120,
    },
    {
      name: "Jacket Temperature Sensor",
      equipmentId: cultureTank.id,
      partNumber: "FM-JTS-088",
      supplier: "Instrumart",
      unitCost: 190,
      leadTimeDays: 4,
      lastReplaced: -100,
      nextDue: 175,
      failureProbability: 0.12,
      expectedDowntimeMin: 30,
    },
    {
      name: "Inlet Valve Seat",
      equipmentId: cultureTank.id,
      partNumber: "FM-IVS-141",
      supplier: "Feldmeier Parts",
      unitCost: 130,
      leadTimeDays: 6,
      lastReplaced: -280,
      nextDue: 85,
      failureProbability: 0.25,
      expectedDowntimeMin: 60,
    },
    // Filler #1
    {
      name: "Drive Belt",
      equipmentId: filler1.id,
      partNumber: "OY-DB-300",
      supplier: "Oystar Aftermarket",
      unitCost: 175,
      leadTimeDays: 3,
      lastReplaced: -150,
      nextDue: 60,
      failureProbability: 0.33,
      expectedDowntimeMin: 150,
    },
    {
      name: "Fill Nozzle Assembly",
      equipmentId: filler1.id,
      partNumber: "OY-FN-622",
      supplier: "Oystar Aftermarket",
      unitCost: 540,
      leadTimeDays: 10,
      lastReplaced: -310,
      nextDue: 130,
      failureProbability: 0.19,
      expectedDowntimeMin: 90,
    },
    {
      name: "Servo Drive",
      equipmentId: filler1.id,
      partNumber: "OY-SD-905",
      supplier: "Allied Automation",
      unitCost: 1980,
      leadTimeDays: 18,
      lastReplaced: -500,
      nextDue: 220,
      failureProbability: 0.14,
      expectedDowntimeMin: 240,
    },
    // Filler #2 — worked example
    {
      name: "Drive Belt",
      equipmentId: filler2.id,
      partNumber: "OY-DB-301",
      supplier: "Oystar Aftermarket",
      unitCost: 185,
      leadTimeDays: 2,
      lastReplaced: -175,
      nextDue: 14,
      failureProbability: 0.78,
      expectedDowntimeMin: 180,
    },
    {
      name: "Fill Nozzle Assembly",
      equipmentId: filler2.id,
      partNumber: "OY-FN-623",
      supplier: "Oystar Aftermarket",
      unitCost: 540,
      leadTimeDays: 10,
      lastReplaced: -210,
      nextDue: 70,
      failureProbability: 0.29,
      expectedDowntimeMin: 90,
    },
    {
      name: "Capping Head Spring",
      equipmentId: filler2.id,
      partNumber: "OY-CHS-118",
      supplier: "Oystar Aftermarket",
      unitCost: 60,
      leadTimeDays: 4,
      lastReplaced: -120,
      nextDue: 140,
      failureProbability: 0.21,
      expectedDowntimeMin: 40,
    },
    // Case Packer
    {
      name: "Vacuum Cup Set",
      equipmentId: casePacker.id,
      partNumber: "DM-VCS-260",
      supplier: "Douglas Service",
      unitCost: 220,
      leadTimeDays: 5,
      lastReplaced: -90,
      nextDue: 50,
      failureProbability: 0.36,
      expectedDowntimeMin: 60,
    },
    {
      name: "Flap Folding Belt",
      equipmentId: casePacker.id,
      partNumber: "DM-FFB-471",
      supplier: "Motion Industries",
      unitCost: 140,
      leadTimeDays: 4,
      lastReplaced: -200,
      nextDue: 105,
      failureProbability: 0.17,
      expectedDowntimeMin: 75,
    },
  ];

  const createdParts: Record<string, { id: string; equipmentId: string }> = {};
  for (const p of parts) {
    const created = await prisma.part.create({
      data: {
        name: p.name,
        equipmentId: p.equipmentId,
        partNumber: p.partNumber,
        supplier: p.supplier,
        unitCost: p.unitCost,
        leadTimeDays: p.leadTimeDays,
        lastReplaced: daysFromNow(p.lastReplaced),
        nextDue: daysFromNow(p.nextDue),
        failureProbability: p.failureProbability,
        expectedDowntimeMin: p.expectedDowntimeMin,
      },
    });
    createdParts[p.partNumber] = {
      id: created.id,
      equipmentId: p.equipmentId,
    };
  }

  // --- Maintenance tasks ---
  type TaskSeed = {
    type: "PM" | "PREDICTED_FAILURE" | "WORK_ORDER";
    title: string;
    partNumber?: string;
    equipmentId: string;
    scheduledDate: number;
    status: "OPEN" | "DONE";
  };

  const tasks: TaskSeed[] = [
    // Current week
    {
      type: "PREDICTED_FAILURE",
      title: "Replace Drive Belt before predicted failure",
      partNumber: "OY-DB-301",
      equipmentId: filler2.id,
      scheduledDate: 2,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "Quarterly CIP Pump seal inspection",
      partNumber: "FR-MS-302",
      equipmentId: cipPump.id,
      scheduledDate: 3,
      status: "OPEN",
    },
    {
      type: "WORK_ORDER",
      title: "Recalibrate HTST temperature probe",
      partNumber: "AL-RTD-027",
      equipmentId: htst.id,
      scheduledDate: 4,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "Lubricate Homogenizer drive coupling",
      partNumber: "GEA-DC-051",
      equipmentId: homogenizer.id,
      scheduledDate: -1,
      status: "DONE",
    },
    // Next ~60 days
    {
      type: "PREDICTED_FAILURE",
      title: "Replace CIP Pump mechanical seal",
      partNumber: "FR-MS-302",
      equipmentId: cipPump.id,
      scheduledDate: 18,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "HTST plate pack gasket service",
      partNumber: "AL-PG-880",
      equipmentId: htst.id,
      scheduledDate: 12,
      status: "OPEN",
    },
    {
      type: "WORK_ORDER",
      title: "Replace Case Packer vacuum cups",
      partNumber: "DM-VCS-260",
      equipmentId: casePacker.id,
      scheduledDate: 22,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "Culture Tank agitator bearing PM",
      partNumber: "FM-AMB-512",
      equipmentId: cultureTank.id,
      scheduledDate: 28,
      status: "OPEN",
    },
    {
      type: "PREDICTED_FAILURE",
      title: "Replace Cream Separator bowl bearing",
      partNumber: "TP-BB-770",
      equipmentId: separator.id,
      scheduledDate: 35,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "Filler #1 drive belt tension check",
      partNumber: "OY-DB-300",
      equipmentId: filler1.id,
      scheduledDate: 40,
      status: "OPEN",
    },
    {
      type: "WORK_ORDER",
      title: "Homogenizer piston seal kit replacement",
      partNumber: "GEA-PS-118",
      equipmentId: homogenizer.id,
      scheduledDate: 44,
      status: "OPEN",
    },
    {
      type: "PREDICTED_FAILURE",
      title: "Replace HTST flow diversion valve",
      partNumber: "AL-FDV-410",
      equipmentId: htst.id,
      scheduledDate: 52,
      status: "OPEN",
    },
    {
      type: "PM",
      title: "Case Packer flap folding belt inspection",
      partNumber: "DM-FFB-471",
      equipmentId: casePacker.id,
      scheduledDate: 58,
      status: "OPEN",
    },
    {
      type: "WORK_ORDER",
      title: "Filler #2 fill nozzle rebuild",
      partNumber: "OY-FN-623",
      equipmentId: filler2.id,
      scheduledDate: 9,
      status: "OPEN",
    },
  ];

  for (const t of tasks) {
    const part = t.partNumber ? createdParts[t.partNumber] : undefined;
    await prisma.maintenanceTask.create({
      data: {
        type: t.type,
        title: t.title,
        partId: part?.id ?? null,
        equipmentId: t.equipmentId,
        scheduledDate: daysFromNow(t.scheduledDate),
        status: t.status,
      },
    });
  }

  console.log(
    `Seeded facility "${facility.name}" with 3 processes, 8 equipment, ${parts.length} parts, ${tasks.length} maintenance tasks.`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
