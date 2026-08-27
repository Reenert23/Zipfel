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

/**
 * Pro Runde vermerkt, wie die Spielerwahl auch: ein Abo gilt immer nur fuer
 * eine Runde, die Berechtigung dagegen fuer den ganzen Browser.
 */
const STORAGE_KEY_PREFIX = 'zipfel.pushAbo.';

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

  /**
   * Laeuft fuer *diese* Runde ein Abo?
   *
   * Die Browser-Berechtigung allein reicht als Antwort nicht: sie gilt fuer die
   * ganze Seite. Wer sie bei Runde 12 erteilt hat und naechste Woche Runde 13
   * aufmacht, bekaeme sonst "Du wirst benachrichtigt" zu sehen, ohne dass fuer
   * Runde 13 je ein Abo angelegt wurde - es kaeme nie etwas an, und nirgends
   * stuende ein Fehler.
   *
   * Beides muss stimmen: der Vermerk hier *und* die Berechtigung. Wurde sie im
   * Browser wieder entzogen, ist der Vermerk wertlos.
   */
  istAngemeldet(roundId: number): boolean {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return false;
    }
    try {
      return localStorage.getItem(STORAGE_KEY_PREFIX + roundId) !== null;
    } catch {
      return false;
    }
  }

  private merken(roundId: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + roundId, '1');
    } catch {
      // Ohne Speicher bietet die App das Einschalten beim naechsten Besuch
      // erneut an - das Abo auf dem Server ist idempotent, das schadet nicht.
    }
  }

  private vergessen(roundId: number): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + roundId);
    } catch {
      // s.o.
    }
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
      this.merken(roundId);
      return null;
    } catch (err) {
      console.error('Anmeldung für Benachrichtigungen fehlgeschlagen:', err);
      return typeof Notification !== 'undefined' && Notification.permission === 'denied'
        ? 'abgelehnt'
        : 'fehlgeschlagen';
    }
  }

  /**
   * Meldet dieses Geraet von *dieser* Runde ab. Die Browser-Berechtigung
   * bleibt bestehen und andere Runden laufen weiter - abgemeldet wird nur der
   * eine Eintrag auf dem Server.
   */
  async abmelden(roundId: number): Promise<void> {
    /* Zuerst der Vermerk: geht der Aufruf schief, soll der Knopf trotzdem
       wieder "einschalten" sagen und nicht faelschlich Ruhe versprechen. */
    this.vergessen(roundId);

    try {
      /* Ohne installierten Worker emittiert swPush.subscription nie - ein
         await darauf kaeme nicht mehr zurueck. Erst fragen, dann warten. */
      const registrierung = await navigator.serviceWorker?.getRegistration();
      if (!registrierung) {
        return;
      }

      const subscription = await firstValueFrom(this.swPush.subscription);
      if (!subscription) {
        /* Ohne Endpunkt laesst sich der Eintrag nicht benennen. Er raeumt sich
           selbst ab: ein Abo ohne Browser-Gegenstueck beantwortet der
           Push-Dienst mit 410, und PushNotifier loescht es dann. */
        return;
      }

      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/subscribe`, {
          body: { roundId, endpoint: subscription.endpoint }
        })
      );
    } catch (err) {
      console.error('Abmelden von Benachrichtigungen fehlgeschlagen:', err);
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
