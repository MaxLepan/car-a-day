import { Injectable } from '@angular/core';

export type GameMode = 'easy' | 'hard';

export type GameState = {
  guesses: unknown[];
  solved: boolean;
};

const DEFAULT_STATE: GameState = {
  guesses: [],
  solved: false
};

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private key(mode: GameMode, date: string): string {
    return `caraday:${mode}:${date}`;
  }

  saveState(mode: GameMode, date: string, state: GameState): void {
    const payload: GameState = {
      guesses: Array.isArray(state.guesses) ? [...state.guesses] : [],
      solved: Boolean(state.solved)
    };
    localStorage.setItem(this.key(mode, date), JSON.stringify(payload));
  }

  loadState(mode: GameMode, date: string): GameState {
    const raw = localStorage.getItem(this.key(mode, date));
    if (!raw) {
      return { ...DEFAULT_STATE };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      const guesses = Array.isArray(parsed.guesses) ? [...parsed.guesses] : [];
      const solved = Boolean(parsed.solved);
      return { guesses, solved };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  markSolved(mode: GameMode, date: string): void {
    const current = this.loadState(mode, date);
    this.saveState(mode, date, { ...current, solved: true });
  }
}
