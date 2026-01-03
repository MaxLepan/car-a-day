import { buildCarLabel } from '../game/formatCarLabel';

describe('buildCarLabel', () => {
  it('includes make and model', () => {
    const label = buildCarLabel({
      make: 'Toyota',
      model: 'Yaris',
      generation: null,
      yearStart: null
    });

    expect(label).toBe('Toyota Yaris');
  });

  it('includes generation in parentheses when present', () => {
    const label = buildCarLabel({
      make: 'Peugeot',
      model: '208',
      generation: 'II',
      yearStart: null
    });

    expect(label).toBe('Peugeot 208 (II)');
  });

  it('includes year in brackets when present', () => {
    const label = buildCarLabel({
      make: 'Honda',
      model: 'Civic',
      generation: null,
      yearStart: 2017
    });

    expect(label).toBe('Honda Civic [2017]');
  });

  it('includes generation and year when both are present', () => {
    const label = buildCarLabel({
      make: 'Ford',
      model: 'Focus',
      generation: 'III',
      yearStart: 2014
    });

    expect(label).toBe('Ford Focus (III) [2014]');
  });
});
