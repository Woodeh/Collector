import React, { FC, ChangeEvent, FormEvent } from 'react';
import { X, Camera } from 'lucide-react';
import AnimeSearch from '../../../features/figure-form/AnimeSearch';
import type { Currency } from '../../../types/figure';
import { useI18n } from '../../../app/i18n/I18nProvider';

// Интерфейс для данных формы
interface PreOrderFormData {
  name: string;
  anime: string;
  brand: string;
  totalPrice: string | number;
  deposit: string | number;
  paymentDate: string;
  releaseDate: string;
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
}) => {
  const { t } = useI18n();
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[3rem] p-10 relative my-auto animate-in zoom-in duration-300 shadow-2xl text-left">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-50 cursor-pointer"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black mb-8 uppercase italic tracking-tighter text-white">
          {t('preorders.new')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            placeholder={t('preorders.figureName')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <AnimeSearch
            value={formData.anime}
            onChange={(val: string) => setFormData({ ...formData, anime: val })}
          />
          <input
            placeholder={t('preorders.brand')}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />
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
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
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
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg hover:bg-orange-500 text-white transition-all shadow-xl uppercase italic tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('preorders.saving') : t('preorders.addToList')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreOrderForm;
