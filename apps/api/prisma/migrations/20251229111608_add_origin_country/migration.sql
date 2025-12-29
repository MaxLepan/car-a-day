-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT,
    "originCountry" TEXT NOT NULL DEFAULT 'Unknown',
    "bodyType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "powerHp" INTEGER
);
INSERT INTO "new_Car" ("bodyType", "fuelType", "generation", "id", "make", "model", "powerHp", "transmission", "yearEnd", "yearStart") SELECT "bodyType", "fuelType", "generation", "id", "make", "model", "powerHp", "transmission", "yearEnd", "yearStart" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE INDEX "Car_make_model_idx" ON "Car"("make", "model");
CREATE INDEX "Car_originCountry_idx" ON "Car"("originCountry");
CREATE INDEX "Car_yearStart_yearEnd_idx" ON "Car"("yearStart", "yearEnd");
CREATE INDEX "Car_bodyType_fuelType_transmission_idx" ON "Car"("bodyType", "fuelType", "transmission");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
