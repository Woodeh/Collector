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
}

export interface PreOrderFormData {
  name: string;
  anime: string;
  brand: string;
  totalPrice: string | number;
  deposit: string | number;
  releaseDate: string;
  paymentDate: string;
}
