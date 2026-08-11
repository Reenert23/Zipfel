import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';
import { DatabaseAdminComponent } from './database-admin/database-admin.component';
import { ContactComponent } from './contact/contact.component';
import { StatsComponent } from './stats/stats.component';
import { LayoutDebugComponent } from './layout-debug/layout-debug.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'play', component: GameListComponent },
  { path: 'rounds', component: RoundListComponent},
  { path: 'rounds/:id/games', component: GameListComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'database-admin', component: DatabaseAdminComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'layout-debug', component: LayoutDebugComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
