import { describe, expect, it } from 'vitest';
import { selectDailyFigure } from './dailyFigure';
import type { Figure } from '../../../types/figure';

const figures: Figure[] = [
  { id: 'c', name: 'C' }, { id: 'a', name: 'A' }, { id: 'b', name: 'B' },
];

describe('selectDailyFigure', () => {
  it('returns the same figure for the same local date regardless of input order', () => {
    const date = new Date(2026, 7, 10, 12);
    expect(selectDailyFigure(figures, date)?.id).toBe(selectDailyFigure([...figures].reverse(), date)?.id);
  });

  it('returns null for an empty collection', () => {
    expect(selectDailyFigure([], new Date(2026, 7, 10))).toBeNull();
  });
});
