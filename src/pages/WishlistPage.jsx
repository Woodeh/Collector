import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import { WishlistCard, WishlistForm } from '../components/wishlist';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // Добавили 'image' в formData для хранения URL ссылки
  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    price: '',
    link: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
        );
        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
        return () => unsubscribeSnap();
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Очищаем текстовое поле ссылки, если выбрали файл, чтобы не было путаницы
      setFormData((prev) => ({ ...prev, image: '' }));
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: '', anime: '', brand: '', price: '', link: '', image: '' });
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
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
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'wishlist', editingId), data);
      } else {
        await addDoc(collection(db, 'wishlist'), {
          ...data,
          userId: user.uid,
          createdAt: new Date(),
        });
      }
      setShowForm(false);
      setImageFile(null);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this grail?')) {
      await deleteDoc(doc(db, 'wishlist', id));
    }
  };

  const handleGotIt = (item) => {
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-10 text-[#e4e4e4] font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto text-left">
        <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={24} />
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                Wishlist
              </h2>
            </div>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-pink-500 text-xs font-black border border-[#333]">
              {items.length}
            </span>
          </div>
          <button
            onClick={openAddForm}
            className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <Plus size={16} /> <span>Add Target</span>
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
          <div className="py-20 text-center opacity-10">
            <Heart size={60} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-sm">Wishlist Empty</p>
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
        />
      </div>
    </div>
  );
};

export default WishlistPage;
