import { Car } from "@prisma/client";

type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type GuessFeedback = {
  make: FieldFeedback<"correct" | "wrong", string>;
  model: FieldFeedback<"correct" | "wrong", string>;
  generation: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  originCountry: FieldFeedback<"correct" | "wrong", string>;
  bodyType: FieldFeedback<"correct" | "wrong", string>;
  fuelType: FieldFeedback<"correct" | "wrong", string>;
  transmission: FieldFeedback<"correct" | "wrong", string>;
  yearStart: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number>;
  powerHp: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>;
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
    make: {
      status: compareString(target.make, guess.make),
      value: target.make
    },
    model: {
      status: compareString(target.model, guess.model),
      value: target.model
    },
    generation: {
      status: compareNullableString(target.generation, guess.generation),
      value: target.generation
    },
    originCountry: {
      status: compareString(target.originCountry, guess.originCountry),
      value: target.originCountry
    },
    bodyType: {
      status: compareString(target.bodyType, guess.bodyType),
      value: target.bodyType
    },
    fuelType: {
      status: compareString(target.fuelType, guess.fuelType),
      value: target.fuelType
    },
    transmission: {
      status: compareString(target.transmission, guess.transmission),
      value: target.transmission
    },
    yearStart: {
      status: compareNullableNumber(target.yearStart, guess.yearStart),
      value: target.yearStart
    },
    powerHp: {
      status: compareNullableNumber(target.powerHp, guess.powerHp),
      value: target.powerHp
    }
  };
}
