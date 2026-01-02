import { BodyType, CarModel, CarVariant, FuelType, Transmission } from '@prisma/client';
import { evaluateVariantGuess } from '../game/evaluateVariantGuess';

const baseModel: CarModel = {
  id: 1,
  make: 'Peugeot',
  model: '208',
  generation: 'II',
  bodyType: BodyType.HATCHBACK,
  countryOfOrigin: 'France',
  productionStartYear: 2019,
  productionEndYear: null
};

const baseVariant: CarVariant = {
  id: 10,
  modelId: 1,
  fuelType: FuelType.PETROL,
  transmission: Transmission.MANUAL,
  powerHp: 110,
  engineType: 'I3',
  displacementCc: 1199,
  maxSpeedKmh: 190,
  zeroToHundredSec: 9.6,
  productionStartYear: null,
  productionEndYear: null
};

const buildModel = (overrides: Partial<CarModel> = {}): CarModel => ({
  ...baseModel,
  ...overrides
});

const buildVariant = (
  variantOverrides: Partial<CarVariant> = {},
  modelOverrides: Partial<CarModel> = {}
): (CarVariant & { model: CarModel }) => {
  const model = buildModel(modelOverrides);
  const variant: CarVariant = {
    ...baseVariant,
    modelId: model.id,
    ...variantOverrides
  };

  return {
    ...variant,
    model
  };
};

describe('evaluateVariantGuess', () => {
  it('returns correct for fuelType when it matches', () => {
    const target = buildVariant({ fuelType: FuelType.PETROL });
    const guess = buildVariant({ fuelType: FuelType.PETROL });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.fuelType.status).toBe('correct');
    expect(feedback.fuelType.value).toBe(FuelType.PETROL);
  });

  it('returns wrong for fuelType when it differs', () => {
    const target = buildVariant({ fuelType: FuelType.DIESEL });
    const guess = buildVariant({ fuelType: FuelType.PETROL });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.fuelType.status).toBe('wrong');
    expect(feedback.fuelType.value).toBe(FuelType.DIESEL);
  });

  it('returns correct for transmission when it matches', () => {
    const target = buildVariant({ transmission: Transmission.AUTOMATIC });
    const guess = buildVariant({ transmission: Transmission.AUTOMATIC });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.transmission.status).toBe('correct');
    expect(feedback.transmission.value).toBe(Transmission.AUTOMATIC);
  });

  it('returns wrong for transmission when it differs', () => {
    const target = buildVariant({ transmission: Transmission.MANUAL });
    const guess = buildVariant({ transmission: Transmission.AUTOMATIC });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.transmission.status).toBe('wrong');
    expect(feedback.transmission.value).toBe(Transmission.MANUAL);
  });

  it('returns higher for powerHp when target is greater', () => {
    const target = buildVariant({ powerHp: 150 });
    const guess = buildVariant({ powerHp: 110 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.powerHp.status).toBe('higher');
    expect(feedback.powerHp.value).toBe(150);
  });

  it('returns lower for powerHp when target is lower', () => {
    const target = buildVariant({ powerHp: 90 });
    const guess = buildVariant({ powerHp: 130 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.powerHp.status).toBe('lower');
    expect(feedback.powerHp.value).toBe(90);
  });

  it('returns unknown for powerHp when target is null', () => {
    const target = buildVariant({ powerHp: null });
    const guess = buildVariant({ powerHp: 110 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.powerHp.status).toBe('unknown');
    expect(feedback.powerHp.value).toBeNull();
  });

  it('returns correct for engineType when it matches', () => {
    const target = buildVariant({ engineType: 'I4' });
    const guess = buildVariant({ engineType: 'I4' });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.engineType.status).toBe('correct');
    expect(feedback.engineType.value).toBe('I4');
  });

  it('returns unknown for engineType when guess is null', () => {
    const target = buildVariant({ engineType: 'V6' });
    const guess = buildVariant({ engineType: null });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.engineType.status).toBe('unknown');
    expect(feedback.engineType.value).toBe('V6');
  });

  it('returns higher for displacementCc when target is greater', () => {
    const target = buildVariant({ displacementCc: 2000 });
    const guess = buildVariant({ displacementCc: 1600 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.displacementCc.status).toBe('higher');
    expect(feedback.displacementCc.value).toBe(2000);
  });

  it('returns lower for maxSpeedKmh when target is lower', () => {
    const target = buildVariant({ maxSpeedKmh: 180 });
    const guess = buildVariant({ maxSpeedKmh: 210 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.maxSpeedKmh.status).toBe('lower');
    expect(feedback.maxSpeedKmh.value).toBe(180);
  });

  it('returns higher for zeroToHundredSec when target is slower', () => {
    const target = buildVariant({ zeroToHundredSec: 8.5 });
    const guess = buildVariant({ zeroToHundredSec: 6.5 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.zeroToHundredSec.status).toBe('higher');
    expect(feedback.zeroToHundredSec.value).toBe(8.5);
  });

  it('returns lower for zeroToHundredSec when target is faster', () => {
    const target = buildVariant({ zeroToHundredSec: 6.8 });
    const guess = buildVariant({ zeroToHundredSec: 8.2 });

    const feedback = evaluateVariantGuess(target, guess);

    expect(feedback.zeroToHundredSec.status).toBe('lower');
    expect(feedback.zeroToHundredSec.value).toBe(6.8);
  });
});
