import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'zipfel';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.sidenav.opened) {
          this.sidenav.close();
        }
      });
  }

  goToRounds(): void {
    this.router.navigateByUrl('/rounds'); // Navigiere zur Round-Seite
  }
}
