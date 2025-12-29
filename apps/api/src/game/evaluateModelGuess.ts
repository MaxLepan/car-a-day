import { CarModel } from "@prisma/client";

type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type ModelGuessFeedback = {
  make: FieldFeedback<"correct" | "wrong", string>;
  model: FieldFeedback<"correct" | "wrong", string>;
  generation: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  bodyType: FieldFeedback<"correct" | "wrong", string>;
  countryOfOrigin: FieldFeedback<"correct" | "wrong", string>;
  productionStartYear: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number>;
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

export function evaluateModelGuess(target: CarModel, guess: CarModel): ModelGuessFeedback {
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
    bodyType: {
      status: compareString(target.bodyType, guess.bodyType),
      value: target.bodyType
    },
    countryOfOrigin: {
      status: compareString(target.countryOfOrigin, guess.countryOfOrigin),
      value: target.countryOfOrigin
    },
    productionStartYear: {
      status: compareNullableNumber(target.productionStartYear, guess.productionStartYear),
      value: target.productionStartYear
    }
  };
}
