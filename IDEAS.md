# Ideen

Sammelstelle für Features, die noch nicht angefangen sind. Nichts hier ist
beschlossen — es ist ein Zwischenlager, damit Einfälle nicht in Chatverläufen
verlorengehen.

Wer etwas umsetzt: Eintrag rauslöschen, sobald es im Code steht. Wer etwas
verwirft: Eintrag rauslöschen und in einem Satz dazuschreiben, warum — sonst
schlägt es in einem halben Jahr wieder auf.

Die Ideen betreffen teils auch `ZipfelBackend`, das in einem eigenen Verzeichnis
außerhalb dieses Repositorys liegt.

---

## Offline-Fähigkeit

`angular.json` setzt `"serviceWorker": true`, es wird also ein `ngsw-worker.js`
gebaut — aber nirgends im Code registriert (kein `ServiceWorkerModule.register`).
Die PWA hat damit **gar keinen Offline-Cache**, obwohl die Konfiguration das
nahelegt.

Im Wirtshaus mit einem Balken Empfang ist das der Moment, in dem die App hakt.
Die Registrierung nachzuziehen ist wenig Arbeit.

Vorsicht dabei: Danach wird `index.html` mitgecacht. Ohne durchdachte
Update-Strategie landet man wieder bei der Sorte Rätsel, die schon einmal einen
Nachmittag gekostet hat — dass die App nachweislich einen alten Stand fährt,
während der Server längst einen neuen ausliefert. Die Versionsanzeige in der
Toolbar (`assets/version.json`) ist dafür der vorhandene Anker.

## Mitlesen am Tisch

Ein Teilen-Link zur laufenden Runde, den die Mitspieler auf ihrem eigenen Handy
öffnen und den Zwischenstand live sehen. Nur einer tippt, alle schauen.

Der aufwendigste Punkt hier: Das Backend bräuchte eine öffentlich lesbare
Ansicht ohne Login und ein Verfahren, wie die Mitleser Aktualisierungen
mitbekommen. Aus einem längeren Gespräch hat sich folgendes Bild ergeben,
in vier Schritten:

1. Der Schreiber (z.B. Vogti) tippt in seiner laufenden Runde auf "Teilen"
   und bekommt Link + QR-Code angezeigt, wahlweise direkt über den
   nativen Teilen-Button an WhatsApp & Co. übergeben.
2. Ein Mitspieler (z.B. Manu) öffnet den Link, wählt einmalig aus, für
   welchen Spieler er Updates sehen will.
3. Trägt der Schreiber ein Spiel ein, bekommt Manu eine Pushmeldung mit
   Ton: "Du hast gerade 20ct verloren" bzw. "...120ct gewonnen".
4. Nach Wegwischen der Meldung zeigt eine Übersichtsseite den aktuellen
   Rundengesamtstand aller Spieler, live aktualisiert.

**Der Link muss zur konkreten Runde gehören, nicht zur "neuesten".** Naheliegend
wäre ein Link gewesen, der einfach immer die zuletzt angelegte Runde zeigt —
spart eine Runden-ID im Link. Das funktioniert aber nur, solange an einem
Abend nie zwei Tische gleichzeitig laufen. Bei bis zu 10 Leuten, die in
wechselnden Vierer-Konstellationen spielen, ist das nicht garantiert. Der
Link muss also die Runden-ID (oder einen kurzen Token, der darauf mappt)
referenzieren, keinen "zeig mir was auch immer gerade aktuell ist"-Automatismus.
Aus demselben Grund braucht es auch keine eigene "Gruppe + Token"-Tabelle
(frühere Idee hier) — die Runde selbst ist schon die richtige Einheit.

**Runden-Status und Schreiber-Token sind gebaut** (steht also nur noch hier,
soweit es den Rest erklärt): `Round` hat ein Feld `status` (`ACTIVE`/
`FINISHED`) und ein `writerToken`. Beim Anlegen einer Runde liefert
`POST /api/rounds` einmalig `{ round, writerToken }`; das Token liegt danach
im `localStorage` unter `zipfel.writerToken.<roundId>` und geht als Header
`X-Writer-Token` an alle Schreibzugriffe. Ohne oder mit falschem Token: 403.
Schreiben in eine beendete Runde: 409. Der "Runde beenden"/"Runde wieder
öffnen"-Button sitzt oben in `game-list.component`, bewusst getrennt vom
Kassensturz-Dialog. Runden von vor dieser Änderung haben kein Token und
bleiben absichtlich ungeprüft.

Was daran offen blieb und für die Zuschauer-Phase noch ansteht:

- Ein zweites Gerät, das dieselbe Runde öffnet, sieht weiterhin die volle
  Schreiber-Oberfläche — nur seine Schreibversuche werden abgelehnt. Das
  Umschalten auf eine echte Nur-Lese-Ansicht fehlt noch, und es ist genau
  derselbe Mechanismus wie beim Mitlesen-Link: passender Token lokal
  vorhanden? Ja → Eingabe, nein → Leseansicht.
- Die Mitlesen-Seite soll bei `FINISHED` einen "Runde beendet"-Zustand
  zeigen, Push und SSE für diese Runde verstummen dann.

**Schreibrechte übertragen.** Verliert das Schreiber-Gerät den Token
(Browser-Daten gelöscht, neues Handy), verliert es die Schreibrechte an der
eigenen Runde. Dafür braucht es eine Übertragungsmöglichkeit, und zwar zwei
verschiedene:

- **Geplante Übergabe** (z.B. Vogti muss los, Paul übernimmt): Der
  aktuelle Schreiber löst in seiner Ansicht "Schreibrecht übertragen"
  aus und bekommt einen kurzlebigen, einmalig gültigen Code/QR gezeigt —
  bewusst *getrennt* vom Mitlesen-Link, sonst würde jeder Mitleser beim
  Öffnen des ohnehin breit geteilten Links automatisch Schreibrechte
  bekommen. Das übernehmende Gerät scannt/tippt den Code, bekommt einen
  frischen Token, der alte wird sofort ungültig.
- **Notfall-Übernahme** (Schreiber-Gerät ist weg, kein Zugriff mehr
  darauf): Kein Codeaustausch möglich, weil die Gegenseite fehlt. Da die
  API ohnehin offen ist (keine echte Zugriffskontrolle, vertrauensvolle
  Gruppe), reicht hier ein sichtbarer "Schreibrecht überschreiben"-Button
  in der normalen Rundenansicht mit Warnhinweis ("Das vorherige Gerät
  verliert damit die Möglichkeit, Spiele einzutragen."). Kleines Risiko,
  dass sich zwei Leute versehentlich die Schreibrechte wegnehmen — bei
  der Gruppengröße vertretbar.

**Spieler-Picker dynamisch, nicht fest codiert.** Die Auswahl "Für wen willst
du Updates?" muss aus der Spielerliste der jeweiligen Runde kommen
(`round.players`, ist schon da), nicht aus einer festen Namensliste — bei
bis zu 10 rotierenden Spielern wechselt die Besetzung ja Runde für Runde.
Die lokale Auswahl selbst sollte pro Runden-ID gespeichert werden
(`zipfel_mitlesen_player_<roundId>`), nicht global, sonst hängt beim
nächsten Abend mit anderer Besetzung die falsche Zuordnung im Speicher.

**Update-Mechanismus.** Solange das Backend eh per Cronjob wachgehalten wird
(Render-Kaltstart ist also kein Thema), spricht wenig gegen eine dauerhafte
Verbindung statt Polling. Für den reinen Leseempfang (Server → Zuschauer-
Handy, keine Rückrichtung nötig) reichen **Server-Sent Events**
(`SseEmitter`, schon über `spring-boot-starter-web` verfügbar, kein
WebSocket-Dependency nötig) — pro Runden-ID gefiltert, sonst sehen
Zuschauer von Runde A auch Updates aus Runde B.

**Personalisierte Pushmeldungen** brauchen echte Web-Push-Infrastruktur,
SSE reicht dafür nicht:

- Voraussetzung ist der registrierte Service Worker aus dem Offline-Punkt
  oben — Web Push läuft über genau diesen Worker im Hintergrund.
- VAPID-Schlüsselpaar + eine Push-Subscription pro Gerät, die das Backend
  speichert — zusammen mit Runden-ID und gewähltem Spieler, damit ein
  Eintrag in Runde A nicht auch Zuschauer von Runde B benachrichtigt und
  eine beendete Runde ihre Abos sauber stummschaltet.
- Beim Eintragen eines Spiels: Backend schickt für jede betroffene
  Subscription eine Push-Nachricht (z.B. über `webpush-java`).
- Achtung iOS: Web Push funktioniert dort erst ab iOS 16.4 und nur, wenn die
  App vorher "Zum Homescreen hinzugefügt" wurde — im normalen Safari-Tab
  kommt nichts an. Macht den Homescreen-Hinweis aus dem Offline-Punkt
  faktisch zur Pflicht, nicht nur zur Kür.
- Android ist unkomplizierter: Chrome & Co. unterstützen Web Push direkt im
  normalen Browser-Tab, kein Homescreen-Zwang wie bei iOS. Einschränkungen:
  manche vorinstallierten Hersteller-Browser evtl. unzuverlässig, und
  aggressive Akku-Optimierung (Samsung, Xiaomi) kann Zustellung verzögern —
  bei einer festen Gruppe im Wirtshaus-Kontext aber vermutlich kein reales
  Problem.

Reihenfolge ergibt sich also von selbst: erst Service-Worker-Registrierung
(Offline-Punkt), dann Runden-Status/Schreiber-Token als Fundament, dann
Push obendrauf.

---

## Schon im README notiert

Im README stehen unter „Business-Logik Erklärung" weitere Wünsche, die dort
zwischen der Erklärung der Spielmodi untergehen — hier nur als Verweis, damit
sie nicht übersehen werden:

- Individuelle Eingabe je Spieler für den Ramsch (Modus 3)
- Zusätzliche Tabellenspalten: Betrag der Runde, Spielnummer
- Farbliche Hinterlegung der Zeilen je Spielart (Ruf, Solo, …)
- Sitzreihenfolge je Runde festlegen, weil am Tisch neu ausgelost wird
- Social Login, feste Spieler mit Winrate je Spieler und Solo-Quote
