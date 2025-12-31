import { prisma } from "../prisma";

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deterministicIndexFromDate(dateStr: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return max === 0 ? 0 : hash % max;
}

export async function getOrCreateTodayPuzzle(): Promise<{ id: number; date: string; carId: number }> {
  const today = formatDate(new Date());

  const existing = await prisma.dailyPuzzle.findUnique({
    where: { date: today }
  });

  if (existing) {
    return { id: existing.id, date: existing.date, carId: existing.carId };
  }

  const cars = await prisma.car.findMany({
    select: { id: true },
    orderBy: { id: "asc" }
  });

  if (cars.length === 0) {
    throw new Error("No cars available to create today's puzzle.");
  }

  const index = deterministicIndexFromDate(today, cars.length);
  const selectedCar = cars[index];

  const created = await prisma.dailyPuzzle.create({
    data: {
      date: today,
      carId: selectedCar.id
    }
  });

  return { id: created.id, date: created.date, carId: created.carId };
}
