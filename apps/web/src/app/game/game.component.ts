import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CarSuggestion, GuessFeedback } from '../services/api.service';

type GuessAttempt = {
  id: number;
  label: string;
  feedback: GuessFeedback;
  guessValues: {
    make: string | null;
    model: string | null;
    generation: string | null;
    bodyType: string | null;
    fuelType: string | null;
    transmission: string | null;
    yearStart: number | null;
    powerHp: number | null;
  };
};

type FeedbackKey = keyof GuessFeedback;

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  puzzleDate = '';
  puzzleId = 0;

  query = '';
  suggestions: CarSuggestion[] = [];
  selected: CarSuggestion | null = null;

  attempts: GuessAttempt[] = [];
  foundValues: Partial<Record<FeedbackKey, string>> = {};
  loadingPuzzle = false;
  loadingGuess = false;
  error = '';

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly feedbackFields: Array<{ key: FeedbackKey; label: string }> = [
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'generation', label: 'Generation' },
    { key: 'bodyType', label: 'Body' },
    { key: 'fuelType', label: 'Fuel' },
    { key: 'transmission', label: 'Trans' },
    { key: 'yearStart', label: 'Year' },
    { key: 'powerHp', label: 'Power' }
  ];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadPuzzle();
  }

  onQueryChange(): void {
    this.selected = null;

    const term = this.query.trim();
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    if (term.length < 2) {
      this.suggestions = [];
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.api.searchCars(term).subscribe({
        next: (results) => {
          this.suggestions = results;
        },
        error: () => {
          this.suggestions = [];
        }
      });
    }, 200);
  }

  selectSuggestion(item: CarSuggestion): void {
    this.selected = item;
    this.query = item.label;
    this.suggestions = [];
  }

  submitGuess(): void {
    if (!this.puzzleId || !this.selected || this.loadingGuess) {
      return;
    }

    this.loadingGuess = true;
    this.error = '';

    this.api.submitGuess(this.puzzleId, this.selected.id).subscribe({
      next: (result) => {
        const attempt: GuessAttempt = {
          id: result.guess.id,
          label: result.guess.label,
          feedback: result.feedback,
          guessValues: {
            make: result.guess.make ?? null,
            model: result.guess.model ?? null,
            generation: result.guess.generation ?? null,
            bodyType: result.guess.bodyType ?? null,
            fuelType: result.guess.fuelType ?? null,
            transmission: result.guess.transmission ?? null,
            yearStart: result.guess.yearStart ?? null,
            powerHp: result.guess.powerHp ?? null
          }
        };
        this.attempts = [attempt, ...this.attempts];
        this.updateFoundValues();
        this.persistAttempts();
        this.query = '';
        this.selected = null;
      },
      error: () => {
        this.error = 'Impossible de valider la tentative.';
      },
      complete: () => {
        this.loadingGuess = false;
      }
    });
  }

  private loadPuzzle(): void {
    this.loadingPuzzle = true;
    this.error = '';

    this.api.getTodayPuzzle().subscribe({
      next: (data) => {
        this.puzzleDate = data.date;
        this.puzzleId = data.puzzleId;
        this.restoreAttempts();
        this.updateFoundValues();
      },
      error: () => {
        this.error = 'Impossible de charger le puzzle du jour.';
      },
      complete: () => {
        this.loadingPuzzle = false;
      }
    });
  }

  private storageKey(): string | null {
    if (!this.puzzleDate) {
      return null;
    }
    return `car-a-day:${this.puzzleDate}`;
  }

  private restoreAttempts(): void {
    const key = this.storageKey();
    if (!key) {
      return;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      return;
    }

    try {
      const saved = JSON.parse(raw) as { puzzleId: number; attempts: GuessAttempt[] };
      if (saved.puzzleId === this.puzzleId && Array.isArray(saved.attempts)) {
        this.attempts = saved.attempts.map((attempt) => this.normalizeAttempt(attempt));
      }
    } catch {
      // ignore invalid storage
    }
  }

  private persistAttempts(): void {
    const key = this.storageKey();
    if (!key) {
      return;
    }

    const payload = {
      puzzleId: this.puzzleId,
      attempts: this.attempts
    };

    localStorage.setItem(key, JSON.stringify(payload));
  }

  private updateFoundValues(): void {
    const found: Partial<Record<FeedbackKey, string>> = {};

    for (const field of this.feedbackFields) {
      const key = field.key;
      if (key === 'yearStart' || key === 'powerHp') {
        const closest = this.findClosestNumeric(key);
        if (closest) {
          found[key] = closest;
        }
        continue;
      }

      const match = this.attempts.find((attempt) => attempt.feedback[key].status === 'correct');
      if (match) {
        const value = match.feedback[key].value;
        if (value !== null && value !== undefined) {
          found[key] = String(value);
        }
      }
    }

    this.foundValues = found;
  }

  private normalizeFeedback(feedback: GuessFeedback): GuessFeedback {
    const legacy = feedback as unknown as Record<string, unknown>;
    if (typeof legacy['make'] === 'string') {
      return {
        make: { status: legacy['make'] as GuessFeedback['make']['status'], value: '' },
        model: { status: legacy['model'] as GuessFeedback['model']['status'], value: '' },
        generation: {
          status: legacy['generation'] as GuessFeedback['generation']['status'],
          value: null
        },
        bodyType: { status: legacy['bodyType'] as GuessFeedback['bodyType']['status'], value: '' },
        fuelType: { status: legacy['fuelType'] as GuessFeedback['fuelType']['status'], value: '' },
        transmission: {
          status: legacy['transmission'] as GuessFeedback['transmission']['status'],
          value: ''
        },
        yearStart: {
          status: legacy['yearStart'] as GuessFeedback['yearStart']['status'],
          value: null
        },
        powerHp: {
          status: legacy['powerHp'] as GuessFeedback['powerHp']['status'],
          value: null
        }
      };
    }

    return feedback;
  }

  private normalizeAttempt(attempt: GuessAttempt): GuessAttempt {
    const normalized = {
      ...attempt,
      feedback: this.normalizeFeedback(attempt.feedback)
    };

    if (!normalized.guessValues) {
      normalized.guessValues = {
        make: null,
        model: null,
        generation: null,
        bodyType: null,
        fuelType: null,
        transmission: null,
        yearStart: null,
        powerHp: null
      };
    }

    return normalized;
  }

  private findClosestNumeric(key: 'yearStart' | 'powerHp'): string | null {
    let bestDiff: number | null = null;
    let bestDisplay: string | null = null;

    for (const attempt of this.attempts) {
      const feedback = attempt.feedback[key];
      const targetValue = feedback.value;
      const guessValue = attempt.guessValues[key];

      if (targetValue === null || guessValue === null || feedback.status === 'unknown') {
        continue;
      }

      const diff = Math.abs(targetValue - guessValue);
      if (bestDiff !== null && diff >= bestDiff) {
        continue;
      }

      if (feedback.status === 'correct') {
        bestDisplay = `${targetValue}`;
      } else if (feedback.status === 'higher') {
        bestDisplay = `>${guessValue}`;
      } else {
        bestDisplay = `<${guessValue}`;
      }

      bestDiff = diff;
    }

    return bestDisplay;
  }

  getAttemptDisplayValue(attempt: GuessAttempt, key: FeedbackKey): string {
    const feedback = attempt.feedback[key];
    const guessValue = attempt.guessValues[key] as string | number | null;

    if (key === 'yearStart' || key === 'powerHp') {
      if (guessValue === null || feedback.status === 'unknown') {
        return '???';
      }
      if (feedback.status === 'correct') {
        return `${guessValue}`;
      }
      if (feedback.status === 'higher') {
        return `>${guessValue}`;
      }
      return `<${guessValue}`;
    }

    if (guessValue === null || guessValue === undefined) {
      return '???';
    }

    return String(guessValue);
  }
}
