export interface FigureFormOption { value: string; label: string }

export const exchangeRates: Record<string, number> = { USD: 1, KZT: 0.0022, CNY: 0.14 };

export const brandOptions: FigureFormOption[] = [
  'Bandai Spirits', 'BANDAI', 'Bandai Masterlise', 'MegaHouse', 'Sega', 'Taito', 'FuRyu',
  'Good Smile Company', 'Kotobukiya', 'Inart', 'Alter', 'Banpresto', 'Ichiban Kuji', 'Other',
].map((value) => ({
  value,
  label: value === 'Good Smile Company' ? 'Good Smile Co.' : value === 'Other' ? 'Other / Original' : value,
}));

export const conditionOptions: FigureFormOption[] = [
  { value: 'New (Sealed)', label: 'New (Sealed)' }, { value: 'Like New', label: 'Like New' },
  { value: 'Good', label: 'Good' }, { value: 'Minor Damage', label: 'Minor Damage' },
  { value: 'Missing Parts', label: 'Missing Parts' }, { value: 'Poor', label: 'Poor Condition' },
];

export const shopOptions: FigureFormOption[] = ['Jalan Jalan Japan', 'TaoBao', 'OLX', 'Other']
  .map((value) => ({ value, label: value }));
