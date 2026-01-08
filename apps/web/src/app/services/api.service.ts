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

export type PuzzleYesterdayResponse = {
  date: string;
  mode: 'EASY' | 'HARD';
  label: string;
};

export type PuzzleResponse = {
  today: PuzzleTodayResponse;
  yesterday: PuzzleYesterdayResponse;
};

export type WikiSummaryResponse = {
  date: string;
  mode: 'EASY' | 'HARD';
  usedLang: 'fr' | 'en';
  title: string;
  extract: string;
  url: string;
  attribution: { source: 'Wikipedia'; url: string };
};

export type SuggestionItem = {
  id: number;
  label: string;
};

export type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type GuessFeedback = Record<
  string,
  FieldFeedback<'correct' | 'wrong' | 'higher' | 'lower' | 'unknown', string | number | null>
>;

export type GuessResponse = {
  feedback: GuessFeedback;
  guess: SuggestionItem & Record<string, string | number | null>;
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  getTodayPuzzle(mode: PuzzleMode): Observable<PuzzleResponse> {
    const params = new HttpParams().set('mode', mode);
    return this.http.get<PuzzleResponse>(`${this.baseUrl}/puzzle/today`, { params });
  }

  search(mode: PuzzleMode, query: string): Observable<SuggestionItem[]> {
    const params = new HttpParams().set('q', query);
    const path = mode === 'easy' ? 'models' : 'variants';
    return this.http.get<SuggestionItem[]>(`${this.baseUrl}/search/${path}`, { params });
  }

  submitGuess(mode: PuzzleMode, puzzleId: number, guessId: number): Observable<GuessResponse> {
    const params = new HttpParams().set('mode', mode);
    return this.http.post<GuessResponse>(
      `${this.baseUrl}/guess`,
      { puzzleId, guessId },
      { params }
    );
  }

  getWikiSummary(mode: PuzzleMode, date: string, lang: 'fr' | 'en'): Observable<WikiSummaryResponse> {
    const params = new HttpParams().set('mode', mode).set('date', date).set('lang', lang);
    return this.http.get<WikiSummaryResponse>(`${this.baseUrl}/puzzle/wiki-summary`, { params });
  }
}
