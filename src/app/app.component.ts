import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToolbarService } from './services/toolbar.service';
import { HttpClient } from '@angular/common/http';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

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

  /** Ein neuer Stand liegt fertig im Hintergrund und wartet auf einen Neustart. */
  updateBereit = false;

  constructor(
    private router: Router,
    private toolbarService: ToolbarService,
    private http: HttpClient,
    private swUpdate: SwUpdate
  ) {}

  ngOnInit() {
    this.markStandalone();

    this.http.get<any>('/assets/version.json').subscribe(data => {
      this.version = `v${data.version}`;
    });

    this.watchForUpdates();

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
   * Der Service Worker cacht die App auf dem Geraet - ohne Gegenmittel faehrt
   * sie beliebig lange einen alten Stand weiter, obwohl der Server laengst
   * einen neuen ausliefert. Genau das hat hier schon einmal einen Nachmittag
   * gekostet.
   *
   * Bewusst kein automatischer Reload: mitten in einer Runde reisst das den
   * Tippenden aus dem Ablauf. Stattdessen ein Hinweis, der wartet, bis es
   * gerade passt.
   */
  private watchForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => (this.updateBereit = true));
  }

  jetztAktualisieren(): void {
    // activateUpdate allein genuegt nicht: der neue Worker uebernimmt zwar,
    // die laufende Seite haelt aber weiter den alten Code im Speicher.
    this.swUpdate.activateUpdate().then(() => document.location.reload());
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
