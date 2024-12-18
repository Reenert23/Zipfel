# Zipfel
Schafkopf Rechner

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.0.

Business-Logik Erklärung:

Vogti:

Die Basis Idee war glaube ich dass man den Rechnungsbetrag selber im Kopf rechnet und dann in der App nur den Betrag den Spielern zuordnet.

Zum Beispiel rechnet man sich im Kopf aus (ruf = 5 cent, scheider +5, 1x gelegt => 5+5*2=20), dann tippt man ein 20 und weil Vogti und Paul gewonnen haben einfach auf die Namen. Die bekommen dann je 20 gut und Manu und Wolle 20 minus. Das taucht dann in der Tabelle unten auf.

Ruf Grundtarif sind 5cent, dazu könnte kommen Scheider 5, schwarz 5 und 3-8 lauf (pro lauf 5). dann muss mindestens 1x gelegt und der Betrag gedoppelt werden (leger könnten es maximal 6 sein, also maximal 6x verdoppeln).  Rechenbeispiel: Grundtarif 5, Schneider +5, 3 Lauf +15 = 25cent. 2x gelegt macht dann 25cent x 2 x 2= 1 Euro


Wolfi:

Also bezüglich Abrechnung. Ich fände es geiler, wenn die Berechnung des Betrags NICHT durch die App durchgeführt werden würde aus mehreren Gründen:
1.) Das geht im Kopf schneller, als dass man es eingetippt hat.
2.) Man ist dementsprechend auch flexibler mit verschiedenen Spielstilen (bei den einen wird anders abgerechnet, als bei anderen etc). Das ist ja überhaupt der Grund, warum wir so ne normale Schafkopf-Rechner-App nicht nutzen können, weil deren Abrechnungssystem ein anderes wie das unsere ist.
3.) Das macht die App auch viel komplizierter, als es sein müsste.

Hintergrund - warum die App?
Unsere Herausforderung aktuell ist, dass wir Vollidioten uns immer verrechnen. Zum Beispiel: Vogti hat -130, Paul +250, Wolle 0, Schaffi +120. Jetzt spielen wir ein Spiel, bei dem Paul und Vogti 50 Cent gewinnen. Jetzt müssen wir 4 mal Kopfrechnen: Vogti + 50 Cent, Paul +50 Cent, Wolle - 50 Cent, Schaffi -50 Cent. Wenn man 30 Spiele macht, rechnet man quasi 30x4 = 120 Kopfrechenaufgaben und irgendwo passiert dann immer ein Fehler, Zahlendreher usw. Dann stimmt das ganze natürlich nicht mehr. Wenn ich jetzt zum Beispiel 3 Leuten 50 Cent gutschreibe, aber nur einem abziehe, dann zahlt ja einer 50 Cent aus, und drei Leute bekommen insgesamt 1,50€, das haut ja aber nicht hin. Deswegen muss das immer exakt korrekt bleiben. 

Abrechnung:
Die App muss eigentlich nur "3 Modi" haben. 
Modus 1: Rufspiel
Hier gewinnen 2 Leute einen Betrag, während 2 Leuten den verlieren. Zum Beispiel: Paul und Vogti gewinnen jeweils 50 Cent, Schaffi und Manu verlieren jeweils 50 Cent. Umsetzbar zum Beispiel so, dass man 50 Cent eingibt und dann auf Paul und Vogti drückt. Die App erkennt dann, dass 2 Leute ausgewählt wurden und die bekommen dann jeweils 50 Cent gutgeschrieben. Automatisch werden die dann den anderen beiden abgezogen.

Modus 2: Solo
Hier gewinnt EINER, alle anderen 3 zahlen. Zum Beispiel Woller spielt ein Solo und gewinnt 3x30 = 90 Cent. Alle anderen verlieren jeweils 30 Cent. Umsetzbar zum Beispiel, dass man den Betrag eingibt und dann doppelt auf einen Spieler drückt. Die App erkennt dann durch das doppelt drücken, dass es ein Solo war und schreibt den Betrag dem "Solisten" gut, den anderen den Betrag/3 zieht er ab.

Modus 3: Ramsch
Bei einem Ramsch verliert einer und zahlt aber an andere z.T. unterschiedliche Beträge aus. Beispiel: Manu verliert einen Ramsch. Vogti bekommt 20 Cent, Paul bekommt 10 Cent, Wolle bekommt 10 Cent. Manu verliert insgesamt also 40 Cent. Da könnte ich mir vorstellen, dass das einfachste wäre, wenn man irgendwie eine "Manuell" Funktion implementiert, die dann quasi erlaubt individuell abzuziehen oder individuell hinzuzufügen. Hintergrund ist der Ramsch-Durchmarsch, der zwar sehr selten klappt, aber wenn dann wäre es quasi das Gegenbeispiel. Siehe Beispiel oben bloß, dass Manu gewinnt und alle anderen die jeweiligen Beträge verlieren. Bevor man das aber mit Hü und Hopp einbaut, ist glaub ich so ne individuelle Eingabe leichter.

Außerdem:
Ein Rückgängig Knopf wäre vermutlich gut, dass man die letzte Abrechnung nochmal löschen könnte oder so.


Modus 3: Vielleicht wäre es am einfachsten, wenn Modus 3 einfach die individuelle Eingabe pro Person ist. Beispiel: Button links neben der Null "IE" (= Individuelle Eingabe). Der wird dann Gelb z.B., dann gibt man ne Zahl ein (z.B. -30) und drückt dann auf Vogti. Das macht man für jeden. Dann ist man am flexibelsten. Das i-Tüpfelchen wäre, wenn das Programm im Hintergrund checkt, obs passt, das heißt, dass es jede Zeile einfach überprüft, ob die Summe gleich 0 ergibt. Wenn nicht, dass es dann meckert oder so und die Eingabe nicht erlaubt oder keine Ahnung. 

Tabelle unten, zusätzliche Spalte und Farben.
Geil wäre, wenn die Tabelle noch weng Tuning bekommt. Zum Beispiel eine 5. Spalte, in der der Betrag der Runde angezeigt wird. Dann findet man gewisse Spiele schneller, wenn man nochmal schauen will.

Farben: man könnte Rufspiele in der Tabelle mit so nem leichten Farbe hinterlegen, Solos in einer anderen etc.

Statistik: 
Fände ich geil, aber tatsächlich auch zweirangig. Aktuell führen wir überhaupt keine Statistik mehr und es fehlt uns daher auch nicht. Das muss auch net unbedingt. Wie gesagt, wenn man als Update machbar, ists geil, aber wenn wir vorerst ein geiles Tool zur Abrechnung haben fänd ichs mega

Also wenn wir uns jetzt (dann irgendwann mal mit nem Social-Login) einloggen, dass nicht automatisch immer die gleiche Reihenfolge ist, weil wir auch nicht immer in der gleichen Reihenfolge sitzen - das losen wir immer aus zu Beginn. 

Bei jedem mal, wenn man also quasi ein neues Spiel erstellt, müsste die Reihenfolge von den Spielern oben neu festgelegt werden müssen. Anders wirds am Tisch recht unübersichtlich, wenn man anders sitzt, als es in der App dann gezeigt wird.

Beispiel: wir sitzen im Uhrzeigersinn Paul, Vogti, Wolle, Manu - Paul gibts das erste Spiel, dass dann eben auch die Reihenfolge in der App die gleiche ist.

Ach da kam mir noch was: 6. Spalte mit der Spielnummer.

Manu:

Ja ich finde Statistik mega geil,  aber vlt sollten wir Schritt für Schritt vorgehen.  Erstmal nur das simple addieren/ subtrahieren.
Also am Anfang 4 Namen eingeben die für das aktuelle Spiel vorgesehen sind.
Wenn man dann ein neues Spiel startet,  dann muss man wieder 4 neue Namen eingegeben usw.
Wenn das funktioniert und du noch Lust und Zeit hast  und wir einen erfolgreichen Mallorca-Workshop hinter uns haben dann könnte man das noch Upgraden.
Next level wäre dann dass man in der App "feste Spieler" eingibt und dann alle Spielerdaten zu dem jeweiligen Spieler speichert, sodass man dann einsehen kann wie viele Spiele und Solos mit jeweiliger winrate jeder Spieler  absolviert hat.
 Aber so wie ich dich verstanden hatte brauchst du dafür Accounts oder?
