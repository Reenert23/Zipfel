import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from '../../models/Player';
import { PlayerService } from '../../services/player.service';
import { AddPlayerComponent } from '../add-player/add-player.component';

type SelectPlayersData = {
  preselected?: Player[]; // bereits ausgewählte Spieler (optional)
  requiredCount?: number; // z.B. 4
};

@Component({
  selector: 'app-select-players',
  templateUrl: './select-players.component.html'
})
export class SelectPlayersComponent implements OnInit {
  players: Player[] = [];
  selected: Player[] = []; // Reihenfolge wichtig
  requiredCount = 4;

  loading = true;

  constructor(
    private dialogRef: MatDialogRef<SelectPlayersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectPlayersData,
    private playerService: PlayerService,
    private dialog: MatDialog
  ) {
    if (data?.requiredCount) this.requiredCount = data.requiredCount;
  }

  ngOnInit(): void {
    this.playerService.getAllPlayers().subscribe({
      next: (list) => {
        this.players = list ?? [];
        // Falls schon preselected Spieler übergeben wurden → Reihenfolge übernehmen
        if (this.data?.preselected) {
          this.selected = [...this.data.preselected];
        }
      },
      complete: () => (this.loading = false)
    });
  }

  toggle(p: Player) {
    const index = this.selected.findIndex(sp => sp.id === p.id);
    if (index > -1) {
      // deselect → rauswerfen
      this.selected.splice(index, 1);
    } else {
      // select → am Ende anhängen (Reihenfolge = Klick-Reihenfolge)
      this.selected.push(p);
    }
  }

  isSelected(p: Player): boolean {
    return this.selected.some(sp => sp.id === p.id);
  }

  canConfirm(): boolean {
    return this.selected.length === this.requiredCount;
  }

  confirm(): void {
    this.dialogRef.close(this.selected);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  addNewPlayer() {
    const ref = this.dialog.open(AddPlayerComponent, { width: '400px' });
    ref.afterClosed().subscribe((created: Player | undefined) => {
      if (created?.id) {
        this.players = [...this.players, created];
        this.selected.push(created); // neuer Spieler wird automatisch ausgewählt → ans Ende
      }
    });
  }

  getOrderNumber(p: Player): number | null {
    const index = this.selected.findIndex(sp => sp.id === p.id);
    return index > -1 ? index + 1 : null;
  }
}
