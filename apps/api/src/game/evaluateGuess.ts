import { Car } from "@prisma/client";

export type GuessFeedback = {
  make: "correct" | "wrong";
  model: "correct" | "wrong";
  generation: "correct" | "wrong" | "unknown";
  bodyType: "correct" | "wrong";
  fuelType: "correct" | "wrong";
  transmission: "correct" | "wrong";
  yearStart: "correct" | "higher" | "lower" | "unknown";
  powerHp: "correct" | "higher" | "lower" | "unknown";
};

function compareString(target: string, guess: string): "correct" | "wrong" {
  return target === guess ? "correct" : "wrong";
}

function compareNullableString(
  target: string | null,
  guess: string | null
): "correct" | "wrong" | "unknown" {
  if (target === null || guess === null) {
    return "unknown";
  }
  return target === guess ? "correct" : "wrong";
}

function compareNullableNumber(
  target: number | null,
  guess: number | null
): "correct" | "higher" | "lower" | "unknown" {
  if (target === null || guess === null) {
    return "unknown";
  }
  if (target === guess) {
    return "correct";
  }
  return target > guess ? "higher" : "lower";
}

export function evaluateGuess(target: Car, guess: Car): GuessFeedback {
  return {
    make: compareString(target.make, guess.make),
    model: compareString(target.model, guess.model),
    generation: compareNullableString(target.generation, guess.generation),
    bodyType: compareString(target.bodyType, guess.bodyType),
    fuelType: compareString(target.fuelType, guess.fuelType),
    transmission: compareString(target.transmission, guess.transmission),
    yearStart: compareNullableNumber(target.yearStart, guess.yearStart),
    powerHp: compareNullableNumber(target.powerHp, guess.powerHp)
  };
}
