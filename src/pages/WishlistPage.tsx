import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useI18n } from '../app/i18n/I18nProvider';

import WishlistCard from '../entities/wishlist/WishlistCard';
import WishlistForm from '../entities/wishlist/WishlistForm';
import type { WishlistFormData, WishlistItem } from '../entities/wishlist/model';
import {
  createWishlistItem,
  deleteWishlistItem,
  subscribeToWishlist,
  updateWishlistItem,
} from '../entities/wishlist/wishlistRepository';
import PageState from '../shared/PageState';
import { useFeedback } from '../app/providers/feedbackContext';
import { revokeObjectUrl, validateImageFile } from '../shared/lib/imageFiles';

const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { user } = useAuth();
  const { t } = useI18n();
  const { notify, confirm } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<WishlistFormData>({ name: '', anime: '', brand: '', price: '', link: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const unsubscribeSnap = subscribeToWishlist(
      user.uid,
      (snapshot) => {
        setItems(snapshot);
        setLoading(false);
      },
      (error) => {
        console.error('Wishlist subscription failed:', error);
        setLoadError(true);
        setLoading(false);
      },
    );
    return unsubscribeSnap;
  }, [user]);

  useEffect(() => () => revokeObjectUrl(imagePreview), [imagePreview]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) { notify(t(`image.${validationError}`), 'error'); e.target.value = ''; return; }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Очищаем текстовое поле ссылки, если выбрали файл, чтобы не было путаницы
      setFormData((prev) => ({ ...prev, image: '' }));
    }
  };

  const openAddForm = () => {
    setFormErrors({});
    setEditingId(null);
    setFormData({ name: '', anime: '', brand: '', price: '', link: '', image: '' });
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (item: WishlistItem) => {
    setFormErrors({});
    setEditingId(item.id);
    setFormData({
      name: item.name,
      anime: item.anime,
      brand: item.brand,
      price: item.price,
      link: item.link || '',
      image: item.image || '', // Ссылка на фото подтянется сюда
    });
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t('validation.required');
    if (formData.price !== '' && Number(formData.price) < 0) errors.price = t('validation.price');
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);

    try {
      // По умолчанию берем то, что в поле ссылки (image) или старое превью
      let finalImageUrl = formData.image || imagePreview;

      // Если же юзер выбрал локальный файл, загружаем его в Storage
      if (imageFile) {
        const storageRef = ref(storage, `wishlist/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const data = {
        name: formData.name,
        anime: formData.anime,
        brand: formData.brand,
        price: Number(formData.price),
        link: formData.link,
        image: finalImageUrl || '', // Сохраняем итоговую ссылку
      };

      if (editingId) {
        await updateWishlistItem(editingId, data);
      } else {
        await createWishlistItem(user.uid, data);
      }
      setShowForm(false);
      setImageFile(null);
      notify(t('common.saved'), 'success');
    } catch (error) {
      console.error('Submit error:', error);
      notify(t('wishlist.saveError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: t('common.delete'), message: t('wishlist.removeConfirm'), confirmLabel: t('common.delete'), danger: true });
    if (!confirmed) return;
    try {
      await deleteWishlistItem(id);
      notify(t('common.deleted'), 'success');
    } catch {
      notify(t('common.operationError'), 'error');
    }
  };

  const handleGotIt = (item: WishlistItem) => {
    navigate('/add', {
      state: {
        initialData: {
          name: item.name,
          anime: item.anime,
          brand: item.brand,
          price: item.price,
          image: item.image,
          auctionUrl: item.link || '',
        },
        fromWishlistId: item.id,
      },
    });
  };

  if (loading) return <PageState type="loading" accentClass="text-pink-500" />;
  if (loadError) return <PageState type="error" accentClass="text-pink-500" />;

  return (
    <div className="app-page text-[#e4e4e4] font-sans">
      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="app-container text-left">
        <div className="flex flex-col items-stretch justify-between gap-4 mb-6 sm:mb-8 border-b border-[#333] pb-5 sm:flex-row sm:items-center sm:pb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={24} />
              <h2 className="ui-section-title uppercase italic text-white">
                {t('wishlist.title')}
              </h2>
            </div>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-pink-500 text-xs font-black border border-[#333]">
              {items.length}
            </span>
          </div>
          <button
            onClick={openAddForm}
            className="ui-button bg-pink-600 hover:bg-pink-500 text-white px-5 sm:px-6 py-3 font-black uppercase italic text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus size={16} /> <span>{t('wishlist.add')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onEdit={openEditForm}
              onGotIt={handleGotIt}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-16 md:py-20 text-center opacity-10">
            <Heart size={60} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-sm">{t('wishlist.empty')}</p>
          </div>
        )}

        <WishlistForm
          showForm={showForm}
          setShowForm={setShowForm}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          submitting={submitting}
          isEditing={!!editingId}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          errors={formErrors}
        />
      </div>
    </div>
  );
};

export default WishlistPage;
