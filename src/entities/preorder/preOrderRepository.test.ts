import { describe, expect, it, vi } from 'vitest';
import { normalizePreOrder } from './preOrderRepository';

describe('normalizePreOrder', () => {
  it('normalizes monetary fields', () => {
    const item = normalizePreOrder('pre-1', {
      name: 'Rei',
      userId: 'user-1',
      anime: 'Eva',
      brand: 'Alter',
      totalPrice: '250',
      deposit: '50',
      releaseDate: '2027-01-01',
      paymentDate: '2026-12-01',
      authorName: 'Collector',
    });

    expect(item).toMatchObject({ totalPrice: 250, deposit: 50 });
  });

  it('rejects records without a name', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizePreOrder('broken', { userId: 'user-1' })).toBeNull();
  });
});
