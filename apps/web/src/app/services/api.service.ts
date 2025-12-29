import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PuzzleTodayResponse = {
  date: string;
  puzzleId: number;
};

export type CarSuggestion = {
  id: number;
  label: string;
};

export type FieldFeedback<TStatus, TValue> = {
  status: TStatus;
  value: TValue;
};

export type GuessFeedback = {
  make: FieldFeedback<'correct' | 'wrong', string>;
  model: FieldFeedback<'correct' | 'wrong', string>;
  generation: FieldFeedback<'correct' | 'wrong' | 'unknown', string | null>;
  originCountry: FieldFeedback<'correct' | 'wrong', string>;
  bodyType: FieldFeedback<'correct' | 'wrong', string>;
  fuelType: FieldFeedback<'correct' | 'wrong', string>;
  transmission: FieldFeedback<'correct' | 'wrong', string>;
  yearStart: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
  powerHp: FieldFeedback<'correct' | 'higher' | 'lower' | 'unknown', number | null>;
};

export type GuessResponse = {
  feedback: GuessFeedback;
  guess: CarSuggestion & {
    make: string;
    model: string;
    generation: string | null;
    originCountry: string;
    bodyType: string;
    fuelType: string;
    transmission: string;
    yearStart: number | null;
    powerHp: number | null;
  };
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  getTodayPuzzle(): Observable<PuzzleTodayResponse> {
    return this.http.get<PuzzleTodayResponse>(`${this.baseUrl}/puzzle/today`);
  }

  searchCars(query: string): Observable<CarSuggestion[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<CarSuggestion[]>(`${this.baseUrl}/cars/search`, { params });
  }

  submitGuess(puzzleId: number, guessCarId: number): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(`${this.baseUrl}/guess`, {
      puzzleId,
      guessCarId
    });
  }
}
