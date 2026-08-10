import { useEffect, useState } from 'react';
import { Layers3, Loader2, X } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';
import type { BulkFigureChanges } from '../../entities/figures/api/figureRepository';
import { conditionOptions } from '../figure-form/options';

interface BulkEditModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onApply: (changes: BulkFigureChanges) => Promise<void>;
}

const BulkEditModal = ({ isOpen, selectedCount, onClose, onApply }: BulkEditModalProps) => {
  const { t } = useI18n();
  const [visibility, setVisibility] = useState('');
  const [conditionGrade, setConditionGrade] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) { setVisibility(''); setConditionGrade(''); setCategory(''); setBrand(''); setError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = async () => {
    const changes: BulkFigureChanges = {};
    if (visibility) changes.visibility = visibility as 'private' | 'public';
    if (conditionGrade) changes.conditionGrade = conditionGrade;
    if (category.trim()) changes.category = category.trim();
    if (brand.trim()) changes.brand = brand.trim();
    if (Object.keys(changes).length === 0) { setError(t('bulk.noChanges')); return; }
    setApplying(true);
    try { await onApply(changes); onClose(); } finally { setApplying(false); }
  };

  const inputClass = 'w-full rounded-xl border border-[#333] bg-[#121212] p-4 text-sm font-bold text-white outline-none focus:border-blue-500';
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border border-[#333] bg-[#1a1a1a] p-5 sm:p-7 shadow-2xl">
        <button type="button" onClick={onClose} aria-label={t('common.close')} className="absolute right-4 top-4 sm:right-6 sm:top-6 text-gray-500 hover:text-white"><X size={20} /></button>
        <div className="mb-6 flex items-center gap-3"><Layers3 className="text-blue-500" /><div><h2 className="text-xl font-black uppercase italic text-white">{t('bulk.title')}</h2><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t('bulk.selected', { count: selectedCount })}</p></div></div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{t('bulk.visibility')}<select value={visibility} onChange={(e) => setVisibility(e.target.value)} className={`${inputClass} mt-2`}><option value="">{t('bulk.keep')}</option><option value="private">{t('form.private')}</option><option value="public">{t('form.public')}</option></select></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{t('bulk.condition')}<select value={conditionGrade} onChange={(e) => setConditionGrade(e.target.value)} className={`${inputClass} mt-2`}><option value="">{t('bulk.keep')}</option>{conditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('bulk.category')} className={inputClass} />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t('bulk.brand')} className={inputClass} />
          {error && <p className="text-xs font-bold text-red-400">{error}</p>}
          <button type="button" disabled={applying} onClick={handleApply} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 text-sm font-black uppercase text-white hover:bg-blue-500 disabled:opacity-50">{applying && <Loader2 className="animate-spin" size={16} />}{applying ? t('bulk.applying') : t('bulk.apply')}</button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;
