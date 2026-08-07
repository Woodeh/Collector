import { describe, expect, it, vi } from 'vitest';
import { normalizeWishlistItem } from './wishlistRepository';

describe('normalizeWishlistItem', () => {
  it('converts a legacy string price to a number', () => {
    const item = normalizeWishlistItem('wish-1', {
      name: 'Grail',
      userId: 'user-1',
      anime: 'Eva',
      brand: 'Alter',
      price: '99.5',
      link: '',
      image: '',
    });

    expect(item?.price).toBe(99.5);
  });

  it('rejects records without an owner', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizeWishlistItem('broken', { name: 'Unknown' })).toBeNull();
  });
});
