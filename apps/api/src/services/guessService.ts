import { prisma } from "../prisma";
import { evaluateGuess } from "../game/evaluateGuess";
import { buildCarLabel } from "../game/formatCarLabel";
import { NotFoundError } from "../errors";

export async function createGuessFeedback(puzzleId: number, guessCarId: number) {
  const puzzle = await prisma.dailyPuzzle.findUnique({
    where: { id: puzzleId },
    include: { car: true }
  });

  if (!puzzle) {
    throw new NotFoundError("Puzzle not found.");
  }

  const guess = await prisma.car.findUnique({
    where: { id: guessCarId }
  });

  if (!guess) {
    throw new NotFoundError("Guess car not found.");
  }

  const feedback = evaluateGuess(puzzle.car, guess);

  return {
    feedback,
    guess: {
      id: guess.id,
      label: buildCarLabel(guess),
      yearStart: guess.yearStart,
      powerHp: guess.powerHp
    }
  };
}
