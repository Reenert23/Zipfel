import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToolbarService } from './services/toolbar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'zipfel';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isGameListRoute = false;

  constructor(private router: Router, private toolbarService: ToolbarService) {}

  ngOnInit() {
    this.isGameListRoute = this.checkGameListRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isGameListRoute = this.checkGameListRoute(event.urlAfterRedirects);
        if (this.sidenav.opened) {
          this.sidenav.close();
        }
      });
  }

  private checkGameListRoute(url: string): boolean {
    return url === '/play' || /^\/rounds\/\d+\/games/.test(url);
  }

  openPlayerSelector(): void {
    this.toolbarService.triggerPlayerSelector();
  }

  goToRounds(): void {
    this.router.navigateByUrl('/rounds');
  }
}
