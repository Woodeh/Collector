export interface Figure {
  id: string;
  name?: string;
  anime?: string;
  brand?: string;
  price?: number | string;
  image?: string;
  previewImage?: string;
  images?: string[];
  gender?: 'Male' | 'Female' | string;
  authorName?: string;
  conditionGrade?: string;
  hasBox?: string | boolean;
  userId?: string;
  createdAt?: {
    seconds: number;
  };
  [key: string]: any;
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
