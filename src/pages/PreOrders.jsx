import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Loader2, X, Clock, Camera, Calendar, ChevronDown } from 'lucide-react';
import AnimeSearch from '../components/AnimeSearch';
import PreOrderCard from '../components/PreOrderCard';

const PreOrders = () => {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Состояния для работы со скриншотами и лайтбоксом
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // Теперь используется ниже!

  // Валюта ввода в форме
  const [formCurrency, setFormCurrency] = useState('USD');

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    totalPrice: '',
    deposit: '',
    releaseDate: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const q = query(collection(db, 'preorders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPreorders(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      anime: '',
      brand: '',
      totalPrice: '',
      deposit: '',
      releaseDate: '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFormCurrency('USD');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Получаем курсы для конвертации (KZT из стораджа, CNY фиксирован)
      const cached = JSON.parse(localStorage.getItem('kzt_rate_data')) || { rate: 450 };
      const kztRate = cached.rate;
      const cnyRate = 7.2;

      let finalPrice = Number(formData.totalPrice);
      let finalDeposit = Number(formData.deposit);

      // 2. Пересчитываем в USD перед сохранением
      if (formCurrency === 'KZT') {
        finalPrice = finalPrice / kztRate;
        finalDeposit = finalDeposit / kztRate;
      } else if (formCurrency === 'CNY') {
        finalPrice = finalPrice / cnyRate;
        finalDeposit = finalDeposit / cnyRate;
      }

      // 3. Скриншот
      let screenshotUrl = '';
      if (screenshotFile) {
        const fileRef = ref(storage, `preorders/${Date.now()}_${screenshotFile.name}`);
        await uploadBytes(fileRef, screenshotFile);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      const currentUser = auth.currentUser;
      const cleanName = currentUser?.email?.split('@')[0] || 'Anonymous';

      // 4. Сохранение (всегда в USD)
      await addDoc(collection(db, 'preorders'), {
        ...formData,
        totalPrice: Number(finalPrice.toFixed(2)),
        deposit: Number(finalDeposit.toFixed(2)),
        screenshot: screenshotUrl,
        createdAt: new Date(),
        authorName: cleanName,
      });

      setShowForm(false);
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить этот предзаказ?')) {
      await deleteDoc(doc(db, 'preorders', id));
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
      <div className="max-w-7xl mx-auto">
        {/* Хедер страницы */}
        <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6 text-left">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={30} />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Pre-Orders
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl"
          >
            <Plus size={20} /> Add New
          </button>
        </div>

        {/* Сетка предзаказов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {preorders.map((item) => (
            <PreOrderCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onImageClick={setSelectedImage} // Клик открывает лайтбокс
            />
          ))}
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[3rem] p-10 relative my-auto animate-in zoom-in duration-300 shadow-2xl text-left">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-50"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black mb-8 uppercase italic tracking-tighter text-white">
                New Pre-Order
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  placeholder="Figure Name *"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <AnimeSearch
                  value={formData.anime}
                  onChange={(val) => setFormData({ ...formData, anime: val })}
                />

                <input
                  placeholder="Brand / Manufacturer"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />

                {/* Селектор валют */}
                <div className="space-y-2">
                  <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest px-1">
                    Currency for Input
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold appearance-none cursor-pointer"
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KZT">KZT (₸)</option>
                      <option value="CNY">CNY (¥)</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest px-1">
                      Total Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest px-1">
                      Deposit Paid
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest px-1">
                    Payment / Last Contact Date *
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-4 text-gray-600" size={18} />
                    <input
                      type="date"
                      className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <input
                  placeholder="Est. Release (e.g. Q4 2026)"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />

                {/* Загрузка скриншота */}
                <div className="space-y-3">
                  <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest px-1 block italic">
                    Confirmation Screenshot
                  </label>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 hover:border-orange-500/50 transition-all group overflow-hidden relative">
                    {screenshotPreview ? (
                      <img
                        src={screenshotPreview}
                        className="w-full h-full object-cover opacity-60"
                        alt="preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera
                          className="text-gray-500 group-hover:text-orange-500 mb-2 transition-colors"
                          size={24}
                        />
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                          Upload Screenshot
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                <button
                  disabled={submitting}
                  className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg hover:bg-orange-500 text-white transition-all shadow-xl uppercase italic tracking-tighter"
                >
                  {submitting ? 'SAVING...' : 'ADD TO PRE-ORDERS'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- LIGHTBOX (Тут мы читаем selectedImage, ошибки пропадут) --- */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
              <X size={40} strokeWidth={1} />
            </button>
            <img
              src={selectedImage}
              alt="Full Size Screenshot"
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10 object-contain animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrders;
