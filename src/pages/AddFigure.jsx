import React, { useState } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  PlusCircle,
  Upload,
  Loader2,
  Check,
  Star,
  X,
  Link as LinkIcon,
  Calendar,
  Box,
  ShoppingCart,
  Info,
  ShieldCheck,
} from 'lucide-react';
import CustomSelect from '../components/Select';

const AddFigure = () => {
  const [files, setFiles] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    price: '',
    gender: 'Male',
    auctionUrl: '',
    purchaseDate: '',
    conditionGrade: 'New',
    conditionNotes: '',
    hasBox: 'Yes',
    purchasePlace: '',
  });

  const genderOptions = [
    { value: 'Male', label: 'Мужской ♂' },
    { value: 'Female', label: 'Женский ♀' },
  ];

  const boxOptions = [
    { value: 'Yes', label: 'Коробка: Есть' },
    { value: 'No', label: 'Коробка: Нет' },
  ];

  const conditionOptions = [
    { value: 'New', label: 'Новая (Sealed)' },
    { value: 'Like New', label: 'Как новая' },
    { value: 'Good', label: 'Хорошее (Б/У)' },
    { value: 'Minor Damage', label: 'Мелкие дефекты' },
    { value: 'Damaged', label: 'Повреждена' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) return alert('Максимум 5 фото');
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (previewIdx === index) setPreviewIdx(0);
    else if (previewIdx > index) setPreviewIdx(previewIdx - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert('Загрузите хотя бы одно фото');

    setLoading(true);
    try {
      const imageUrls = [];
      for (const file of files) {
        const fileRef = ref(storage, `figures/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        imageUrls.push(url);
      }

      const currentUser = auth.currentUser;
      const rawName = currentUser?.displayName || currentUser?.email || 'Аноним';
      const cleanName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

      await addDoc(collection(db, 'figures'), {
        ...formData,
        images: imageUrls,
        previewImage: imageUrls[previewIdx],
        price: Number(formData.price) || 0,
        createdAt: new Date(),
        authorName: cleanName,
        authorId: currentUser?.uid || 'unknown',
      });

      setSuccess(true);
      setFiles([]);
      setFormData({
        name: '',
        anime: '',
        price: '',
        gender: 'Male',
        auctionUrl: '',
        purchaseDate: '',
        conditionGrade: 'New',
        conditionNotes: '',
        hasBox: 'Yes',
        purchasePlace: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-[#e4e4e4] relative">
      {success && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#1a1a1a] border border-green-500/50 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6 animate-in zoom-in duration-300">
            <div className="bg-green-500 p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <Check size={40} className="text-[#121212] stroke-[4px]" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                Готово!
              </h3>
              <p className="text-green-400 font-bold text-sm uppercase tracking-[0.2em] mt-2">
                Фигурка добавлена!
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
        <PlusCircle className="text-blue-500" /> Добавить в коллекцию
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-[#333] space-y-8 shadow-2xl relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
              <Info size={14} /> Основная информация
            </h3>
            <input
              name="name"
              placeholder="Название фигурки *"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
              onChange={handleChange}
              value={formData.name}
              required
            />
            <input
              name="anime"
              placeholder="Аниме / Источник *"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
              onChange={handleChange}
              value={formData.anime}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="price"
                type="number"
                placeholder="Цена ($) *"
                className="bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
                onChange={handleChange}
                value={formData.price}
                required
              />
              <CustomSelect
                options={genderOptions}
                value={formData.gender}
                onChange={(val) => handleCustomChange('gender', val)}
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
              <PlusCircle size={14} /> Детали приобретения
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-4 text-gray-600 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  name="purchaseDate"
                  type="date"
                  className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 text-gray-400 font-mono"
                  onChange={handleChange}
                  value={formData.purchaseDate}
                />
              </div>
              <CustomSelect
                options={boxOptions}
                value={formData.hasBox}
                onChange={(val) => handleCustomChange('hasBox', val)}
              />
            </div>

            <CustomSelect
              icon={ShieldCheck}
              options={conditionOptions}
              value={formData.conditionGrade}
              onChange={(val) => handleCustomChange('conditionGrade', val)}
            />

            <input
              name="purchasePlace"
              placeholder="Место приобретения"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-2xl outline-none focus:border-blue-500 transition-colors"
              onChange={handleChange}
              value={formData.purchasePlace}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <LinkIcon
              className="absolute left-4 top-4 text-gray-600 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              name="auctionUrl"
              placeholder="Ссылка на аукцион"
              className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-colors"
              onChange={handleChange}
              value={formData.auctionUrl}
            />
          </div>
          <textarea
            name="conditionNotes"
            placeholder="Дополнительные заметки о состоянии..."
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-2xl outline-none focus:border-blue-500 h-24 resize-none transition-colors"
            onChange={handleChange}
            value={formData.conditionNotes}
          ></textarea>
        </div>

        <div className="space-y-5">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#333] rounded-[2rem] cursor-pointer hover:bg-[#1f1f1f] hover:border-blue-500/50 transition-all group">
            <Upload
              className="text-gray-600 mb-3 group-hover:text-blue-500 group-hover:-translate-y-1 transition-all"
              size={32}
            />
            <span className="text-gray-500 font-medium">Загрузите фото (макс. 5) *</span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
                    previewIdx === idx
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                      : 'border-[#333]'
                  }`}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewIdx(idx)}
                    className="absolute top-2 left-2 bg-black/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10"
                  >
                    <Star
                      size={14}
                      className={
                        previewIdx === idx ? 'text-yellow-400 fill-yellow-400' : 'text-white'
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-lg text-white hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className={`w-full py-5 rounded-[1.5rem] font-black text-xl tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
            loading
              ? 'bg-blue-900/50 text-blue-300'
              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>СОХРАНЕНИЕ...</span>
            </>
          ) : (
            'СОХРАНИТЬ ФИГУРКУ'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFigure;
