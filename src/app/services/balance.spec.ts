import { distribute, imbalance, isZeroSum } from './balance';
import { GameScore } from '../models/Game';

const scores = (...points: number[]): GameScore[] =>
  points.map((value, index) => ({ playerId: index + 1, points: value }));

describe('imbalance', () => {
  it('meldet 0 für ein Ruf-Spiel, zwei gegen zwei', () => {
    expect(imbalance(scores(20, 20, -20, -20))).toBe(0);
    expect(isZeroSum(scores(20, 20, -20, -20))).toBe(true);
  });

  it('meldet 0 für ein Solo, einer gegen drei', () => {
    expect(imbalance(scores(90, -30, -30, -30))).toBe(0);
  });

  it('meldet den Fehlbetrag, wenn ein Spiel nicht aufgeht', () => {
    // Genau der Fall, den das Abrunden beim Solo erzeugt hat: 80 gegen 3 x 26.
    expect(imbalance(scores(80, -26, -26, -26))).toBe(2);
    expect(isZeroSum(scores(80, -26, -26, -26))).toBe(false);
  });

  it('meldet 0 für ein leeres Spiel', () => {
    expect(imbalance([])).toBe(0);
  });
});

describe('distribute', () => {
  it('teilt einen glatt teilbaren Betrag gleichmäßig', () => {
    expect(distribute(90, 3)).toEqual([30, 30, 30]);
  });

  it('verteilt den Rest, statt ihn zu verlieren', () => {
    expect(distribute(80, 3)).toEqual([27, 27, 26]);
  });

  it('trifft die Summe auch bei negativen Beträgen genau', () => {
    const parts = distribute(-80, 3);

    expect(parts).toEqual([-27, -27, -26]);
    expect(parts.reduce((sum, part) => sum + part, 0)).toBe(-80);
  });

  it('lässt die Teile um höchstens einen Cent auseinanderliegen', () => {
    for (let total = 0; total <= 200; total++) {
      const parts = distribute(total, 3);
      const summe = parts.reduce((sum, part) => sum + part, 0);

      expect(summe).toBe(total);
      expect(Math.max(...parts) - Math.min(...parts)).toBeLessThanOrEqual(1);
    }
  });

  it('gibt für null Teile nichts zurück, statt durch null zu teilen', () => {
    expect(distribute(50, 0)).toEqual([]);
  });
});
