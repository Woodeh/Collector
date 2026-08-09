import { describe, expect, it, vi } from 'vitest';
import { buildFigureHistoryEvents, normalizeFigure } from './figureRepository';

describe('normalizeFigure', () => {
  it('normalizes a valid document and removes invalid image values', () => {
    expect(
      normalizeFigure('figure-1', {
        name: '  Asuka  ',
        price: '120',
        images: ['one.webp', null, 42, 'two.webp'],
      }),
    ).toMatchObject({
      id: 'figure-1',
      name: 'Asuka',
      images: ['one.webp', 'two.webp'],
    });
  });

  it('rejects documents without a usable name', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizeFigure('broken', { price: 10 })).toBeNull();
  });
});

describe('buildFigureHistoryEvents', () => {
  const previous = normalizeFigure('figure-1', {
    name: 'Asuka', price: 100, conditionGrade: 'Good', visibility: 'private',
    images: ['one.webp'], userId: 'user-1', anime: 'Evangelion', brand: 'Alter',
  })!;

  it('records individual price, visibility and photo changes', () => {
    const events = buildFigureHistoryEvents(previous, {
      name: 'Asuka', price: 125, conditionGrade: 'Good', visibility: 'public',
      images: ['one.webp', 'two.webp'], userId: 'user-1', anime: 'Evangelion', brand: 'Alter',
    });

    expect(events.map((event) => event.type)).toEqual([
      'price_changed', 'visibility_changed', 'photos_changed',
    ]);
    expect(events[0]).toMatchObject({ from: 100, to: 125 });
  });

  it('does not create events when tracked values are unchanged', () => {
    expect(buildFigureHistoryEvents(previous, {
      name: 'Asuka', price: 100, conditionGrade: 'Good', visibility: 'private',
      images: ['one.webp'], userId: 'user-1', anime: 'Evangelion', brand: 'Alter',
    })).toEqual([]);
  });
});
