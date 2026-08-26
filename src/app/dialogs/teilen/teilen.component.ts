import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as QRCode from 'qrcode';

export interface TeilenData {
  /** Vollstaendige Adresse der Runde, so wie ein Mitleser sie oeffnet. */
  url: string;
}

@Component({
  selector: 'app-teilen',
  templateUrl: './teilen.component.html',
  styleUrls: ['./teilen.component.css']
})
export class TeilenComponent implements OnInit {

  readonly url: string;

  /** Data-URL des QR-Codes; leer, solange er noch erzeugt wird. */
  qrDataUrl = '';

  /** Kurze Rueckmeldung nach dem Kopieren, statt eines Dialogs ueber dem Dialog. */
  kopiert = false;

  /**
   * Die Zwischenablage kann verweigert werden (fehlende Berechtigung, Seite
   * nicht im Fokus). Ohne sichtbare Rueckmeldung stuende der Nutzer vor einem
   * Button, der scheinbar nichts tut - und wuerde ihn wieder und wieder tippen.
   */
  kopierFehler = false;

  /**
   * Das native Teilen-Blatt gibt es nicht ueberall (Desktop-Firefox etwa).
   * Ohne diese Pruefung stuende ein Button da, der nichts tut.
   */
  readonly kannTeilen = typeof navigator !== 'undefined' && !!navigator.share;

  constructor(
    private dialogRef: MatDialogRef<TeilenComponent>,
    @Inject(MAT_DIALOG_DATA) data: TeilenData
  ) {
    this.url = data.url;
  }

  ngOnInit(): void {
    /* Der QR-Code entsteht lokal, nicht ueber einen Bilddienst: die Adresse
       der Runde soll das Geraet nicht verlassen, und im Wirtshaus mit einem
       Balken Empfang waere ein Fremdaufruf genau der Moment zum Scheitern. */
    QRCode.toDataURL(this.url, {
      width: 480,
      margin: 1,
      color: { dark: '#12102bff', light: '#fdfcffff' }
    })
      .then(dataUrl => (this.qrDataUrl = dataUrl))
      .catch(err => console.error('QR-Code konnte nicht erzeugt werden:', err));
  }

  async kopieren(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url);
      this.kopiert = true;
      this.kopierFehler = false;
      setTimeout(() => (this.kopiert = false), 2000);
    } catch (err) {
      console.error('Kopieren fehlgeschlagen:', err);
      this.kopierFehler = true;
    }
  }

  async teilen(): Promise<void> {
    try {
      await navigator.share({ title: 'Zipfel', text: 'Schau bei unserer Runde zu:', url: this.url });
    } catch {
      // Abbrechen im Teilen-Blatt wirft ebenfalls - das ist kein Fehler.
    }
  }

  schliessen(): void {
    this.dialogRef.close();
  }
}
