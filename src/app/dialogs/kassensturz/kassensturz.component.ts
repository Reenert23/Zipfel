import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from '../../models/Player';
import { Balance, computeSettlement, formatCents, Payment } from '../../services/settlement';

export interface KassensturzData {
  players: Player[];
  /** Kontostand je Spieler-Id in Cent, so wie ihn die Spielansicht führt. */
  totalPoints: { [playerId: number]: number };
}

@Component({
  selector: 'app-kassensturz',
  templateUrl: './kassensturz.component.html',
  styleUrls: ['./kassensturz.component.css']
})
export class KassensturzComponent {
  balances: Balance[] = [];
  payments: Payment[] = [];
  imbalance = 0;

  readonly format = formatCents;

  constructor(
    public dialogRef: MatDialogRef<KassensturzComponent>,
    @Inject(MAT_DIALOG_DATA) data: KassensturzData
  ) {
    this.balances = data.players.map(player => ({
      player,
      amount: data.totalPoints[player.id] || 0
    }));

    const settlement = computeSettlement(this.balances);
    this.payments = settlement.payments;
    this.imbalance = settlement.imbalance;
  }

  /** Absteigend, damit oben steht, wer am meisten bekommt. */
  get sortedBalances(): Balance[] {
    return [...this.balances].sort((a, b) => b.amount - a.amount);
  }

  get everyoneEven(): boolean {
    return this.payments.length === 0 && this.imbalance === 0;
  }

  close(): void {
    this.dialogRef.close();
  }
}
