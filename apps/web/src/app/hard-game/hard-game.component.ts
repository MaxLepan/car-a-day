import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ApiService,
  HardGuessFeedback,
  PuzzleTodayResponse,
  SuggestionItem
} from '../services/api.service';

type GuessAttempt = {
  id: number;
  label: string;
  feedback: HardGuessFeedback;
};

type FeedbackKey = keyof HardGuessFeedback;

@Component({
  selector: 'app-hard-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './hard-game.component.html',
  styleUrl: './hard-game.component.css'
})
export class HardGameComponent implements OnInit {
  puzzle: PuzzleTodayResponse | null = null;

  query = '';
  suggestions: SuggestionItem[] = [];
  selected: SuggestionItem | null = null;

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
    { key: 'countryOfOrigin', label: 'Country' },
    { key: 'productionStartYear', label: 'Start year' },
    { key: 'fuelType', label: 'Fuel' },
    { key: 'transmission', label: 'Trans' },
    { key: 'powerHp', label: 'Power' },
    { key: 'engineType', label: 'Engine' },
    { key: 'displacementCc', label: 'CC' },
    { key: 'maxSpeedKmh', label: 'Top speed' },
    { key: 'zeroToHundredSec', label: '0-100' }
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
      this.api.searchVariants(term).subscribe({
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
    if (!this.puzzle || !this.selected || this.loadingGuess || this.attempts.length >= this.puzzle.maxAttempts) {
      return;
    }

    this.loadingGuess = true;
    this.error = '';

    this.api.submitHardGuess(this.puzzle.puzzleId, this.selected.id).subscribe({
      next: (result) => {
        const attempt: GuessAttempt = {
          id: result.guess.id,
          label: result.guess.label,
          feedback: result.feedback
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

    this.api.getTodayPuzzle('hard').subscribe({
      next: (data) => {
        this.puzzle = data;
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
    return `caraday:hard:${this.puzzle.date}`;
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
        this.attempts = saved.attempts;
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

  private updateFoundValues(): void {
    const found: Partial<Record<FeedbackKey, string>> = {};

    for (const field of this.feedbackFields) {
      const key = field.key;
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
}
