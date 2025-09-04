import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'zipfel';

  constructor(private router: Router) {}

  goToRounds(): void {
    this.router.navigateByUrl('/rounds'); // Navigiere zur Round-Seite
  }
}
