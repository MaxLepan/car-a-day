import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CarSuggestion, GuessFeedback } from '../services/api.service';

type GuessAttempt = {
  id: number;
  label: string;
  feedback: GuessFeedback;
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
          feedback: result.feedback
        };
        this.attempts = [attempt, ...this.attempts];
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
        this.attempts = saved.attempts;
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
}
