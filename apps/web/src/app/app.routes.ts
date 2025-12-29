import { Routes } from '@angular/router';
import { EasyGameComponent } from './easy-game/easy-game.component';
import { HardGameComponent } from './hard-game/hard-game.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'easy' },
  { path: 'easy', component: EasyGameComponent },
  { path: 'hard', component: HardGameComponent }
];
