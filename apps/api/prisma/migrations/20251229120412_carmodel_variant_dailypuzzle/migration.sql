/*
  Warnings:

  - You are about to drop the `Car` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `carId` on the `DailyPuzzle` table. All the data in the column will be lost.
  - Added the required column `mode` to the `DailyPuzzle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Car_bodyType_fuelType_transmission_idx";

-- DropIndex
DROP INDEX "Car_yearStart_yearEnd_idx";

-- DropIndex
DROP INDEX "Car_originCountry_idx";

-- DropIndex
DROP INDEX "Car_make_model_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Car";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CarModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT,
    "bodyType" TEXT NOT NULL,
    "countryOfOrigin" TEXT NOT NULL,
    "productionStartYear" INTEGER NOT NULL,
    "productionEndYear" INTEGER
);

-- CreateTable
CREATE TABLE "CarVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "powerHp" INTEGER,
    "engineType" TEXT,
    "displacementCc" INTEGER,
    "maxSpeedKmh" INTEGER,
    "zeroToHundredSec" REAL,
    "productionStartYear" INTEGER,
    "productionEndYear" INTEGER,
    CONSTRAINT "CarVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyPuzzle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "targetModelId" INTEGER,
    "targetVariantId" INTEGER,
    CONSTRAINT "DailyPuzzle_targetModelId_fkey" FOREIGN KEY ("targetModelId") REFERENCES "CarModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyPuzzle_targetVariantId_fkey" FOREIGN KEY ("targetVariantId") REFERENCES "CarVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyPuzzle" ("date", "id") SELECT "date", "id" FROM "DailyPuzzle";
DROP TABLE "DailyPuzzle";
ALTER TABLE "new_DailyPuzzle" RENAME TO "DailyPuzzle";
CREATE INDEX "DailyPuzzle_mode_idx" ON "DailyPuzzle"("mode");
CREATE INDEX "DailyPuzzle_targetModelId_idx" ON "DailyPuzzle"("targetModelId");
CREATE INDEX "DailyPuzzle_targetVariantId_idx" ON "DailyPuzzle"("targetVariantId");
CREATE UNIQUE INDEX "DailyPuzzle_date_mode_key" ON "DailyPuzzle"("date", "mode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CarModel_make_model_idx" ON "CarModel"("make", "model");

-- CreateIndex
CREATE INDEX "CarModel_countryOfOrigin_idx" ON "CarModel"("countryOfOrigin");

-- CreateIndex
CREATE INDEX "CarModel_productionStartYear_productionEndYear_idx" ON "CarModel"("productionStartYear", "productionEndYear");

-- CreateIndex
CREATE INDEX "CarVariant_modelId_idx" ON "CarVariant"("modelId");

-- CreateIndex
CREATE INDEX "CarVariant_fuelType_transmission_idx" ON "CarVariant"("fuelType", "transmission");

-- CreateIndex
CREATE INDEX "CarVariant_powerHp_idx" ON "CarVariant"("powerHp");
