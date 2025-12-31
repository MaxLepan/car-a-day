import { CarModel, CarVariant } from "@prisma/client";

type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type VariantGuessFeedback = {
  make: FieldFeedback<"correct" | "wrong", string>;
  model: FieldFeedback<"correct" | "wrong", string>;
  generation: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  bodyType: FieldFeedback<"correct" | "wrong", string>;
  countryOfOrigin: FieldFeedback<"correct" | "wrong", string>;
  productionStartYear: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number>;
  fuelType: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  transmission: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  powerHp: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>;
  engineType: FieldFeedback<"correct" | "wrong" | "unknown", string | null>;
  displacementCc: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>;
  maxSpeedKmh: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>;
  zeroToHundredSec: FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>;
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

function getVariantStartYear(variant: CarVariant, model: CarModel): number {
  return variant.productionStartYear ?? model.productionStartYear;
}

export function evaluateVariantGuess(
  targetVariant: CarVariant & { model: CarModel },
  guessVariant: CarVariant & { model: CarModel }
): VariantGuessFeedback {
  const targetModel = targetVariant.model;
  const guessModel = guessVariant.model;

  return {
    make: {
      status: compareString(targetModel.make, guessModel.make),
      value: targetModel.make
    },
    model: {
      status: compareString(targetModel.model, guessModel.model),
      value: targetModel.model
    },
    generation: {
      status: compareNullableString(targetModel.generation, guessModel.generation),
      value: targetModel.generation
    },
    bodyType: {
      status: compareString(targetModel.bodyType, guessModel.bodyType),
      value: targetModel.bodyType
    },
    countryOfOrigin: {
      status: compareString(targetModel.countryOfOrigin, guessModel.countryOfOrigin),
      value: targetModel.countryOfOrigin
    },
    productionStartYear: {
      status: compareNullableNumber(
        getVariantStartYear(targetVariant, targetModel),
        getVariantStartYear(guessVariant, guessModel)
      ),
      value: getVariantStartYear(targetVariant, targetModel)
    },
    fuelType: {
      status: compareNullableString(targetVariant.fuelType, guessVariant.fuelType),
      value: targetVariant.fuelType
    },
    transmission: {
      status: compareNullableString(targetVariant.transmission, guessVariant.transmission),
      value: targetVariant.transmission
    },
    powerHp: {
      status: compareNullableNumber(targetVariant.powerHp, guessVariant.powerHp),
      value: targetVariant.powerHp
    },
    engineType: {
      status: compareNullableString(targetVariant.engineType, guessVariant.engineType),
      value: targetVariant.engineType
    },
    displacementCc: {
      status: compareNullableNumber(targetVariant.displacementCc, guessVariant.displacementCc),
      value: targetVariant.displacementCc
    },
    maxSpeedKmh: {
      status: compareNullableNumber(targetVariant.maxSpeedKmh, guessVariant.maxSpeedKmh),
      value: targetVariant.maxSpeedKmh
    },
    zeroToHundredSec: {
      status: compareNullableNumber(targetVariant.zeroToHundredSec, guessVariant.zeroToHundredSec),
      value: targetVariant.zeroToHundredSec
    }
  };
}
