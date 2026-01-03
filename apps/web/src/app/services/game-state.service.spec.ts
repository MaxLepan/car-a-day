import { TestBed } from '@angular/core/testing';
import { GameStateService, GameState } from './game-state.service';

describe('GameStateService', () => {
  let service: GameStateService;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  it('saves then loads the same state', () => {
    const state: GameState = {
      guesses: [{ id: 1 }, { id: 2 }],
      solved: false
    };

    service.saveState('easy', '2025-01-01', state);
    const loaded = service.loadState('easy', '2025-01-01');

    expect(loaded).toEqual(state);
  });

  it('returns default state when no data is stored', () => {
    const loaded = service.loadState('easy', '2025-01-02');

    expect(loaded).toEqual({ guesses: [], solved: false });
  });

  it('markSolved sets solved to true', () => {
    service.saveState('hard', '2025-01-03', { guesses: [], solved: false });
    service.markSolved('hard', '2025-01-03');

    const loaded = service.loadState('hard', '2025-01-03');
    expect(loaded.solved).toBeTrue();
  });

  it('isolates state by date and mode', () => {
    service.saveState('easy', '2025-01-04', { guesses: [{ id: 'a' }], solved: false });
    service.saveState('easy', '2025-01-05', { guesses: [{ id: 'b' }], solved: true });
    service.saveState('hard', '2025-01-04', { guesses: [{ id: 'c' }], solved: false });

    const easyDay1 = service.loadState('easy', '2025-01-04');
    const easyDay2 = service.loadState('easy', '2025-01-05');
    const hardDay1 = service.loadState('hard', '2025-01-04');

    expect(easyDay1).toEqual({ guesses: [{ id: 'a' }], solved: false });
    expect(easyDay2).toEqual({ guesses: [{ id: 'b' }], solved: true });
    expect(hardDay1).toEqual({ guesses: [{ id: 'c' }], solved: false });
  });
});
