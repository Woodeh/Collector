import {
  addDoc,
  arrayUnion,
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
import type { Figure, FigureHistoryEvent, FigureHistoryEventType } from '../../../types/figure';

export type FigurePayload = Omit<Figure, 'id' | 'createdAt' | 'updatedAt' | 'history'>;
export type BulkFigureChanges = Partial<Pick<FigurePayload, 'visibility' | 'conditionGrade' | 'category' | 'brand'>>;

const createHistoryEvent = (
  type: FigureHistoryEventType,
  details: Pick<FigureHistoryEvent, 'from' | 'to'> = {},
): FigureHistoryEvent => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  createdAt: new Date().toISOString(),
  ...details,
});

const comparableImages = (images?: string[]) => JSON.stringify(images ?? []);

const detailFields: Array<keyof FigurePayload> = [
  'name', 'anime', 'brand', 'category', 'gender', 'auctionUrl', 'purchaseDate',
  'conditionNotes', 'hasBox', 'purchasePlace', 'characterId', 'characterImage', 'fullDisplayName',
];

export const buildFigureHistoryEvents = (
  previous: Figure,
  next: FigurePayload,
): FigureHistoryEvent[] => {
  const events: FigureHistoryEvent[] = [];

  if (Number(previous.price ?? 0) !== Number(next.price ?? 0)) {
    events.push(createHistoryEvent('price_changed', { from: Number(previous.price ?? 0), to: Number(next.price ?? 0) }));
  }
  if ((previous.conditionGrade ?? '') !== (next.conditionGrade ?? '')) {
    events.push(createHistoryEvent('condition_changed', { from: previous.conditionGrade ?? '', to: next.conditionGrade ?? '' }));
  }
  if ((previous.visibility ?? 'private') !== (next.visibility ?? 'private')) {
    events.push(createHistoryEvent('visibility_changed', { from: previous.visibility ?? 'private', to: next.visibility ?? 'private' }));
  }
  if (comparableImages(previous.images) !== comparableImages(next.images)) {
    events.push(createHistoryEvent('photos_changed', { from: previous.images?.length ?? 0, to: next.images?.length ?? 0 }));
  }
  if (detailFields.some((field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]))) {
    events.push(createHistoryEvent('details_changed'));
  }

  return events;
};

export const normalizeFigure = (id: string, data: DocumentData): Figure | null => {
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    console.warn(`[Figures] Ignoring invalid document ${id}: missing name`);
    return null;
  }

  const images = Array.isArray(data.images)
    ? data.images.filter((value): value is string => typeof value === 'string')
    : undefined;
  const history = Array.isArray(data.history)
    ? data.history.filter((event): event is FigureHistoryEvent =>
        event != null && typeof event === 'object' && typeof event.id === 'string' &&
        typeof event.type === 'string' && typeof event.createdAt === 'string')
    : undefined;

  return {
    ...data,
    id,
    name: data.name.trim(),
    ...(images ? { images } : {}),
    ...(history ? { history } : {}),
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
    history: [createHistoryEvent('created')],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateFigure = async (figureId: string, data: FigurePayload) => {
  const previous = await getFigureById(figureId);
  const events = previous ? buildFigureHistoryEvents(previous, data) : [];
  await updateDoc(figureDocument(figureId), {
    ...data,
    ...(events.length > 0 ? { history: arrayUnion(...events) } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const bulkUpdateFigures = async (figures: Figure[], changes: BulkFigureChanges) => {
  const entries = Object.entries(changes).filter(([, value]) => value !== undefined && value !== '');
  if (figures.length === 0 || entries.length === 0) return;
  const cleanChanges = Object.fromEntries(entries) as BulkFigureChanges;

  for (let offset = 0; offset < figures.length; offset += 450) {
    const batch = writeBatch(db);
    figures.slice(offset, offset + 450).forEach((figure) => {
      const next = { ...figure, ...cleanChanges } as FigurePayload;
      const events = buildFigureHistoryEvents(figure, next);
      batch.update(figureDocument(figure.id), {
        ...cleanChanges,
        ...(events.length > 0 ? { history: arrayUnion(...events) } : {}),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }
};

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
