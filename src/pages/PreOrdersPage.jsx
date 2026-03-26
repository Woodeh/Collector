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
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Loader2, X, Clock, Camera, Calendar, ChevronDown } from 'lucide-react';
import AnimeSearch from '../components/AnimeSearch';
import PreOrderCard from '../components/PreOrderCard';

const PreOrders = () => {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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
    let unsubscribeSnap = null;

    // СТРАТЕГИЯ: Слушаем auth постоянно.
    // При F5 он сначала null, потом становится User.
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth initialized for:', user.uid);

        const q = query(
          collection(db, 'preorders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );

        // Отписываемся от старого snapshot, если он был (защита от дублей)
        if (unsubscribeSnap) unsubscribeSnap();

        unsubscribeSnap = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPreorders(items);
            setLoading(false); // Данные получены, выключаем экран загрузки
          },
          (error) => {
            console.error('Firestore Error:', error);
            setLoading(false);
          },
        );
      } else {
        // Если юзер реально не залогинен
        setPreorders([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) unsubscribeSnap();
    };
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
    const currentUser = auth.currentUser;
    if (!currentUser) return alert('Session expired. Please login again.');

    setSubmitting(true);
    try {
      const cached = JSON.parse(localStorage.getItem('kzt_rate_data')) || { rate: 450 };
      const kztRate = cached.rate;
      const cnyRate = 7.2;

      let finalPrice = Number(formData.totalPrice);
      let finalDeposit = Number(formData.deposit);

      if (formCurrency === 'KZT') {
        finalPrice /= kztRate;
        finalDeposit /= kztRate;
      } else if (formCurrency === 'CNY') {
        finalPrice /= cnyRate;
        finalDeposit /= cnyRate;
      }

      let screenshotUrl = '';
      if (screenshotFile) {
        const fileRef = ref(storage, `preorders/${Date.now()}_${screenshotFile.name}`);
        await uploadBytes(fileRef, screenshotFile);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'preorders'), {
        ...formData,
        userId: currentUser.uid,
        totalPrice: Number(finalPrice.toFixed(2)),
        deposit: Number(finalDeposit.toFixed(2)),
        screenshot: screenshotUrl,
        createdAt: new Date(),
        authorName: currentUser.displayName || currentUser.email.split('@')[0],
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
    if (window.confirm('Delete this pre-order?')) {
      await deleteDoc(doc(db, 'preorders', id));
    }
  };

  // ЭКРАН ЗАГРУЗКИ (Критически важен при F5)
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#121212] gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Syncing with server...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
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

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {preorders.length > 0 ? (
            preorders.map((item) => (
              <PreOrderCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onImageClick={setSelectedImage}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-20 italic uppercase font-black tracking-widest">
              No active pre-orders found
            </div>
          )}
        </div>

        {/* FORM MODAL */}
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
                <select
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold appearance-none cursor-pointer"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="KZT">KZT (₸)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Total Price"
                    className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Deposit Paid"
                    className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    required
                  />
                </div>
                <input
                  type="date"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
                <input
                  placeholder="Est. Release"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                  {screenshotPreview ? (
                    <img
                      src={screenshotPreview}
                      className="w-full h-full object-cover rounded-xl opacity-60"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="text-gray-500" size={24} />
                      <span className="text-[10px] text-gray-500 font-black uppercase">
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
                <button
                  disabled={submitting}
                  className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg hover:bg-orange-500 text-white transition-all shadow-xl uppercase italic tracking-widest"
                >
                  {submitting ? 'SAVING...' : 'ADD TO PRE-ORDERS'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Full Size"
              className="max-w-full max-h-full rounded-2xl object-contain animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrders;
