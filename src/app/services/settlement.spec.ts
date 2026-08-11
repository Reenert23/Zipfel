import { Balance, computeSettlement, formatCents } from './settlement';
import { Player } from '../models/Player';

const p = (id: number, firstName: string): Player => ({ id, firstName });

const manu = p(1, 'Manu');
const wolfi = p(2, 'Wolfi');
const vogti = p(3, 'Vogti');
const paul = p(4, 'Paul');

const balances = (...pairs: [Player, number][]): Balance[] =>
  pairs.map(([player, amount]) => ({ player, amount }));

describe('computeSettlement', () => {
  it('gleicht ein Paar mit einer einzigen Zahlung aus', () => {
    const { payments, imbalance } = computeSettlement(
      balances([manu, 50], [wolfi, -50])
    );

    expect(imbalance).toBe(0);
    expect(payments).toEqual([{ from: wolfi, to: manu, amount: 50 }]);
  });

  it('braucht bei vier Spielern höchstens drei Zahlungen', () => {
    const { payments } = computeSettlement(
      balances([manu, 279], [wolfi, -125], [vogti, -89], [paul, -65])
    );

    expect(payments.length).toBeLessThanOrEqual(3);
  });

  it('paart zwei sich deckende Spieler direkt, statt umzuleiten', () => {
    const { payments } = computeSettlement(
      balances([manu, 100], [wolfi, -100], [vogti, 30], [paul, -30])
    );

    expect(payments.length).toBe(2);
    expect(payments).toContain({ from: wolfi, to: manu, amount: 100 });
    expect(payments).toContain({ from: paul, to: vogti, amount: 30 });
  });

  it('zahlt jeden Gläubiger genau auf seinen Stand', () => {
    const input = balances([manu, 279], [wolfi, -125], [vogti, -89], [paul, -65]);
    const { payments } = computeSettlement(input);

    for (const { player, amount } of input) {
      const erhalten = payments.filter(z => z.to.id === player.id)
        .reduce((s, z) => s + z.amount, 0);
      const gezahlt = payments.filter(z => z.from.id === player.id)
        .reduce((s, z) => s + z.amount, 0);
      expect(erhalten - gezahlt).toBe(amount);
    }
  });

  it('erzeugt keine Zahlung, wenn alle bei null stehen', () => {
    const { payments, imbalance } = computeSettlement(
      balances([manu, 0], [wolfi, 0], [vogti, 0], [paul, 0])
    );

    expect(payments).toEqual([]);
    expect(imbalance).toBe(0);
  });

  it('meldet eine unausgeglichene Runde, statt sie stillschweigend zu verteilen', () => {
    // Drei bekommen je 50, nur einer zahlt 50 - der Fehler aus dem README.
    const { payments, imbalance } = computeSettlement(
      balances([manu, 50], [wolfi, 50], [vogti, 50], [paul, -50])
    );

    expect(imbalance).toBe(100);
    // Verteilt wird nur, was sich deckt: die 50, die Paul tatsächlich zahlt.
    expect(payments.reduce((s, z) => s + z.amount, 0)).toBe(50);
  });

  it('lässt die übergebenen Kontostände unangetastet', () => {
    const input = balances([manu, 50], [wolfi, -50]);
    computeSettlement(input);

    expect(input.map(b => b.amount)).toEqual([50, -50]);
  });
});

describe('formatCents', () => {
  it('formatiert Cent als deutschen Betrag', () => {
    expect(formatCents(420)).toBe('4,20 €');
    expect(formatCents(5)).toBe('0,05 €');
    expect(formatCents(100)).toBe('1,00 €');
    expect(formatCents(0)).toBe('0,00 €');
    expect(formatCents(-250)).toBe('-2,50 €');
  });
});
