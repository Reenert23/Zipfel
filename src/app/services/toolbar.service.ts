import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToolbarService {
  readonly openPlayerSelector$ = new Subject<void>();

  triggerPlayerSelector(): void {
    this.openPlayerSelector$.next();
  }
}
