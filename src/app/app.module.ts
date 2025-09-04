import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { CdkTableModule } from '@angular/cdk/table';
import { NameDialogComponent } from './name-dialog/name-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RamschDialogComponent } from './ramsch-dialog/ramsch-dialog.component';
import { RoundListComponent } from './round-list/round-list.component';
import { MatSidenavModule } from '@angular/material/sidenav'; // Sidenav-Modul
import {MatListModule} from '@angular/material/list';
import { AddPlayerComponent } from './dialogs/add-player/add-player.component';
import { SelectPlayersComponent } from './dialogs/select-players/select-players.component';



@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    NameDialogComponent,
    RamschDialogComponent,
    RoundListComponent,
    AddPlayerComponent,
    SelectPlayersComponent
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
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
