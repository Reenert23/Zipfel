import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/Player';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html'
})
export class AddPlayerComponent {
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    nickname: ['']
  });

  saving = false;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private dialogRef: MatDialogRef<AddPlayerComponent>
  ) {}

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value; // {firstName, lastName, nickname}
    this.playerService.createPlayer(payload as Partial<Player>).subscribe({
      next: (created) => this.dialogRef.close(created), // gibt den neuen Player zurück
      error: () => (this.saving = false),
      complete: () => (this.saving = false)
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
