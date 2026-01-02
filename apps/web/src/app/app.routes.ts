import { Routes } from '@angular/router';
import { GamePageComponent } from './game-page/game-page.component';

const baseRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'easy' },
  { path: 'easy', component: GamePageComponent, data: { mode: 'easy' } },
  { path: 'hard', component: GamePageComponent, data: { mode: 'hard' } }
];

export const routes: Routes = [
  ...baseRoutes,
  { path: 'fr', children: baseRoutes },
  { path: 'en', children: baseRoutes }
];
