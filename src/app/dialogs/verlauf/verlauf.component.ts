import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PointsChartComponent } from '../../components/points-chart/points-chart.component';
import { Game } from '../../models/Game';
import { Player } from '../../models/Player';

export interface VerlaufData {
  players: Player[];
  games: Game[];
}

/**
 * Zeigt den Punkteverlauf der Runde. Der Dialog selbst rechnet nichts - das
 * Diagramm steckt in app-points-chart, hier wird es nur ins Popup gehoben,
 * damit es wie der Kassensturz aus der Spielansicht aufgeht.
 */
@Component({
  selector: 'app-verlauf',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, PointsChartComponent],
  templateUrl: './verlauf.component.html',
  styleUrls: ['./verlauf.component.css']
})
export class VerlaufComponent {
  players: Player[] = [];
  games: Game[] = [];

  constructor(
    public dialogRef: MatDialogRef<VerlaufComponent>,
    @Inject(MAT_DIALOG_DATA) data: VerlaufData
  ) {
    this.players = data.players;
    this.games = data.games;
  }

  close(): void {
    this.dialogRef.close();
  }
}
