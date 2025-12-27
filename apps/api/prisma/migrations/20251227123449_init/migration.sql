-- CreateTable
CREATE TABLE "Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT,
    "bodyType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "powerHp" INTEGER
);

-- CreateTable
CREATE TABLE "DailyPuzzle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,
    CONSTRAINT "DailyPuzzle_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Car_make_model_idx" ON "Car"("make", "model");

-- CreateIndex
CREATE INDEX "Car_yearStart_yearEnd_idx" ON "Car"("yearStart", "yearEnd");

-- CreateIndex
CREATE INDEX "Car_bodyType_fuelType_transmission_idx" ON "Car"("bodyType", "fuelType", "transmission");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPuzzle_date_key" ON "DailyPuzzle"("date");

-- CreateIndex
CREATE INDEX "DailyPuzzle_carId_idx" ON "DailyPuzzle"("carId");
