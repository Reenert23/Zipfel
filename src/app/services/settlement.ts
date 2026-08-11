import { Player } from '../models/Player';

/**
 * Wer wem am Ende einer Runde wie viel schuldet.
 *
 * Alle Beträge sind Cent, so wie sie in der App eingegeben werden - die Werte
 * in den Spielen sind bereits Geldbeträge und keine abstrakten Punkte (siehe
 * README). Hier wird nichts berechnet, was nicht schon dasteht, sondern nur
 * verteilt.
 */

export interface Balance {
  player: Player;
  /** Cent. Positiv = bekommt Geld, negativ = zahlt. */
  amount: number;
}

export interface Payment {
  from: Player;
  to: Player;
  /** Cent, immer > 0. */
  amount: number;
}

export interface Settlement {
  payments: Payment[];
  /**
   * Summe aller Kontostände. Muss 0 sein - jedes Spiel verteilt nur um, es
   * kommt kein Geld dazu und es verschwindet keines. Ist der Wert ungleich 0,
   * steckt in der Runde ein Eingabefehler, und die Auszahlung unten kann gar
   * nicht aufgehen. Der Betrag wird deshalb mitgegeben statt verschluckt.
   */
  imbalance: number;
}

/**
 * Gleicht die Kontostände mit möglichst wenigen Zahlungen aus.
 *
 * Verfahren: Immer den größten Schuldner an den größten Gläubiger zahlen
 * lassen, so viel wie geht. Damit ist nach jedem Schritt mindestens einer der
 * beiden fertig, es bleiben also höchstens (Anzahl Spieler - 1) Zahlungen -
 * bei vier Spielern also drei. Das ist ein Greedy-Verfahren und liefert nicht
 * in jeder denkbaren Konstellation das theoretische Minimum; die exakte
 * Lösung ist NP-schwer. Für einen Schafkopftisch ist der Unterschied
 * gegenstandslos.
 *
 * Bei einer unausgeglichenen Runde wird so weit verteilt, wie sich die beiden
 * Seiten decken; der Rest steht in `imbalance`.
 */
export function computeSettlement(balances: Balance[]): Settlement {
  const imbalance = balances.reduce((sum, b) => sum + b.amount, 0);

  // Kopien, damit die Restbeträge heruntergezählt werden können, ohne die
  // übergebenen Kontostände anzufassen.
  const debtors = balances
    .filter(b => b.amount < 0)
    .map(b => ({ player: b.player, rest: -b.amount }));
  const creditors = balances
    .filter(b => b.amount > 0)
    .map(b => ({ player: b.player, rest: b.amount }));

  const payments: Payment[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort((a, b) => b.rest - a.rest);
    creditors.sort((a, b) => b.rest - a.rest);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.rest, creditor.rest);

    payments.push({ from: debtor.player, to: creditor.player, amount });

    debtor.rest -= amount;
    creditor.rest -= amount;
    if (debtor.rest === 0) debtors.shift();
    if (creditor.rest === 0) creditors.shift();
  }

  return { payments, imbalance };
}

/** Cent als deutscher Betrag, z.B. 420 -> "4,20 €". */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const euro = Math.floor(abs / 100);
  const rest = abs % 100;
  return `${sign}${euro},${rest.toString().padStart(2, '0')} €`;
}
