import type { Figure } from '../../../types/figure';

const dateKey = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()]
  .map((part, index) => index === 0 ? String(part) : String(part).padStart(2, '0'))
  .join('-');

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const selectDailyFigure = (figures: Figure[], date = new Date()): Figure | null => {
  if (figures.length === 0) return null;
  const stableFigures = [...figures].sort((left, right) => left.id.localeCompare(right.id));
  return stableFigures[hashString(dateKey(date)) % stableFigures.length] ?? null;
};
