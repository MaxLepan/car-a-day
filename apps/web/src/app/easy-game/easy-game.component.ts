import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ApiService,
  EasyGuessFeedback,
  PuzzleTodayResponse,
  SuggestionItem
} from '../services/api.service';

type GuessAttempt = {
  id: number;
  label: string;
  feedback: EasyGuessFeedback;
};

type FeedbackKey = keyof EasyGuessFeedback;

@Component({
  selector: 'app-easy-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './easy-game.component.html',
  styleUrl: './easy-game.component.css'
})
export class EasyGameComponent implements OnInit {
  puzzle: PuzzleTodayResponse | null = null;

  query = '';
  suggestions: SuggestionItem[] = [];
  selected: SuggestionItem | null = null;

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
    { key: 'countryOfOrigin', label: 'Country' },
    { key: 'productionStartYear', label: 'Start year' }
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
      this.api.searchModels(term).subscribe({
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

    this.api.submitEasyGuess(this.puzzle.puzzleId, this.selected.id).subscribe({
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

    this.api.getTodayPuzzle('easy').subscribe({
      next: (data) => {
        this.puzzle = data;
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
    if (!this.puzzle) {
      return null;
    }
    return `caraday:easy:${this.puzzle.date}`;
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
}
