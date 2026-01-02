import { BodyType, CarModel } from '@prisma/client';
import { evaluateModelGuess } from '../game/evaluateModelGuess';

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

const buildModel = (overrides: Partial<CarModel> = {}): CarModel => ({
  ...baseModel,
  ...overrides
});

const withNullableYear = (year: number | null): CarModel =>
  ({
    ...baseModel,
    productionStartYear: year as unknown as number
  }) as CarModel;

describe('evaluateModelGuess', () => {
  it('returns correct for make when it matches', () => {
    const target = buildModel({ make: 'Peugeot' });
    const guess = buildModel({ make: 'Peugeot' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.make.status).toBe('correct');
    expect(feedback.make.value).toBe('Peugeot');
  });

  it('returns wrong for make when it differs', () => {
    const target = buildModel({ make: 'Peugeot' });
    const guess = buildModel({ make: 'Renault' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.make.status).toBe('wrong');
    expect(feedback.make.value).toBe('Peugeot');
  });

  it('returns correct for model when it matches', () => {
    const target = buildModel({ model: '208' });
    const guess = buildModel({ model: '208' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.model.status).toBe('correct');
    expect(feedback.model.value).toBe('208');
  });

  it('returns wrong for model when it differs', () => {
    const target = buildModel({ model: '208' });
    const guess = buildModel({ model: 'Clio' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.model.status).toBe('wrong');
    expect(feedback.model.value).toBe('208');
  });

  it('returns unknown for generation when target is null', () => {
    const target = buildModel({ generation: null });
    const guess = buildModel({ generation: 'II' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.generation.status).toBe('unknown');
    expect(feedback.generation.value).toBeNull();
  });

  it('returns unknown for generation when guess is null', () => {
    const target = buildModel({ generation: 'II' });
    const guess = buildModel({ generation: null });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.generation.status).toBe('unknown');
    expect(feedback.generation.value).toBe('II');
  });

  it('returns correct for generation when it matches', () => {
    const target = buildModel({ generation: 'II' });
    const guess = buildModel({ generation: 'II' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.generation.status).toBe('correct');
    expect(feedback.generation.value).toBe('II');
  });

  it('returns wrong for bodyType when it differs', () => {
    const target = buildModel({ bodyType: BodyType.HATCHBACK });
    const guess = buildModel({ bodyType: BodyType.SUV });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.bodyType.status).toBe('wrong');
    expect(feedback.bodyType.value).toBe(BodyType.HATCHBACK);
  });

  it('returns correct for countryOfOrigin when it matches', () => {
    const target = buildModel({ countryOfOrigin: 'France' });
    const guess = buildModel({ countryOfOrigin: 'France' });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.countryOfOrigin.status).toBe('correct');
    expect(feedback.countryOfOrigin.value).toBe('France');
  });

  it('returns higher for productionStartYear when target is greater', () => {
    const target = buildModel({ productionStartYear: 2020 });
    const guess = buildModel({ productionStartYear: 2018 });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.productionStartYear.status).toBe('higher');
    expect(feedback.productionStartYear.value).toBe(2020);
  });

  it('returns lower for productionStartYear when target is lower', () => {
    const target = buildModel({ productionStartYear: 2015 });
    const guess = buildModel({ productionStartYear: 2020 });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.productionStartYear.status).toBe('lower');
    expect(feedback.productionStartYear.value).toBe(2015);
  });

  it('returns correct for productionStartYear when equal', () => {
    const target = buildModel({ productionStartYear: 2019 });
    const guess = buildModel({ productionStartYear: 2019 });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.productionStartYear.status).toBe('correct');
    expect(feedback.productionStartYear.value).toBe(2019);
  });

  it('returns unknown for productionStartYear when target is null', () => {
    const target = withNullableYear(null);
    const guess = buildModel({ productionStartYear: 2019 });

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.productionStartYear.status).toBe('unknown');
    expect(feedback.productionStartYear.value).toBeNull();
  });

  it('returns unknown for productionStartYear when guess is null', () => {
    const target = buildModel({ productionStartYear: 2019 });
    const guess = withNullableYear(null);

    const feedback = evaluateModelGuess(target, guess);

    expect(feedback.productionStartYear.status).toBe('unknown');
    expect(feedback.productionStartYear.value).toBe(2019);
  });
});
