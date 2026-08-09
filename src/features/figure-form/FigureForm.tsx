import React, { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
import { storage, auth } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Loader2, Link as LinkIcon, Edit3, Zap, FileText, Globe2, LockKeyhole, LibraryBig } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import SuccessModal from './ui/SuccessModal';
import SpecsSection from './SpecsSection';
import BasicInfoSection from './BasicInfoSection';
import PhotoUploadSection from '../upload-photo/PhotoUploadSection';

import { useSensor, useSensors, PointerSensor, KeyboardSensor, SensorDescriptor, SensorOptions, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import imageCompression from 'browser-image-compression';
import {
  createFigure,
  getFigureById,
  getPublicCatalogMatches,
  updateFigure,
} from '../../entities/figures/api/figureRepository';
import type { Figure } from '../../types/figure';
import { useI18n } from '../../app/i18n/I18nProvider';
import { brandOptions, conditionOptions, exchangeRates, shopOptions } from './options';

import 'react-datepicker/dist/react-datepicker.css';

// --- Interfaces ---

interface FormData {
  name: string;
  characterId: number | null;
  characterImage: string;
  fullDisplayName: string;
  anime: string;
  brand: string;
  category: string;
  price: string | number;
  gender: string;
  auctionUrl: string;
  purchaseDate: string;
  conditionGrade: string;
  conditionNotes: string;
  hasBox: string;
  purchasePlace: string;
  visibility: 'private' | 'public';
}

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  type: 'new' | 'existing';
}

interface FigureFormProps {
  mode?: 'add' | 'edit';
}

// --- Component ---

const FigureForm: FC<FigureFormProps> = ({ mode = 'add' }) => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(isEdit);
  const [epicSuccess, setEpicSuccess] = useState<{ name: string; img: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [charArtFile, setCharArtFile] = useState<File | null>(null);
  const [catalogMatches, setCatalogMatches] = useState<Figure[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    characterId: null,
    characterImage: '',
    fullDisplayName: '',
    anime: '',
    brand: '',
    category: '',
    price: '',
    gender: 'Male',
    auctionUrl: '',
    purchaseDate: '',
    conditionGrade: 'New (Sealed)',
    conditionNotes: '',
    hasBox: 'Yes',
    purchasePlace: '',
    visibility: 'private',
  });

  const sensors: SensorDescriptor<SensorOptions>[] = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (isEdit && id) {
      const fetchFigure = async () => {
        try {
          const data = await getFigureById(id);
          if (data) {
            if (!auth.currentUser || data.userId !== auth.currentUser.uid) {
              navigate(`/figure/${id}`, { replace: true });
              return;
            }
            setFormData({
              name: data.name,
              characterId: typeof data.characterId === 'number' ? data.characterId : null,
              characterImage: data.characterImage ?? '',
              fullDisplayName: data.fullDisplayName ?? '',
              anime: data.anime ?? '',
              brand: data.brand ?? '',
              category: data.category ?? '',
              price: data.price ?? '',
              gender: data.gender ?? 'Male',
              auctionUrl: data.auctionUrl ?? '',
              purchaseDate: data.purchaseDate ?? '',
              conditionGrade: data.conditionGrade ?? 'New (Sealed)',
              conditionNotes: data.conditionNotes ?? '',
              hasBox: typeof data.hasBox === 'string' ? data.hasBox : data.hasBox ? 'Yes' : 'No',
              purchasePlace: data.purchasePlace ?? '',
              visibility: data.visibility ?? 'private',
            });
            const images = data.images || [];
            const items: MediaItem[] = images.map((url) => ({ id: url, url, type: 'existing' }));
            setMediaItems(items);
            setPreviewId(data.previewImage || (items.length > 0 ? items[0]!.id : null));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setFetching(false);
        }
      };
      fetchFigure();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCustomChange = (name: keyof FormData, value: FormData[keyof FormData]) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter((f) => f.type.startsWith('image/'));
    
    setLoading(true);
    const compressionOptions = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    try {
      const compressedItems: MediaItem[] = await Promise.all(
        validFiles.map(async (file) => {
          let finalFile: File = file;
          if (file.size > 200 * 1024) finalFile = (await imageCompression(file, compressionOptions)) as File;
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(finalFile),
            file: finalFile,
            type: 'new' as const,
          };
        }),
      );
      setMediaItems((prev) => {
        const combined = [...prev, ...compressedItems].slice(0, 5);
        if (!previewId && combined.length > 0) setPreviewId(combined[0]!.id);
        return combined;
      });
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeItem = (id: string) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (previewId === id && filtered.length > 0) setPreviewId(filtered[0]!.id);
      return filtered;
    });
  };

  const findCatalogMatches = async (character: { name: string; mal_id: number }) => {
    setCatalogLoading(true);
    try {
      setCatalogMatches(await getPublicCatalogMatches(character.name, character.mal_id));
    } catch (error) {
      console.error('Community catalog search failed:', error);
      setCatalogMatches([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  const applyCatalogMatch = (match: Figure) => {
    setFormData((current) => ({
      ...current,
      anime: match.anime || current.anime,
      brand: match.brand || current.brand,
      category: match.category || current.category,
      fullDisplayName: match.fullDisplayName || current.fullDisplayName,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mediaItems.length === 0) return alert(t('form.photoRequired'));
    if (!auth.currentUser) return alert(t('form.authRequired'));
    
    setLoading(true);
    try {
      let characterImageUrl = formData.characterImage;

      if (charArtFile) {
        const charArtRef = ref(
          storage,
          `character_arts/${auth.currentUser.uid}/${Date.now()}.webp`,
        );
        await uploadBytes(charArtRef, charArtFile, { contentType: 'image/webp' });
        characterImageUrl = await getDownloadURL(charArtRef);
      }

      const finalUrls: string[] = [];
      for (const item of mediaItems) {
        if (item.type === 'existing') {
          finalUrls.push(item.url);
        } else if (item.file) {
          const fileRef = ref(
            storage,
            `figures/${auth.currentUser.uid}/${Date.now()}_${item.id}.webp`,
          );
          await uploadBytes(fileRef, item.file, { contentType: 'image/webp' });
          const url = await getDownloadURL(fileRef);
          finalUrls.push(url);
        }
      }

      const previewIndex = mediaItems.findIndex((i) => i.id === previewId);
      const previewUrl = finalUrls[previewIndex !== -1 ? previewIndex : 0] || '';
      const priceInUSD = parseFloat((Number(formData.price) * (exchangeRates[currency] ?? 1)).toFixed(2));
      
      const finalData = {
        ...formData,
        characterImage: characterImageUrl,
        userId: auth.currentUser.uid,
        images: finalUrls,
        previewImage: previewUrl,
        price: priceInUSD,
      };

      if (isEdit && id) {
        await updateFigure(id, finalData);
      } else {
        await createFigure({
          ...finalData,
          authorName: (auth.currentUser.displayName || auth.currentUser.email || 'Anon').split('@')[0] ?? 'Anon',
          authorId: auth.currentUser.uid,
        });
      }
      setEpicSuccess({ name: formData.name, img: previewUrl });
      setTimeout(() => navigate('/collection'), 3000);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Unable to save figure');
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass = `
    w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl 
    font-bold text-white text-base 
    focus:border-blue-500 focus:bg-[#121212] focus:text-white
    outline-none transition-all 
    placeholder:text-gray-700 placeholder:font-medium placeholder:italic
  `.replace(/\s+/g, ' ').trim();

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:p-6 text-[#e4e4e4] relative text-left font-sans tracking-tight">
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-500 mb-6" size={60} />
            <Zap
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/30 animate-pulse"
              size={30}
            />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-[0.2em] text-white animate-pulse text-center px-4">
            {t('form.optimizing')}
          </h3>
          <p className="text-[10px] text-blue-500 mt-2 font-mono uppercase tracking-widest opacity-60">
            {t('form.compressing')}
          </p>
        </div>
      )}

      <SuccessModal data={epicSuccess} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 text-left">
        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-4 uppercase tracking-tighter italic text-white text-left">
          {isEdit ? (
            <Edit3 className="text-blue-500" size={28} />
          ) : (
            <PlusCircle className="text-blue-500" size={28} />
          )}
          {isEdit ? t('form.editTitle') : t('form.addTitle')}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-[#1c1c1c] to-[#161616] p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-[#262626] space-y-8"
      >
        <div className=""> 
          <BasicInfoSection
            formData={formData}
            handleCustomChange={handleCustomChange}
            brandOptions={brandOptions}
            currency={currency}
            setCurrency={setCurrency}
            handleChange={handleChange}
            onCharArtFileChange={setCharArtFile}
            onCharacterSelected={findCatalogMatches}
          />
          {(catalogLoading || catalogMatches.length > 0) && (
            <section className="my-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 text-blue-400">
                {catalogLoading ? <Loader2 size={16} className="animate-spin" /> : <LibraryBig size={16} />}
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {t('form.catalog')}
                </h3>
              </div>
              {catalogLoading ? (
                <p className="mt-3 text-xs text-gray-500">{t('form.catalogSearching')}</p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {catalogMatches.map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => applyCatalogMatch(match)}
                      className="flex items-center gap-3 rounded-xl border border-[#333] bg-[#121212] p-3 text-left transition hover:border-blue-500"
                    >
                      <img
                        src={match.previewImage || match.images?.[0] || match.characterImage}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover bg-[#222]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-white">
                          {match.fullDisplayName || match.name}
                        </span>
                        <span className="block truncate text-[10px] uppercase tracking-wider text-gray-500">
                          {[match.anime, match.brand, match.category].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
          <SpecsSection
            formData={formData}
            handleCustomChange={handleCustomChange}
            conditionOptions={conditionOptions}
            shopOptions={shopOptions}
          />
        </div>

        <div className="mt-10 pt-8 border-t border-[#333]/50 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic ml-1 block">
            {t('form.fullName')}
          </label>
          <div className="relative">
            <FileText
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              name="fullDisplayName"
              autoComplete="off"
              placeholder="example: My Hero Academia: You're next Trio-Try-iT Figure - Katsuki Bakugo"
              className={inputBaseClass}
              onChange={handleChange}
              value={formData.fullDisplayName || ''}
            />
          </div>
        </div>

        <PhotoUploadSection
          isDraggingOver={isDraggingOver}
          setIsDraggingOver={setIsDraggingOver}
          handleFiles={handleFiles}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          mediaItems={mediaItems}
          previewId={previewId}
          setPreviewId={setPreviewId}
          removeItem={removeItem}
        />

        <fieldset className="space-y-3 pt-8 border-t border-[#333]/50">
          <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-3">
            {t('form.visibility')}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              {
                value: 'private' as const,
                label: t('form.private'),
                description: t('form.privateDescription'),
                icon: LockKeyhole,
              },
              {
                value: 'public' as const,
                label: t('form.public'),
                description: t('form.publicDescription'),
                icon: Globe2,
              },
            ]).map((option) => {
              const Icon = option.icon;
              const selected = formData.visibility === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#333] bg-[#121212] hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={selected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Icon size={20} className={selected ? 'text-blue-500' : 'text-gray-600'} />
                  <span>
                    <span className="block text-sm font-black uppercase italic text-white">
                      {option.label}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-6 pt-8 border-t border-[#333]/50 text-left">
          <div className="relative">
            <LinkIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              name="auctionUrl"
              autoComplete="off"
              placeholder={t('form.listingUrl')}
              className={inputBaseClass}
              onChange={handleChange}
              value={formData.auctionUrl || ''}
            />
          </div>
          <div className="relative">
            <Zap className="absolute left-4 top-5 text-gray-600" size={18} />
            <textarea
              name="conditionNotes"
              placeholder={t('form.notes')}
              className={`${inputBaseClass} h-32 resize-none pt-4 leading-relaxed`}
              onChange={handleChange}
              value={formData.conditionNotes || ''}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 sm:py-6 rounded-xl sm:rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-lg sm:text-xl tracking-widest transition-all shadow-xl active:scale-95 uppercase italic flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isEdit ? (
            t('form.save')
          ) : (
            t('form.add')
          )}
        </button>
      </form>
    </div>
  );
};

export default FigureForm;
