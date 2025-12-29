import { prisma } from "../prisma";
import { evaluateModelGuess } from "../game/evaluateModelGuess";
import { evaluateVariantGuess } from "../game/evaluateVariantGuess";
import { BadRequestError, NotFoundError } from "../errors";
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

function buildModelLabel(model: {
  make: string;
  model: string;
  generation: string | null;
  countryOfOrigin: string;
  productionStartYear: number;
}): string {
  const generationPart = model.generation ? ` (${model.generation})` : "";
  return `${model.make} ${model.model}${generationPart} - ${model.countryOfOrigin} - ${model.productionStartYear}`;
}

function buildVariantLabel(variant: {
  model: {
    make: string;
    model: string;
    generation: string | null;
    productionStartYear: number;
  };
  fuelType: string | null;
  transmission: string | null;
  powerHp: number | null;
  engineType: string | null;
  displacementCc: number | null;
  productionStartYear: number | null;
}): string {
  const generationPart = variant.model.generation ? ` (${variant.model.generation})` : "";
  const base = `${variant.model.make} ${variant.model.model}${generationPart}`;

  const parts: string[] = [];

  if (variant.engineType) {
    parts.push(variant.engineType);
  }

  if (variant.displacementCc) {
    const liters = (variant.displacementCc / 1000).toFixed(1).replace(/\.0$/, "");
    parts.push(liters);
  }

  if (variant.powerHp) {
    parts.push(`${variant.powerHp}hp`);
  }

  if (variant.fuelType) {
    parts.push(
      variant.fuelType === "PETROL"
        ? "Petrol"
        : variant.fuelType === "DIESEL"
        ? "Diesel"
        : variant.fuelType === "ELECTRIC"
        ? "Electric"
        : variant.fuelType === "HYBRID"
        ? "Hybrid"
        : variant.fuelType
    );
  }

  if (variant.transmission) {
    parts.push(variant.transmission === "AUTOMATIC" ? "Auto" : "Manual");
  }

  const year = variant.productionStartYear ?? variant.model.productionStartYear;
  const details = parts.length > 0 ? ` ${parts.join(" ")}` : "";
  return `${base}${details} - ${year}`;
}

export async function createModelGuessFeedback(puzzleId: number, guessId: number) {
  const today = formatDateEuropeParis(new Date());

  const puzzle = await prisma.dailyPuzzle.findUnique({
    where: { id: puzzleId },
    include: { targetModel: true }
  });

  if (!puzzle) {
    throw new BadRequestError("Invalid puzzle.");
  }

  if (puzzle.mode !== PuzzleMode.EASY || puzzle.date !== today || !puzzle.targetModelId) {
    throw new BadRequestError("Puzzle is not today's EASY puzzle.");
  }

  const guess = await prisma.carModel.findUnique({
    where: { id: guessId }
  });

  if (!guess) {
    throw new NotFoundError("Guess model not found.");
  }

  if (!puzzle.targetModel) {
    throw new BadRequestError("Puzzle target not found.");
  }

  const feedback = evaluateModelGuess(puzzle.targetModel, guess);

  return {
    feedback,
    guess: {
      id: guess.id,
      label: buildModelLabel(guess)
    }
  };
}

export async function createVariantGuessFeedback(puzzleId: number, guessId: number) {
  const today = formatDateEuropeParis(new Date());

  const puzzle = await prisma.dailyPuzzle.findUnique({
    where: { id: puzzleId },
    include: { targetVariant: { include: { model: true } } }
  });

  if (!puzzle) {
    throw new BadRequestError("Invalid puzzle.");
  }

  if (puzzle.mode !== PuzzleMode.HARD || puzzle.date !== today || !puzzle.targetVariantId) {
    throw new BadRequestError("Puzzle is not today's HARD puzzle.");
  }

  const guess = await prisma.carVariant.findUnique({
    where: { id: guessId },
    include: { model: true }
  });

  if (!guess) {
    throw new NotFoundError("Guess variant not found.");
  }

  if (!puzzle.targetVariant) {
    throw new BadRequestError("Puzzle target not found.");
  }

  const feedback = evaluateVariantGuess(puzzle.targetVariant, guess);

  return {
    feedback,
    guess: {
      id: guess.id,
      label: buildVariantLabel(guess)
    }
  };
}
