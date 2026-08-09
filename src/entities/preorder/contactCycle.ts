import type { PreOrder } from './model';

export const CONTACT_INTERVAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export const addContactInterval = (date: Date): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + CONTACT_INTERVAL_DAYS);
  return next;
};

const timestampToDate = (value: PreOrder['createdAt']): Date | null =>
  value?.toDate ? value.toDate() : null;

export const getLastContactDate = (item: PreOrder): Date => {
  const source = item.lastContactedAt || item.paymentDate;
  const parsed = source ? new Date(source) : timestampToDate(item.createdAt);
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
};

export const getNextContactDate = (item: PreOrder): Date => {
  const stored = item.nextContactAt ? new Date(item.nextContactAt) : null;
  return stored && !Number.isNaN(stored.getTime()) ? stored : addContactInterval(getLastContactDate(item));
};

export interface ContactCycleStatus {
  nextContactDate: Date;
  daysRemaining: number;
  overdueDays: number;
  status: 'ok' | 'due_soon' | 'overdue';
}

export const getContactCycleStatus = (item: PreOrder, now = new Date()): ContactCycleStatus => {
  const nextContactDate = getNextContactDate(item);
  const difference = nextContactDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(difference / DAY_MS));
  const overdueDays = Math.max(0, Math.floor(-difference / DAY_MS));
  return {
    nextContactDate,
    daysRemaining,
    overdueDays,
    status: difference <= 0 ? 'overdue' : daysRemaining <= 5 ? 'due_soon' : 'ok',
  };
};
