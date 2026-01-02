import { prisma } from "../prisma";
import { CarModel, CarVariant, PuzzleMode } from "@prisma/client";

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

export function getDateKey(date: Date): string {
  return formatDateEuropeParis(date);
}

type PuzzleWithTargets = {
  id: number;
  date: string;
  mode: PuzzleMode;
  targetModel: CarModel | null;
  targetVariant: (CarVariant & { model: CarModel }) | null;
};

export async function getOrCreatePuzzleForDate(
  date: string,
  mode: PuzzleMode
): Promise<PuzzleWithTargets> {
  const existing = await prisma.dailyPuzzle.findUnique({
    where: { date_mode: { date, mode } },
    include: {
      targetModel: true,
      targetVariant: { include: { model: true } }
    }
  });

  if (existing) {
    return {
      id: existing.id,
      date: existing.date,
      mode: existing.mode,
      targetModel: existing.targetModel,
      targetVariant: existing.targetVariant
    };
  }

  const otherMode = mode === "EASY" ? "HARD" : "EASY";
  const otherPuzzle = await prisma.dailyPuzzle.findUnique({
    where: { date_mode: { date, mode: otherMode } },
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
    const index = deterministicIndexFromKey(`${date}-EASY`, pool.length);
    const selected = pool[index];

    const created = await prisma.dailyPuzzle.create({
      data: {
        date,
        mode: "EASY",
        targetModelId: selected.id,
        targetVariantId: null
      },
      include: {
        targetModel: true,
        targetVariant: { include: { model: true } }
      }
    });

    return {
      id: created.id,
      date: created.date,
      mode: created.mode,
      targetModel: created.targetModel,
      targetVariant: created.targetVariant
    };
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
  const index = deterministicIndexFromKey(`${date}-HARD`, pool.length);
  const selected = pool[index];

  const created = await prisma.dailyPuzzle.create({
    data: {
      date,
      mode: "HARD",
      targetModelId: null,
      targetVariantId: selected.id
    },
    include: {
      targetModel: true,
      targetVariant: { include: { model: true } }
    }
  });

  return {
    id: created.id,
    date: created.date,
    mode: created.mode,
    targetModel: created.targetModel,
    targetVariant: created.targetVariant
  };
}
