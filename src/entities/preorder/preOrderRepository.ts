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
import type { PreOrder, PreOrderFormData } from './model';
import { addContactInterval } from './contactCycle';

export const normalizePreOrder = (id: string, data: Record<string, unknown>): PreOrder | null => {
  if (typeof data.name !== 'string' || typeof data.userId !== 'string') {
    console.warn(`[Pre-orders] Ignoring invalid document ${id}`);
    return null;
  }

  return {
    ...(data as Omit<PreOrder, 'id' | 'totalPrice' | 'deposit'>),
    id,
    name: data.name,
    userId: data.userId,
    totalPrice: Number(data.totalPrice) || 0,
    deposit: Number(data.deposit) || 0,
    contactCount: Number(data.contactCount) || 0,
  };
};

export const subscribeToPreOrders = (
  userId: string,
  onData: (items: PreOrder[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(
      collection(db, 'preorders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) =>
      onData(
        snapshot.docs
          .map((item) => normalizePreOrder(item.id, item.data()))
          .filter((item): item is PreOrder => item !== null),
      ),
    onError,
  );

export const createPreOrder = (
  userId: string,
  authorName: string,
  data: PreOrderFormData & { totalPrice: number; deposit: number; screenshot: string },
) => {
  const lastContact = new Date(data.lastContactedAt || new Date());
  return addDoc(collection(db, 'preorders'), {
    ...data,
    userId,
    authorName,
    lastContactedAt: lastContact.toISOString(),
    nextContactAt: addContactInterval(lastContact).toISOString(),
    contactCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const markSellerContacted = (
  preOrderId: string,
  previousContactCount = 0,
  contactedAt = new Date(),
) => updateDoc(doc(db, 'preorders', preOrderId), {
  lastContactedAt: contactedAt.toISOString(),
  nextContactAt: addContactInterval(contactedAt).toISOString(),
  contactCount: previousContactCount + 1,
  updatedAt: serverTimestamp(),
});

export const deletePreOrder = (preOrderId: string) => deleteDoc(doc(db, 'preorders', preOrderId));

export const getPreOrderCount = async (userId: string): Promise<number> => {
  const snapshot = await getCountFromServer(
    query(collection(db, 'preorders'), where('userId', '==', userId)),
  );
  return snapshot.data().count;
};
