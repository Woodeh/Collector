import { describe, expect, it, vi } from 'vitest';
import { normalizeFigure } from './figureRepository';

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
