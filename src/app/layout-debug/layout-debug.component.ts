import { Component, OnInit } from '@angular/core';

/**
 * Temporary diagnostic page. The layout faults reported from the phone - dead
 * space between the status bar and the toolbar row, and a band along the
 * bottom edge that covers content - only appear once the app runs standalone
 * from the home screen, where env(safe-area-inset-*) is non-zero. A desktop
 * browser reports 0 for those, so the geometry cannot be reproduced here.
 *
 * This page reads the real numbers off the device. Remove it once the layout
 * is fixed.
 */
@Component({
  selector: 'app-layout-debug',
  template: `
    <div class="debug">
      <h2>Layout-Diagnose</h2>
      <table>
        <tr *ngFor="let row of rows" [class.flag]="row.flag">
          <td>{{ row.k }}</td>
          <td>{{ row.v }}</td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .debug { padding: 16px; color: #fff; font-family: ui-monospace, Menlo, monospace; }
    h2 { font-size: 1.1em; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    td { padding: 4px 4px; border-bottom: 1px solid rgba(255,255,255,.12); vertical-align: top; }
    td:first-child { color: rgba(255,255,255,.6); }
    td:last-child { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr.flag td { color: #ff8a8a; font-weight: 700; }
  `]
})
export class LayoutDebugComponent implements OnInit {
  rows: { k: string; v: string; flag?: boolean }[] = [];

  ngOnInit(): void {
    // env() is only readable via a probe element that applies it.
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;left:0;top:0;width:0;visibility:hidden;' +
      'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);' +
      'padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);';
    document.body.appendChild(probe);
    const p = getComputedStyle(probe);
    const inset = {
      top: parseFloat(p.paddingTop),
      bottom: parseFloat(p.paddingBottom),
      left: parseFloat(p.paddingLeft),
      right: parseFloat(p.paddingRight)
    };
    probe.remove();

    const add = (k: string, v: any, flag = false) => this.rows.push({ k, v: String(v), flag });
    const box = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) { add(sel, 'FEHLT', true); return; }
      const r = el.getBoundingClientRect();
      add(sel, `top ${Math.round(r.top)} · h ${Math.round(r.height)} · bot ${Math.round(r.bottom)}`);
    };

    add('standalone', (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone) ? 'JA' : 'nein (Safari)');
    add('inset top / bottom', `${inset.top} / ${inset.bottom}`);
    add('--toolbar-row', getComputedStyle(document.documentElement)
      .getPropertyValue('--toolbar-row').trim());
    add('window.innerHeight', window.innerHeight);
    add('screen.height', window.screen.height);
    add('visualViewport.height', Math.round((window as any).visualViewport?.height ?? -1));
    add('documentElement.clientH', document.documentElement.clientHeight);

    box('html');
    box('body');
    box('app-root');
    box('mat-sidenav-container');
    box('mat-sidenav-content');
    box('mat-sidenav-content > .container');
    box('.glass-toolbar');

    const sc = document.querySelector('mat-sidenav-content') as HTMLElement | null;
    if (sc) {
      add('scrollHeight / clientHeight', `${sc.scrollHeight} / ${sc.clientHeight}`);
      const gap = Math.round(window.innerHeight - sc.getBoundingClientRect().bottom);
      add('Lücke Scrollbox → Screen', gap, gap !== 0);
    }
    const outer = document.querySelector('mat-sidenav-content > .container') as HTMLElement | null;
    if (outer && sc) {
      const gap = Math.round(sc.getBoundingClientRect().bottom - outer.getBoundingClientRect().bottom);
      add('Lücke Seite → Scrollbox', gap, gap !== 0);
    }
    const tb = document.querySelector('.glass-toolbar') as HTMLElement | null;
    if (tb) {
      const cs = getComputedStyle(tb);
      add('toolbar padding-top', cs.paddingTop);
      const btn = tb.querySelector('button');
      if (btn) {
        const br = btn.getBoundingClientRect();
        add('Menü-Button top / bottom', `${Math.round(br.top)} / ${Math.round(br.bottom)}`);
        add('Luft über dem Button', Math.round(br.top - inset.top),
            Math.round(br.top - inset.top) > 12);
      }
    }
  }
}
