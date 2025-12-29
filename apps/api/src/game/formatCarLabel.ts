type CarLabelInput = {
  make: string;
  model: string;
  generation: string | null;
  originCountry: string;
  yearStart: number | null;
};

function flagFromCountry(country: string): string {
  const map: Record<string, string> = {
    France: "🇫🇷",
    Germany: "🇩🇪",
    Japan: "🇯🇵",
    USA: "🇺🇸"
  };
  return map[country] ?? "🏳️";
}

export function buildCarLabel(car: CarLabelInput): string {
  const flag = flagFromCountry(car.originCountry);
  const base = `${car.make} ${car.model}`;
  const generationPart = car.generation ? ` (${car.generation})` : "";
  const yearPart = car.yearStart ? ` [${car.yearStart}]` : "";
  return `${flag} ${base}${generationPart}${yearPart}`;
}
