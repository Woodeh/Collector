import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import type { Figure } from '../../../types/figure';

export type FigurePayload = Omit<Figure, 'id' | 'createdAt' | 'updatedAt'>;

export const normalizeFigure = (id: string, data: DocumentData): Figure | null => {
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    console.warn(`[Figures] Ignoring invalid document ${id}: missing name`);
    return null;
  }

  const images = Array.isArray(data.images)
    ? data.images.filter((value): value is string => typeof value === 'string')
    : undefined;

  return {
    ...data,
    id,
    name: data.name.trim(),
    ...(images ? { images } : {}),
  } as Figure;
};

const toFigure = (
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): Figure | null => normalizeFigure(snapshot.id, snapshot.data() ?? {});

const validFigures = (snapshots: QueryDocumentSnapshot<DocumentData>[]): Figure[] =>
  snapshots.map(toFigure).filter((item): item is Figure => item !== null);

type SubscriptionErrorHandler = (error: Error) => void;

export const subscribeToUserFigures = (
  userId: string,
  onData: (figures: Figure[]) => void,
  onError: SubscriptionErrorHandler,
): Unsubscribe =>
  onSnapshot(
    query(
      collection(db, 'figures'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) => onData(validFigures(snapshot.docs)),
    onError,
  );

export const subscribeToPublicFigures = (
  onData: (figures: Figure[]) => void,
  onError: SubscriptionErrorHandler,
): Unsubscribe =>
  onSnapshot(
    query(
      collection(db, 'figures'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) => onData(validFigures(snapshot.docs)),
    onError,
  );

export const figureDocument = (figureId: string) => doc(db, 'figures', figureId);

export const createFigure = (data: FigurePayload) =>
  addDoc(collection(db, 'figures'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateFigure = (figureId: string, data: FigurePayload) =>
  updateDoc(figureDocument(figureId), { ...data, updatedAt: serverTimestamp() });

export const deleteFigure = (figureId: string) => deleteDoc(figureDocument(figureId));

export const setFavoriteFigure = async (
  previousFigureId: string | undefined,
  nextFigureId: string,
): Promise<void> => {
  const batch = writeBatch(db);
  if (previousFigureId && previousFigureId !== nextFigureId) {
    batch.update(figureDocument(previousFigureId), { isFavorite: false, updatedAt: serverTimestamp() });
  }
  batch.update(figureDocument(nextFigureId), { isFavorite: true, updatedAt: serverTimestamp() });
  await batch.commit();
};

export const getFigureById = async (figureId: string): Promise<Figure | null> => {
  const snapshot = await getDoc(figureDocument(figureId));
  return snapshot.exists() ? toFigure(snapshot) : null;
};

export const getUserFigures = async (userId: string): Promise<Figure[]> => {
  const snapshot = await getDocs(
    query(collection(db, 'figures'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
  );
  return validFigures(snapshot.docs);
};

export const getRecentPublicFigures = async (count = 15): Promise<Figure[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, 'figures'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(count),
    ),
  );
  return validFigures(snapshot.docs);
};

export const getPublicCatalogMatches = async (
  characterName: string,
  characterId?: number | null,
  count = 5,
): Promise<Figure[]> => {
  const snapshot = await getDocs(
    query(collection(db, 'figures'), where('visibility', '==', 'public'), limit(100)),
  );
  const normalizedName = characterName.trim().toLocaleLowerCase();

  return validFigures(snapshot.docs)
    .map((figure) => {
      const sameCharacterId =
        characterId != null && String(figure.characterId) === String(characterId);
      const figureName = figure.name.trim().toLocaleLowerCase();
      const sameName = figureName === normalizedName;
      const relatedName =
        normalizedName.length >= 2 &&
        (figureName.includes(normalizedName) || normalizedName.includes(figureName));
      return { figure, score: sameCharacterId ? 3 : sameName ? 2 : relatedName ? 1 : 0 };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .map(({ figure }) => figure);
};

export const getRelatedPublicFigures = async (
  figureId: string,
  anime?: string,
  count = 4,
): Promise<Figure[]> => {
  let matches: Figure[] = [];

  if (anime) {
    const sameAnime = await getDocs(
      query(
        collection(db, 'figures'),
        where('anime', '==', anime),
        where('visibility', '==', 'public'),
        limit(10),
      ),
    );
    matches = validFigures(sameAnime.docs).filter((item) => item.id !== figureId);
  }

  if (matches.length < count) {
    const fallback = await getDocs(
      query(collection(db, 'figures'), where('visibility', '==', 'public'), limit(20)),
    );
    const existingIds = new Set(matches.map((item) => item.id));
    matches.push(
      ...validFigures(fallback.docs).filter(
        (item) => item.id !== figureId && !existingIds.has(item.id),
      ),
    );
  }

  return matches.sort(() => Math.random() - 0.5).slice(0, count);
};
