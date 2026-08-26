import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { GameListComponent } from './game-list/game-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CdkTableModule } from '@angular/cdk/table';
import { NameDialogComponent } from './name-dialog/name-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RamschDialogComponent } from './ramsch-dialog/ramsch-dialog.component';
import { RoundListComponent } from './round-list/round-list.component';
import { MatSidenavModule } from '@angular/material/sidenav'; // Sidenav-Modul
import {MatListModule} from '@angular/material/list';
import { AddPlayerComponent } from './dialogs/add-player/add-player.component';
import { SelectPlayersComponent } from './dialogs/select-players/select-players.component';
import { KassensturzComponent } from './dialogs/kassensturz/kassensturz.component';
import { TeilenComponent } from './dialogs/teilen/teilen.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { DatabaseAdminComponent } from './database-admin/database-admin.component';
import { ContactComponent } from './contact/contact.component';
import { StatsComponent } from './stats/stats.component';
/* PointsChartComponent und VerlaufComponent stehen bewusst nicht hier: sie
   sind standalone und werden erst beim Oeffnen des Verlaufs nachgeladen,
   damit chart.js aus dem Initial-Bundle bleibt. */



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GameListComponent,
    NameDialogComponent,
    RamschDialogComponent,
    RoundListComponent,
    AddPlayerComponent,
    SelectPlayersComponent,
    DatabaseAdminComponent,
    ContactComponent,
    StatsComponent,
    KassensturzComponent,
    TeilenComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CdkTableModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    HttpClientModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
        MatToolbarModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatDialogModule,

    /* Der Worker wird laengst gebaut (angular.json: serviceWorker true), war
       aber nirgends registriert - die PWA hatte damit weder Offline-Cache
       noch die Voraussetzung fuer Pushmeldungen.

       registerWhenStable wartet, bis die App fertig geladen ist, damit die
       Registrierung nicht mit dem ersten Rendern konkurriert; die 30s sind
       die Notbremse, falls die App nie "stable" meldet. */
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.serviceWorker,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
