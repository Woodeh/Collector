import { describe, expect, it, vi } from 'vitest';
import { normalizePreOrder } from './preOrderRepository';
import { getContactCycleStatus } from './contactCycle';

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

  it('normalizes the contact counter', () => {
    const item = normalizePreOrder('pre-2', {
      name: 'Asuka', userId: 'user-1', anime: 'Eva', brand: 'Alter', totalPrice: 200,
      deposit: 50, releaseDate: '2027-01', paymentDate: '2026-01-01', authorName: 'Collector',
      contactCount: '3',
    });
    expect(item?.contactCount).toBe(3);
  });
});

describe('seller contact cycle', () => {
  const preorder = normalizePreOrder('pre-contact', {
    name: 'Rei', userId: 'user-1', anime: 'Eva', brand: 'Alter', totalPrice: 250,
    deposit: 50, releaseDate: '2027-01', paymentDate: '2026-01-01', authorName: 'Collector',
    lastContactedAt: '2026-07-01T00:00:00.000Z', nextContactAt: '2026-07-31T00:00:00.000Z',
  })!;

  it('marks a contact as due soon within five days', () => {
    expect(getContactCycleStatus(preorder, new Date('2026-07-27T00:00:00.000Z'))).toMatchObject({
      status: 'due_soon', daysRemaining: 4,
    });
  });

  it('marks a missed contact as overdue', () => {
    expect(getContactCycleStatus(preorder, new Date('2026-08-03T00:00:00.000Z'))).toMatchObject({
      status: 'overdue', overdueDays: 3,
    });
  });
});
