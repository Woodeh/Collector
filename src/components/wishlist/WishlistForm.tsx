import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { X, Camera, Link as LinkIcon, Loader2 } from 'lucide-react';
import AnimeSearch from '../AnimeSearch';

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
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="absolute top-6 right-6 text-gray-500 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter text-white">
          {isEditing ? 'Update Target' : 'New Grail Target'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Camera size={14} /> File
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
              <LinkIcon size={14} /> URL
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
                      Upload from Device
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
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
                    placeholder="Direct Image URL (jpg, png, webp)"
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
            <input
              placeholder="Figure Name *"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-pink-600 text-sm text-white font-bold"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <AnimeSearch
              value={formData.anime}
              onChange={(val: string) => setFormData({ ...formData, anime: val })}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Brand"
                className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                value={formData.brand}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, brand: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price ($)"
                className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                value={formData.price}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <input
              placeholder="Store Link / Auction Link (URL)"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
              value={formData.link}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          <button
            disabled={submitting}
            className="w-full bg-pink-600 py-4 rounded-xl font-black text-sm hover:bg-pink-500 text-white uppercase italic tracking-widest transition-all active:scale-95 shadow-xl shadow-pink-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> <span>Syncing...</span>
              </div>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Initialize Target'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WishlistForm;