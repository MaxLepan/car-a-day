import { prisma } from "../prisma";
import { PuzzleMode } from "@prisma/client";

function formatDateEuropeParis(date: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date);
}

function deterministicIndexFromKey(key: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return max === 0 ? 0 : hash % max;
}

export async function getOrCreateTodayPuzzle(
  mode: PuzzleMode
): Promise<{ id: number; date: string; mode: PuzzleMode }> {
  const today = formatDateEuropeParis(new Date());

  const existing = await prisma.dailyPuzzle.findUnique({
    where: { date_mode: { date: today, mode } }
  });

  if (existing) {
    return { id: existing.id, date: existing.date, mode: existing.mode };
  }

  const otherMode = mode === "EASY" ? "HARD" : "EASY";
  const otherPuzzle = await prisma.dailyPuzzle.findUnique({
    where: { date_mode: { date: today, mode: otherMode } },
    include: {
      targetModel: true,
      targetVariant: true
    }
  });

  if (mode === "EASY") {
    const allModels = await prisma.carModel.findMany({
      select: { id: true },
      orderBy: { id: "asc" }
    });

    if (allModels.length === 0) {
      throw new Error("No car models available to create today's puzzle.");
    }

    const avoidModelId = otherPuzzle?.targetVariant?.modelId ?? null;
    const candidates = avoidModelId
      ? allModels.filter((model) => model.id !== avoidModelId)
      : allModels;

    const pool = candidates.length > 0 ? candidates : allModels;
    const index = deterministicIndexFromKey(`${today}-EASY`, pool.length);
    const selected = pool[index];

    const created = await prisma.dailyPuzzle.create({
      data: {
        date: today,
        mode: "EASY",
        targetModelId: selected.id,
        targetVariantId: null
      }
    });

    return { id: created.id, date: created.date, mode: created.mode };
  }

  const allVariants = await prisma.carVariant.findMany({
    select: { id: true, modelId: true },
    orderBy: { id: "asc" }
  });

  if (allVariants.length === 0) {
    throw new Error("No car variants available to create today's puzzle.");
  }

  const avoidModelId = otherPuzzle?.targetModel?.id ?? null;
  const candidates = avoidModelId
    ? allVariants.filter((variant) => variant.modelId !== avoidModelId)
    : allVariants;

  const pool = candidates.length > 0 ? candidates : allVariants;
  const index = deterministicIndexFromKey(`${today}-HARD`, pool.length);
  const selected = pool[index];

  const created = await prisma.dailyPuzzle.create({
    data: {
      date: today,
      mode: "HARD",
      targetModelId: null,
      targetVariantId: selected.id
    }
  });

  return { id: created.id, date: created.date, mode: created.mode };
}
