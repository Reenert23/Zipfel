import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Warum Benachrichtigungen gerade nicht angeboten werden koennen. */
export type PushHindernis =
  | 'kein-service-worker'
  | 'nicht-konfiguriert'
  | 'abgelehnt'
  | 'fehlgeschlagen';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  private readonly baseUrl = environment.apiUrl + '/push';

  constructor(private http: HttpClient, private swPush: SwPush) {}

  /**
   * Ohne Service Worker gibt es keine Benachrichtigungen. Das ist der Normalfall
   * unter `ng serve` und in aelteren Browsern - kein Fehler, nur nichts
   * anzubieten.
   */
  get moeglich(): boolean {
    return this.swPush.isEnabled;
  }

  get bereitsAngemeldet(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }

  /**
   * Meldet dieses Geraet fuer eine Runde an.
   *
   * Muss aus einer echten Nutzergeste heraus aufgerufen werden - fragt der
   * Browser die Berechtigung ohne Zutun ab, lehnt er sie dauerhaft ab.
   */
  async anmelden(roundId: number, playerId: number): Promise<PushHindernis | null> {
    if (!this.swPush.isEnabled) {
      return 'kein-service-worker';
    }

    /* isEnabled sagt nur, dass das Modul eingeschaltet ist - nicht, dass sich
       ein Worker tatsaechlich registrieren konnte. Ohne diese Pruefung liefe
       ein gescheiterter Worker in die allgemeine "hat nicht geklappt"-Meldung,
       obwohl die Ursache benennbar ist. */
    try {
      const registrierung = await navigator.serviceWorker.getRegistration();
      if (!registrierung) {
        return 'kein-service-worker';
      }
    } catch {
      return 'kein-service-worker';
    }

    let publicKey: string;
    try {
      const antwort = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${this.baseUrl}/vapid-public-key`)
      );
      publicKey = antwort.publicKey;
    } catch {
      // 404 heisst: auf dem Server sind keine Schluessel hinterlegt.
      return 'nicht-konfiguriert';
    }

    try {
      const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
      const keys = subscription.toJSON().keys as { p256dh: string; auth: string };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/subscribe`, {
          roundId,
          playerId,
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        })
      );
      return null;
    } catch (err) {
      console.error('Anmeldung für Benachrichtigungen fehlgeschlagen:', err);
      return typeof Notification !== 'undefined' && Notification.permission === 'denied'
        ? 'abgelehnt'
        : 'fehlgeschlagen';
    }
  }

  /**
   * Beim Wechsel des beobachteten Spielers: dasselbe Abo, andere Zuordnung.
   * Der Server legt ueber endpoint + roundId denselben Eintrag an.
   */
  async spielerWechseln(roundId: number, playerId: number): Promise<void> {
    if (!this.swPush.isEnabled) return;

    try {
      const subscription = await firstValueFrom(this.swPush.subscription);
      if (!subscription) return;

      const keys = subscription.toJSON().keys as { p256dh: string; auth: string };
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/subscribe`, {
          roundId,
          playerId,
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        })
      );
    } catch (err) {
      console.error('Umstellen der Benachrichtigungen fehlgeschlagen:', err);
    }
  }
}
