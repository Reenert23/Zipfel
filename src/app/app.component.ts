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
    this.markStandalone();

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

  /**
   * Merkt am body, ob die App vom Home-Bildschirm aus laeuft.
   *
   * Noetig, weil die Kopfleiste dort ohne Glas auskommen muss: in der eigenen
   * Webview zieht WebKit die Glasebene mit der Toolbar in eine Ebene und die
   * Schrift wird weich. Die Media-Query display-mode: standalone reicht dafuer
   * nicht - iOS wertet sie in Home-Screen-Apps nicht verlaesslich aus und
   * kennt stattdessen navigator.standalone. Beide Wege werden geprueft, damit
   * es auf iOS und ueberall sonst greift.
   */
  private markStandalone(): void {
    const iOS = (window.navigator as any).standalone === true;
    const standard = window.matchMedia?.('(display-mode: standalone)').matches === true;

    if (iOS || standard) {
      document.body.classList.add('ios-standalone');
    }
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
