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

## Nullsummen-Prüfung je Spiel

Steht schon als Wunsch im README und trifft den eigentlichen Zweck der App: Bei
jeder Abrechnung prüfen, ob die Summe über alle vier Spieler **0** ergibt, und
sonst die Eingabe nicht annehmen.

Der Fehler, den das abfängt, ist genau der beschriebene — drei Spielern etwas
gutschreiben, einem abziehen, und der Abend stimmt nicht mehr. Besonders
relevant, sobald es eine freie Einzeleingabe für den Ramsch gibt, wo die
Beträge je Spieler unterschiedlich sind und die Automatik nicht mehr greift.

Am wertvollsten von allem hier, weil es keinen neuen Bildschirm braucht,
sondern eine Zusicherung an bestehender Stelle ist. Der Kassensturz warnt zwar
inzwischen, wenn eine Runde nicht auf null aufgeht — aber erst am Ende des
Abends, wenn niemand mehr weiß, welches Spiel es war. Beim Eintragen zu prüfen
ist ungleich wertvoller.

## Punkteverlauf als Kurve

Pro Runde ein Diagramm mit einer Linie je Spieler über die Spiele hinweg. Man
sieht auf einen Blick, wo jemand eingebrochen ist oder wann ein Solo alles
gedreht hat.

Einordnung: Statistik ist laut README ausdrücklich zweitrangig — erst muss das
Abrechnen sitzen. Das hier ist also Kür, kein Pflichtprogramm. Passt aber gut
zum bestehenden dunklen Look und baut nur auf Daten auf, die schon da sind.

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
mitbekommen.

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
