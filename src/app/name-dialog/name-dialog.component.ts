import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-name-dialog',
  templateUrl: './name-dialog.component.html',
  styleUrls: ['./name-dialog.component.css']
})
export class NameDialogComponent {
  playerNames: string[] = ['', '', '', ''];

  constructor(
    public dialogRef: MatDialogRef<NameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(); // Schließt das Popup
  }

  onSave(): void {
    if (this.playerNames.some(name => name.trim() === '')) {
      alert('Bitte alle Namen eingeben!');
      return;
    }
    this.dialogRef.close(this.playerNames); // Gibt die Namen zurück
  }
}
