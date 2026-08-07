import type { Timestamp } from 'firebase/firestore';

export interface WishlistItem {
  id: string;
  name: string;
  anime: string;
  brand: string;
  price: number;
  link: string;
  image: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface WishlistFormData {
  name: string;
  anime: string;
  brand: string;
  price: string | number;
  link: string;
  image: string;
}
