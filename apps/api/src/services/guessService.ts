import { prisma } from "../prisma";
import { evaluateModelGuess } from "../game/evaluateModelGuess";
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
