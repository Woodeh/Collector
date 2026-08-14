import React, { useState, useCallback, FC, FormEvent, ChangeEvent } from 'react';
import { X, Camera, Link as LinkIcon, Loader2 } from 'lucide-react';
import AnimeSearch from '../../features/figure-form/AnimeSearch';
import { useI18n } from '../../app/i18n/I18nProvider';
import { useModalDialog } from '../../shared/lib/useModalDialog';

// Интерфейс структуры данных формы
interface WishlistFormData {
  name: string;
  anime: string;
  brand: string;
  price: string | number;
  link: string;
  image: string;
}

// Интерфейс пропсов компонента
interface WishlistFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  formData: WishlistFormData;
  setFormData: React.Dispatch<React.SetStateAction<WishlistFormData>>;
  handleSubmit: (e: FormEvent) => void;
  submitting: boolean;
  isEditing: boolean;
  imagePreview: string | null;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

const WishlistForm: FC<WishlistFormProps> = ({
  showForm,
  setShowForm,
  formData,
  setFormData,
  handleSubmit,
  submitting,
  isEditing,
  imagePreview,
  handleImageChange,
  errors,
}) => {
  const { t } = useI18n();
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const closeForm = useCallback(() => setShowForm(false), [setShowForm]);
  const dialogRef = useModalDialog(showForm, closeForm);

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/80 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="wishlist-form-title" tabIndex={-1} className="ui-dialog ui-accent-pink border w-full max-w-md p-5 sm:p-7 relative shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] text-left">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          aria-label={t('common.close')}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-500 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <h2 id="wishlist-form-title" className="text-xl font-black mb-6 uppercase italic tracking-tighter text-white">
          {isEditing ? t('wishlist.update') : t('wishlist.new')}
        </h2>

        <form onSubmit={handleSubmit} className="ui-form space-y-4">
          <div className="flex gap-2 p-1 bg-[#121212] rounded-xl border border-[#333]">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                uploadMode === 'file'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Camera size={14} /> {t('wishlist.uploadFile')}
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                uploadMode === 'url'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LinkIcon size={14} /> {t('wishlist.imageUrl')}
            </button>
          </div>

          <div className="space-y-3">
            {uploadMode === 'file' ? (
              <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative">
                {imagePreview && uploadMode === 'file' ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="text-gray-500" size={24} />
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      {t('wishlist.uploadDevice')}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <LinkIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <input
                    placeholder={t('wishlist.imageUrl')}
                    className="w-full bg-[#121212] border border-[#333] py-4 pl-12 pr-4 rounded-xl outline-none focus:border-pink-600 text-sm text-white font-bold transition-all"
                    value={formData.image || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                {formData.image && formData.image.startsWith('http') && (
                  <div className="h-40 w-full rounded-2xl overflow-hidden border border-[#333] bg-black">
                    <img
                      src={formData.image}
                      className="w-full h-full object-cover"
                      alt="URL Preview"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <input
                placeholder={t('wishlist.figureName')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'wishlist-name-error' : undefined}
                className={`w-full bg-[#121212] border p-4 rounded-xl outline-none focus:border-pink-600 text-sm text-white font-bold ${errors.name ? 'border-red-500' : 'border-[#333]'}`}
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {errors.name && <p id="wishlist-name-error" className="mt-1.5 px-2 text-xs font-bold text-red-400">{errors.name}</p>}
            </div>

            <AnimeSearch
              value={formData.anime}
              onChange={(val: string) => setFormData({ ...formData, anime: val })}
            />

            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <input
                placeholder={t('wishlist.brand')}
                className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                value={formData.brand}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, brand: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder={t('wishlist.price')}
                className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                value={formData.price}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            {errors.price && <p className="text-xs font-bold text-red-400">{errors.price}</p>}

            <input
              type="url"
              placeholder={t('wishlist.storeLink')}
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
              value={formData.link}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          <button
            disabled={submitting}
            className="ui-button w-full bg-pink-600 py-4 font-black text-sm hover:bg-pink-500 text-white uppercase italic tracking-widest shadow-xl shadow-pink-600/10 cursor-pointer mt-4"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> <span>{t('wishlist.syncing')}</span>
              </div>
            ) : isEditing ? (
              t('common.save')
            ) : (
              t('wishlist.initialize')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WishlistForm;
