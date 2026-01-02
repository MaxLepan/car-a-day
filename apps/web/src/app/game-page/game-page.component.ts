import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ApiService,
  FieldFeedback,
  GuessFeedback,
  GuessResponse,
  PuzzleMode,
  PuzzleResponse,
  PuzzleTodayResponse,
  SuggestionItem
} from '../services/api.service';

type FeedbackKey = string;

type GuessAttempt = {
  id: number;
  label: string;
  feedback: GuessFeedback;
  guessValues: Record<string, string | number | null>;
};

type ModeConfig = {
  title: string;
  placeholder: string;
  fields: Array<{ key: string; label: string }>;
  numericKeys: string[];
};

const MODE_CONFIG: Record<PuzzleMode, ModeConfig> = {
  easy: {
    title: 'Mode EASY',
    placeholder: 'Ex: Peugeot 208',
    fields: [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'generation', label: 'Generation' },
      { key: 'bodyType', label: 'Body' },
      { key: 'countryOfOrigin', label: 'Country' },
      { key: 'productionStartYear', label: 'Start year' }
    ],
    numericKeys: ['productionStartYear']
  },
  hard: {
    title: 'Mode HARD',
    placeholder: 'Ex: Peugeot 208 1.2 110hp',
    fields: [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'generation', label: 'Generation' },
      { key: 'bodyType', label: 'Body' },
      { key: 'countryOfOrigin', label: 'Country' },
      { key: 'productionStartYear', label: 'Start year' },
      { key: 'fuelType', label: 'Fuel' },
      { key: 'transmission', label: 'Trans' },
      { key: 'powerHp', label: 'Power' },
      { key: 'engineType', label: 'Engine' },
      { key: 'displacementCc', label: 'CC' },
      { key: 'maxSpeedKmh', label: 'Top speed' },
      { key: 'zeroToHundredSec', label: '0-100' }
    ],
    numericKeys: ['productionStartYear', 'powerHp', 'displacementCc', 'maxSpeedKmh', 'zeroToHundredSec']
  }
};

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent implements OnInit {
  mode: PuzzleMode = 'easy';
  config: ModeConfig = MODE_CONFIG.easy;

  puzzle: PuzzleTodayResponse | null = null;
  yesterdayLabel = '';

  query = '';
  suggestions: SuggestionItem[] = [];
  selected: SuggestionItem | null = null;

  attempts: GuessAttempt[] = [];
  foundValues: Record<string, string> = {};
  loadingPuzzle = false;
  loadingGuess = false;
  error = '';

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly api: ApiService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const routeMode = this.route.snapshot.data['mode'];
    this.mode = routeMode === 'hard' ? 'hard' : 'easy';
    this.config = MODE_CONFIG[this.mode];
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
      this.api.search(this.mode, term).subscribe({
        next: (results) => {
          this.suggestions = results;
        },
        error: () => {
          this.suggestions = [];
        }
      });
    }, 200);
  }

  selectSuggestion(item: SuggestionItem): void {
    this.selected = item;
    this.query = item.label;
    this.suggestions = [];
  }

  submitGuess(): void {
    if (!this.puzzle || !this.selected || this.loadingGuess) {
      return;
    }

    this.loadingGuess = true;
    this.error = '';

    this.api.submitGuess(this.mode, this.puzzle.puzzleId, this.selected.id).subscribe({
      next: (result) => {
        const attempt = this.buildAttempt(result);
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

    this.api.getTodayPuzzle(this.mode).subscribe({
      next: (data: PuzzleResponse) => {
        this.puzzle = data.today;
        this.yesterdayLabel = data.yesterday.label;
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
    if (!this.puzzle) {
      return null;
    }
    return `caraday:${this.mode}:${this.puzzle.date}`;
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
      if (this.puzzle && saved.puzzleId === this.puzzle.puzzleId && Array.isArray(saved.attempts)) {
        this.attempts = saved.attempts.map((attempt) => this.normalizeAttempt(attempt));
      }
    } catch {
      // ignore invalid storage
    }
  }

  private persistAttempts(): void {
    const key = this.storageKey();
    if (!key || !this.puzzle) {
      return;
    }

    const payload = {
      puzzleId: this.puzzle.puzzleId,
      attempts: this.attempts
    };

    localStorage.setItem(key, JSON.stringify(payload));
  }

  private buildAttempt(result: GuessResponse): GuessAttempt {
    const guessValues: Record<string, string | number | null> = {};
    for (const [key, value] of Object.entries(result.guess)) {
      if (key === 'id' || key === 'label') {
        continue;
      }
      guessValues[key] = value as string | number | null;
    }

    return {
      id: result.guess.id,
      label: result.guess.label,
      feedback: result.feedback,
      guessValues
    };
  }

  private normalizeAttempt(attempt: GuessAttempt): GuessAttempt {
    if (!attempt.guessValues) {
      return {
        ...attempt,
        guessValues: {}
      };
    }
    return attempt;
  }

  private updateFoundValues(): void {
    const found: Record<string, string> = {};

    for (const field of this.config.fields) {
      const key = field.key;
      if (this.isNumericField(key)) {
        const closest = this.findClosestNumeric(key);
        if (closest) {
          found[key] = closest;
        }
        continue;
      }

      const match = this.attempts.find((attempt) => attempt.feedback[key]?.status === 'correct');
      if (match) {
        const value = match.feedback[key]?.value;
        if (value !== null && value !== undefined) {
          found[key] = String(value);
        }
      }
    }

    this.foundValues = found;
  }

  private isNumericField(key: string): boolean {
    return this.config.numericKeys.includes(key);
  }

  private findClosestNumeric(key: string): string | null {
    let bestDiff: number | null = null;
    let bestDisplay: string | null = null;

    for (const attempt of this.attempts) {
      const feedback = attempt.feedback[key] as
        | FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>
        | undefined;
      const targetValue = feedback?.value ?? null;
      const guessValue = attempt.guessValues[key];

      if (
        targetValue === null ||
        typeof guessValue !== "number" ||
        feedback?.status === "unknown" ||
        feedback?.status === undefined
      ) {
        continue;
      }

      const diff = Math.abs(targetValue - guessValue);
      if (bestDiff !== null && diff > bestDiff) {
        continue;
      }

      if (feedback.status === "correct") {
        bestDisplay = `${targetValue}`;
      } else if (feedback.status === "higher") {
        bestDisplay = `>${guessValue}`;
      } else {
        bestDisplay = `<${guessValue}`;
      }

      bestDiff = diff;
    }

    return bestDisplay;
  }

  getAttemptDisplayValue(attempt: GuessAttempt, key: FeedbackKey): string {
    if (!this.isNumericField(key)) {
      const value = attempt.guessValues[key];
      return value !== null && value !== undefined ? String(value) : '???';
    }

    const feedback = attempt.feedback[key] as
      | FieldFeedback<"correct" | "higher" | "lower" | "unknown", number | null>
      | undefined;
    const guessValue = attempt.guessValues[key];

    if (
      typeof guessValue !== "number" ||
      feedback?.status === "unknown" ||
      feedback?.status === undefined
    ) {
      return '???';
    }
    if (feedback.status === "correct") {
      return `${guessValue}`;
    }
    if (feedback.status === "higher") {
      return `>${guessValue}`;
    }
    return `<${guessValue}`;
  }
}
