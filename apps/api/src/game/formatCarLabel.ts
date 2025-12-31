type CarLabelInput = {
  make: string;
  model: string;
  generation: string | null;
  yearStart: number | null;
};

export function buildCarLabel(car: CarLabelInput): string {
  const base = `${car.make} ${car.model}`;
  const generationPart = car.generation ? ` (${car.generation})` : "";
  const yearPart = car.yearStart ? ` [${car.yearStart}]` : "";
  return `${base}${generationPart}${yearPart}`;
}
