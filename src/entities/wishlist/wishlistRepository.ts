import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { WishlistFormData, WishlistItem } from './model';

export const normalizeWishlistItem = (id: string, data: Record<string, unknown>): WishlistItem | null => {
  if (typeof data.name !== 'string' || typeof data.userId !== 'string') {
    console.warn(`[Wishlist] Ignoring invalid document ${id}`);
    return null;
  }

  return {
    ...(data as Omit<WishlistItem, 'id' | 'price'>),
    id,
    name: data.name,
    userId: data.userId,
    price: Number(data.price) || 0,
  };
};

export const subscribeToWishlist = (
  userId: string,
  onData: (items: WishlistItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(
      collection(db, 'wishlist'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) =>
      onData(
        snapshot.docs
          .map((item) => normalizeWishlistItem(item.id, item.data()))
          .filter((item): item is WishlistItem => item !== null),
      ),
    onError,
  );

export const createWishlistItem = (
  userId: string,
  data: WishlistFormData & { image: string; price: number },
) => addDoc(collection(db, 'wishlist'), { ...data, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateWishlistItem = (
  itemId: string,
  data: WishlistFormData & { image: string; price: number },
) => updateDoc(doc(db, 'wishlist', itemId), { ...data, updatedAt: serverTimestamp() });

export const deleteWishlistItem = (itemId: string) => deleteDoc(doc(db, 'wishlist', itemId));

export const getWishlistCount = async (userId: string): Promise<number> => {
  const snapshot = await getCountFromServer(
    query(collection(db, 'wishlist'), where('userId', '==', userId)),
  );
  return snapshot.data().count;
};
