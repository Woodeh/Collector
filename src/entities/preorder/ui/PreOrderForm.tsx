import React, { FC, ChangeEvent, FormEvent, useCallback } from 'react';
import { X, Camera } from 'lucide-react';
import AnimeSearch from '../../../features/figure-form/AnimeSearch';
import type { Currency } from '../../../types/figure';
import { useI18n } from '../../../app/i18n/I18nProvider';
import { useModalDialog } from '../../../shared/lib/useModalDialog';

// Интерфейс для данных формы
interface PreOrderFormData {
  name: string;
  anime: string;
  brand: string;
  totalPrice: string | number;
  deposit: string | number;
  paymentDate: string;
  releaseDate: string;
  sellerName: string;
  sellerContactUrl: string;
  lastContactedAt: string;
}

// Интерфейс пропсов компонента
interface PreOrderFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  formData: PreOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<PreOrderFormData>>;
  formCurrency: Currency;
  setFormCurrency: (currency: Currency) => void;
  screenshotPreview: string | null;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  submitting: boolean;
  resetForm: () => void;
  errors: Record<string, string>;
}

const PreOrderForm: FC<PreOrderFormProps> = ({
  showForm,
  setShowForm,
  formData,
  setFormData,
  formCurrency,
  setFormCurrency,
  screenshotPreview,
  handleFileChange,
  handleSubmit,
  submitting,
  resetForm,
  errors,
}) => {
  const { t } = useI18n();
  const closeForm = useCallback(() => { setShowForm(false); resetForm(); }, [resetForm, setShowForm]);
  const dialogRef = useModalDialog(showForm, closeForm);
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="preorder-form-title" tabIndex={-1} className="ui-dialog ui-accent-orange border w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-7 md:p-8 relative my-auto animate-in zoom-in duration-300 shadow-2xl text-left">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          aria-label={t('common.close')}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 text-gray-500 hover:text-white transition-colors z-50 cursor-pointer"
        >
          <X size={24} />
        </button>
        <h2 id="preorder-form-title" className="pr-10 text-xl sm:text-2xl font-black mb-6 sm:mb-8 uppercase italic tracking-tighter text-white">
          {t('preorders.new')}
        </h2>
        <form onSubmit={handleSubmit} className="ui-form space-y-4 sm:space-y-5">
          <div><input
            placeholder={t('preorders.figureName')}
            aria-invalid={Boolean(errors.name)}
            className={`w-full bg-[#121212] border p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold ${errors.name ? 'border-red-500' : 'border-[#333]'}`}
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />{errors.name && <p className="mt-1.5 px-2 text-xs font-bold text-red-400">{errors.name}</p>}</div>
          <AnimeSearch
            value={formData.anime}
            onChange={(val: string) => setFormData({ ...formData, anime: val })}
          />
          {errors.anime && <p className="-mt-3 px-2 text-xs font-bold text-red-400">{errors.anime}</p>}
          <input
            placeholder={t('preorders.brand')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />
          <input
            placeholder={t('preorders.sellerPlaceholder')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.sellerName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sellerName: e.target.value })}
          />
          <input
            type="url"
            placeholder={t('preorders.contactUrl')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.sellerContactUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sellerContactUrl: e.target.value })}
          />
          <label className="block space-y-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
            {t('preorders.lastContact')}
            <input type="date" className="mt-2 w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
              value={formData.lastContactedAt} onChange={(e) => setFormData({ ...formData, lastContactedAt: e.target.value })} required />
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold appearance-none cursor-pointer outline-none focus:border-orange-500"
              value={formCurrency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormCurrency(e.target.value as Currency)}
            >
              <option value="USD">USD ($)</option>
              <option value="KZT">KZT (₸)</option>
              <option value="CNY">CNY (¥)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={t('preorders.totalPrice')}
              className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
              value={formData.totalPrice}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, totalPrice: e.target.value })
              }
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={t('preorders.depositPaid')}
              className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
              value={formData.deposit}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, deposit: e.target.value })
              }
              required
            />
          </div>
          {(errors.totalPrice || errors.deposit) && <div className="-mt-2 grid grid-cols-1 gap-2 text-xs font-bold text-red-400 min-[420px]:grid-cols-2 min-[420px]:gap-4"><p>{errors.totalPrice}</p><p>{errors.deposit}</p></div>}
          <input
            type="date"
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
            value={formData.paymentDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, paymentDate: e.target.value })
            }
            required
          />
          <input
            placeholder={t('preorders.release')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
            value={formData.releaseDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, releaseDate: e.target.value })
            }
            required
          />
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative">
            {screenshotPreview ? (
              <img
                src={screenshotPreview}
                className="w-full h-full object-cover rounded-xl opacity-60"
                alt="Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="text-gray-500" size={24} />
                <span className="text-[10px] text-gray-500 font-black uppercase">
                  {t('preorders.upload')}
                </span>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/jpeg,image/png,image/webp,image/avif" />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="ui-button w-full bg-orange-600 py-4 font-black text-lg hover:bg-orange-500 text-white shadow-xl uppercase italic tracking-widest cursor-pointer"
          >
            {submitting ? t('preorders.saving') : t('preorders.addToList')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreOrderForm;
