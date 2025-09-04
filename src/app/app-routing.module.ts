import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';

const routes: Routes = [
  { path: '', component: GameListComponent },
  {  path: 'rounds', component: RoundListComponent},
  { path: 'rounds/:id/games', component: GameListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
