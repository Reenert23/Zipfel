import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-database-admin',
  templateUrl: './database-admin.component.html',
  styleUrls: ['./database-admin.component.css']
})
export class DatabaseAdminComponent {
  private apiUrl = environment.apiUrl + '/admin';
  isLoading = false;
  successMessage = '';

  constructor(private http: HttpClient) {}

  clearDatabase(): void {
    if (!confirm('Wirklich alle Daten löschen? Das kann nicht rückgängig gemacht werden!')) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    this.http.post(`${this.apiUrl}/clear-database`, {}).subscribe({
      next: () => {
        this.successMessage = 'Datenbank geleert ✓';
        this.isLoading = false;
      },
      error: (err) => {
        this.successMessage = `Fehler: ${err.message}`;
        this.isLoading = false;
      }
    });
  }

  resetTestdata(): void {
    if (!confirm('Testdaten einspielen? Bestehende Daten werden überschrieben.')) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    this.http.post(`${this.apiUrl}/reset-testdata`, {}).subscribe({
      next: () => {
        this.successMessage = 'Testdaten eingespielt ✓';
        this.isLoading = false;
      },
      error: (err) => {
        this.successMessage = `Fehler: ${err.message}`;
        this.isLoading = false;
      }
    });
  }
}
