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
