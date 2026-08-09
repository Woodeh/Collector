import type { Timestamp } from 'firebase/firestore';

export interface PreOrder {
  id: string;
  name: string;
  anime: string;
  brand: string;
  totalPrice: number;
  deposit: number;
  releaseDate: string;
  paymentDate: string;
  screenshot?: string;
  userId: string;
  createdAt?: Timestamp;
  authorName: string;
  sellerName?: string;
  sellerContactUrl?: string;
  lastContactedAt?: string;
  nextContactAt?: string;
  contactCount?: number;
}

export interface PreOrderFormData {
  name: string;
  anime: string;
  brand: string;
  totalPrice: string | number;
  deposit: string | number;
  releaseDate: string;
  paymentDate: string;
  sellerName: string;
  sellerContactUrl: string;
  lastContactedAt: string;
}
