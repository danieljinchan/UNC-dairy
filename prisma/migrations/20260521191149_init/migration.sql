-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "annualMaintenanceBudget" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    CONSTRAINT "Process_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "blueprintRef" TEXT NOT NULL,
    "cutSheetRef" TEXT NOT NULL,
    "unitsPerHour" REAL NOT NULL,
    "marginPerUnit" REAL NOT NULL,
    CONSTRAINT "Equipment_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "unitCost" REAL NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "lastReplaced" DATETIME NOT NULL,
    "nextDue" DATETIME NOT NULL,
    "failureProbability" REAL NOT NULL,
    "expectedDowntimeMin" INTEGER NOT NULL,
    CONSTRAINT "Part_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partId" TEXT,
    "equipmentId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "MaintenanceTask_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceTask_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
