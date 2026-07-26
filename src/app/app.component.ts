import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToolbarService } from './services/toolbar.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'zipfel';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isGameListRoute = false;
  isDashboard = false;
  version = 'v?.?';

  constructor(private router: Router, private toolbarService: ToolbarService, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('/assets/version.json').subscribe(data => {
      this.version = `v${data.version}`;
    });

    this.updateRouteFlags(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateRouteFlags(event.urlAfterRedirects);
        if (this.sidenav.opened) {
          this.sidenav.close();
        }
      });
  }

  private updateRouteFlags(url: string): void {
    this.isDashboard = url === '/';
    this.isGameListRoute = this.checkGameListRoute(url);
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
