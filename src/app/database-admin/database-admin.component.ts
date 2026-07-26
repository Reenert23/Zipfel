import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ConfirmComponent, ConfirmData } from '../dialogs/confirm/confirm.component';

@Component({
  selector: 'app-database-admin',
  templateUrl: './database-admin.component.html',
  styleUrls: ['./database-admin.component.css']
})
export class DatabaseAdminComponent {
  private apiUrl = environment.apiUrl + '/admin';
  isLoading = false;
  successMessage = '';

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  clearDatabase(): void {
    this.ask({
      title: 'Datenbank leeren?',
      message: 'Alle Runden, Spiele und Spieler werden gelöscht. Das kann nicht rückgängig gemacht werden.',
      confirmLabel: 'Leeren',
      danger: true
    }, '/clear-database', 'Datenbank geleert ✓');
  }

  resetTestdata(): void {
    this.ask({
      title: 'Testdaten einspielen?',
      message: 'Die Datenbank wird geleert und mit 2 Runden à 3 Spielen neu befüllt.',
      confirmLabel: 'Einspielen'
    }, '/reset-testdata', 'Testdaten eingespielt ✓');
  }

  private ask(data: ConfirmData, endpoint: string, okMessage: string): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '340px',
      data,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.callAdmin(endpoint, okMessage);
      }
    });
  }

  private callAdmin(endpoint: string, okMessage: string): void {
    this.isLoading = true;
    this.successMessage = '';

    this.http.post(`${this.apiUrl}${endpoint}`, {}).subscribe({
      next: () => {
        this.successMessage = okMessage;
        this.isLoading = false;
      },
      error: (err) => {
        this.successMessage = `Fehler: ${err.status} ${err.statusText || err.message}`;
        this.isLoading = false;
      }
    });
  }
}
