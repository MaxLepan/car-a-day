import { Routes } from '@angular/router';
import { GamePageComponent } from './game-page/game-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'easy' },
  { path: 'easy', component: GamePageComponent, data: { mode: 'easy' } },
  { path: 'hard', component: GamePageComponent, data: { mode: 'hard' } }
];
