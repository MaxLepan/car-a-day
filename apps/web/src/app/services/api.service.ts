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

export type GuessFeedback = {
  make: 'correct' | 'wrong';
  model: 'correct' | 'wrong';
  generation: 'correct' | 'wrong' | 'unknown';
  bodyType: 'correct' | 'wrong';
  fuelType: 'correct' | 'wrong';
  transmission: 'correct' | 'wrong';
  yearStart: 'correct' | 'higher' | 'lower' | 'unknown';
  powerHp: 'correct' | 'higher' | 'lower' | 'unknown';
};

export type GuessResponse = {
  feedback: GuessFeedback;
  guess: CarSuggestion;
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
