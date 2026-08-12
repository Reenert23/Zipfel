import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions, Plugin } from 'chart.js';
import { Game } from '../../models/Game';
import { Player } from '../../models/Player';

@Component({
  selector: 'app-points-chart',
  templateUrl: './points-chart.component.html',
  styleUrls: ['./points-chart.component.css']
})
export class PointsChartComponent implements OnChanges {
  @Input() games: Game[] = [];
  @Input() players: Player[] = [];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  /* Die Legende wird als HTML unter dem Diagramm gezeichnet, nicht im Canvas -
     sonst würde sie mitscrollen, sobald die Kurve breiter ist als der Kasten. */
  legendItems: { label: string; color: string }[] = [];

  /* Dasselbe Problem bei der y-Achse, nur schwerer: chart.js zeichnet sie in
     die Leinwand, die scrollt. Sie wird deshalb hier als HTML danebengelegt -
     die Höhen kommen aus der echten Skala, damit die Zahlen auf ihren
     Gitterlinien sitzen und nicht daneben. */
  yTicks: { label: string; top: number }[] = [];

  /* Unter 56px je Spiel kleben die Punkte aneinander. Passt die Runde in die
     Breite, bleibt es bei 100% - erst ein langer Abend schiebt sie darüber
     hinaus, und dann wird innen gescrollt statt gequetscht. */
  get chartWidth(): string {
    return `max(100%, ${this.games.length * 56}px)`;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  /* afterLayout, nicht afterDraw: da stehen die Skalen fest, es wird aber noch
     nichts gezeichnet. Die Labels liegen ausserhalb der Leinwand und aendern
     deren Groesse nicht, der Gleichheitstest bricht die Schleife ohnehin ab. */
  readonly stickyAxis: Plugin<'line'> = {
    id: 'stickyAxis',
    afterLayout: (chart: Chart<'line'>) => {
      const scale = chart.scales['y'];
      if (!scale) return;

      const ticks = scale.ticks.map(tick => ({
        label: `${tick.value}`,
        top: Math.round(scale.getPixelForValue(tick.value))
      }));

      const unchanged =
        ticks.length === this.yTicks.length &&
        ticks.every((t, i) => t.label === this.yTicks[i].label && t.top === this.yTicks[i].top);
      if (unchanged) return;

      this.yTicks = ticks;
      this.cdr.detectChanges();
    }
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        display: true,
        /* Die Beschriftung steht als HTML daneben; die Gitterlinien bleiben
           hier, sie gehoeren zur Flaeche und duerfen mitscrollen. */
        ticks: { display: false },
        border: { display: false },
        grid: { color: 'rgba(224, 224, 224, 0.1)' }
      },
      x: {
        display: true,
        ticks: { color: '#e0e0e0' },
        grid: { color: 'rgba(224, 224, 224, 0.1)' }
      }
    },
    /* Ohne das klebt der erste Punkt am linken Rand der Flaeche. */
    layout: { padding: { left: 6, right: 6 } }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['games'] || changes['players']) {
      this.updateChart();
    }
  }

  private readonly colors = [
    '#ff6b6b', '#4ade80', '#60a5fa', '#fbbf24',
    '#c084fc', '#2dd4bf', '#fb923c', '#f472b6'
  ];

  private updateChart(): void {
    if (!this.games.length || !this.players.length) {
      this.lineChartData = { labels: [], datasets: [] };
      this.legendItems = [];
      this.yTicks = [];
      return;
    }

    const pointsPerGame: { [playerId: number]: number[] } = {};
    const colors = this.colors;

    this.players.forEach(player => {
      pointsPerGame[player.id] = [];
    });

    let cumulativePoints: { [playerId: number]: number } = {};
    this.players.forEach(player => {
      cumulativePoints[player.id] = 0;
    });

    this.games.forEach((game) => {
      this.players.forEach(player => {
        const score = game.scores?.find(s => s.playerId === player.id);
        const points = score ? score.points : 0;
        cumulativePoints[player.id] += points;
        pointsPerGame[player.id].push(cumulativePoints[player.id]);
      });
    });

    this.lineChartData = {
      labels: this.games.map((_, i) => `${i + 1}`),
      datasets: this.players.map((player, idx) => ({
        label: player.firstName,
        data: pointsPerGame[player.id],
        borderColor: colors[idx % colors.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    };

    this.legendItems = this.players.map((player, idx) => ({
      label: player.firstName,
      color: colors[idx % colors.length]
    }));
  }
}
