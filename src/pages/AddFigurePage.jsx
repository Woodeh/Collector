import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  PlusCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Zap,
  DollarSign,
  Box,
  Bookmark,
  Info,
} from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';

const AddFigurePage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEpicSuccess, setShowEpicSuccess] = useState(null);

  // Запрещаем гостям добавлять фигурки
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/');
    });
    return () => unsub();
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    price: '',
    gender: 'Male',
    purchaseDate: '',
    conditionGrade: 'New',
    hasBox: 'Yes',
    purchasePlace: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert('Upload status: Photo missing!');
    setLoading(true);

    try {
      const file = files[0];
      const fileRef = ref(storage, `figures/${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'figures'), {
        ...formData,
        userId: auth.currentUser.uid, // Добавляем ID пользователя, иначе фигурка будет "ничьей"
        authorName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        previewImage: url,
        createdAt: new Date(),
      });

      setShowEpicSuccess({ name: formData.name, img: url });

      setTimeout(() => {
        setShowEpicSuccess(null);
        navigate('/');
      }, 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Базовый класс для инпутов, чтобы соблюсти единообразие
  const inputClass =
    'w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-2xl text-white font-bold text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-700 placeholder:italic placeholder:font-normal';
  const labelClass =
    'text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-2 block ml-1';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 text-[#e4e4e4] relative font-sans selection:bg-blue-500/30">
      {/* EPIC SUCCESS OVERLAY */}
      {showEpicSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative p-[1px] bg-gradient-to-b from-blue-500 to-transparent rounded-[3.5rem]">
            <div className="bg-[#121212] p-10 rounded-[3.4rem] text-center max-w-sm border border-white/5 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <CheckCircle2 size={40} className="text-blue-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">
                System Update
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 italic">
                Asset Logged Successfully
              </p>

              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-[#333] mb-6 shadow-2xl relative group">
                <img
                  src={showEpicSuccess.img}
                  className="w-full h-full object-cover grayscale-[0.2]"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <p className="absolute bottom-4 left-0 right-0 px-4 font-black text-white uppercase italic tracking-tighter truncate">
                  {showEpicSuccess.name}
                </p>
              </div>

              <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
            </div>
            <Sparkles className="absolute -top-6 -right-6 text-blue-400 animate-bounce" size={48} />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-12 border-b border-[#333] pb-8">
        <h2 className="text-3xl md:text-5xl font-black flex items-center gap-4 uppercase italic tracking-tighter text-white">
          <PlusCircle className="text-blue-500" size={40} />
          Add <span className="text-blue-500">New</span> Asset
        </h2>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
            Security Level: Admin
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
            Database: v.2.0.26
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-[#1a1a1a] p-6 md:p-10 rounded-[2.5rem] border border-[#333] shadow-2xl space-y-8">
          {/* ФОТО ЗАГРУЗКА */}
          <div className="space-y-4">
            <label className={labelClass}>Visual ID (Required)</label>
            <PhotoUpload
              files={files}
              onFileChange={(e) => setFiles([...Array.from(e.target.files)])}
              onRemove={() => setFiles([])}
              previewIdx={0}
              setPreviewIdx={() => {}}
            />
          </div>

          {/* GRID СЕТКА ДЛЯ ИНПУТОВ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* NAME */}
            <div className="relative group">
              <label className={labelClass}>Figure Designation</label>
              <Zap
                className="absolute left-4 top-[43px] text-gray-600 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                placeholder="Ex: Monkey D. Luffy"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* ANIME */}
            <div className="relative group">
              <label className={labelClass}>Origin Series</label>
              <Bookmark
                className="absolute left-4 top-[43px] text-gray-600 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                placeholder="Ex: One Piece"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, anime: e.target.value })}
              />
            </div>

            {/* BRAND */}
            <div className="relative group">
              <label className={labelClass}>Manufacturer</label>
              <Box
                className="absolute left-4 top-[43px] text-gray-600 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                placeholder="Ex: Bandai Spirits"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            {/* PRICE */}
            <div className="relative group">
              <label className={labelClass}>Asset Value ($)</label>
              <DollarSign
                className="absolute left-4 top-[43px] text-gray-600 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="number"
                placeholder="0.00"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          {/* ТЕКСТОВАЯ ИНФОРМАЦИЯ (Full width) */}
          <div className="relative group pt-4">
            <label className={labelClass}>Acquisition Details & Notes</label>
            <Info
              className="absolute left-4 top-[60px] text-gray-600 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <textarea
              placeholder="Purchase place, condition notes, etc..."
              className={`${inputClass} h-32 resize-none pt-4`}
              onChange={(e) => setFormData({ ...formData, purchasePlace: e.target.value })}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={loading}
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-[2rem] font-black text-xl uppercase italic tracking-[0.2em] text-white shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <>
              <CheckCircle2 size={24} />
              Initialize Log
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFigurePage;
