import { prisma } from "../prisma";
import { buildCarLabel } from "../game/formatCarLabel";

export async function searchCars(term: string): Promise<Array<{ id: number; label: string }>> {
  const query = term.trim();
  if (query.length === 0) {
    return [];
  }

  const cars = await prisma.car.findMany({
    where: {
      OR: [
        { make: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { generation: { contains: query, mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      make: true,
      model: true,
      generation: true,
      yearStart: true
    },
    orderBy: [{ make: "asc" }, { model: "asc" }, { yearStart: "asc" }],
    take: 10
  });

  return cars.map((car) => ({
    id: car.id,
    label: buildCarLabel(car)
  }));
}
