jest.mock('../prisma', () => ({ prisma: {} }));

import { getDateKey } from '../services/dailyPuzzleService';

describe('getDateKey', () => {
  it('formats date as YYYY-MM-DD in Europe/Paris timezone', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = getDateKey(date);

    expect(result).toBe('2024-01-15');
  });

  it('rolls over to next day based on Paris timezone', () => {
    const date = new Date('2024-01-15T23:30:00Z');
    const result = getDateKey(date);

    expect(result).toBe('2024-01-16');
  });
});
