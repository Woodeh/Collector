import type { Timestamp } from 'firebase/firestore';

export type FigureHistoryEventType =
  | 'created'
  | 'details_changed'
  | 'price_changed'
  | 'condition_changed'
  | 'visibility_changed'
  | 'photos_changed';

export interface FigureHistoryEvent {
  id: string;
  type: FigureHistoryEventType;
  createdAt: string;
  from?: string | number;
  to?: string | number;
}

export interface Figure {
  id: string;
  name: string;
  anime?: string;
  brand?: string;
  category?: string;
  price?: number | string;
  image?: string;
  previewImage?: string;
  images?: string[];
  gender?: 'Male' | 'Female' | string;
  authorName?: string;
  conditionGrade?: string;
  hasBox?: string | boolean;
  userId?: string;
  visibility?: 'private' | 'public';
  authorId?: string;
  fullDisplayName?: string;
  characterId?: string | number | null;
  characterImage?: string;
  auctionUrl?: string;
  purchaseDate?: string;
  conditionNotes?: string;
  purchasePlace?: string;
  isFavorite?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  history?: FigureHistoryEvent[];
}

export interface SpotlightFigure extends Figure {
  name: string;
  anime: string;
  price: number | string;
  brand: string;
}

export interface RankProtocol {
  name: string;
  next: number;
  color: string;
  bg: string;
}

export interface RankStats {
  count: number;
  rank: RankProtocol;
}

export type Currency = 'USD' | 'KZT' | 'CNY';
