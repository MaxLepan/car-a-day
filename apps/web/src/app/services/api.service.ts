import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PuzzleMode = 'easy' | 'hard';

export type PuzzleTodayResponse = {
  date: string;
  mode: 'EASY' | 'HARD';
  puzzleId: number;
  maxAttempts: number;
};

export type SuggestionItem = {
  id: number;
  label: string;
};

export type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type EasyGuessFeedback = {
  make: FieldFeedback<'correct' | 'wrong', string>;
  model: FieldFeedback<'correct' | 'wrong', string>;
  generation: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  bodyType: FieldFeedback<'correct' | 'wrong', string>;
  countryOfOrigin: FieldFeedback<'correct' | 'wrong', string>;
  productionStartYear: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number>;
};

export type HardGuessFeedback = {
  make: FieldFeedback<'correct' | 'wrong', string>;
  model: FieldFeedback<'correct' | 'wrong', string>;
  generation: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  bodyType: FieldFeedback<'correct' | 'wrong', string>;
  countryOfOrigin: FieldFeedback<'correct' | 'wrong', string>;
  productionStartYear: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number>;
  fuelType: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  transmission: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  powerHp: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
  engineType: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  displacementCc: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
  maxSpeedKmh: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
  zeroToHundredSec: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
};

export type EasyGuessResponse = {
  feedback: EasyGuessFeedback;
  guess: SuggestionItem & {
    productionStartYear: number;
  };
};

export type HardGuessResponse = {
  feedback: HardGuessFeedback;
  guess: SuggestionItem & {
    productionStartYear: number;
    powerHp: number | null;
    displacementCc: number | null;
    maxSpeedKmh: number | null;
    zeroToHundredSec: number | null;
  };
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  getTodayPuzzle(mode: PuzzleMode): Observable<PuzzleTodayResponse> {
    const params = new HttpParams().set('mode', mode);
    return this.http.get<PuzzleTodayResponse>(`${this.baseUrl}/puzzle/today`, { params });
  }

  searchModels(query: string): Observable<SuggestionItem[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SuggestionItem[]>(`${this.baseUrl}/search/models`, { params });
  }

  searchVariants(query: string): Observable<SuggestionItem[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SuggestionItem[]>(`${this.baseUrl}/search/variants`, { params });
  }

  submitEasyGuess(puzzleId: number, guessId: number): Observable<EasyGuessResponse> {
    const params = new HttpParams().set('mode', 'easy');
    return this.http.post<EasyGuessResponse>(
      `${this.baseUrl}/guess`,
      { puzzleId, guessId },
      { params }
    );
  }

  submitHardGuess(puzzleId: number, guessId: number): Observable<HardGuessResponse> {
    const params = new HttpParams().set('mode', 'hard');
    return this.http.post<HardGuessResponse>(
      `${this.baseUrl}/guess`,
      { puzzleId, guessId },
      { params }
    );
  }
}
