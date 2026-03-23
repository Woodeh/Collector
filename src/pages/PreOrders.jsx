import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Loader2, X, Clock, Camera } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    totalPrice: '',
    deposit: '',
    releaseDate: '',
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
    setFormData({ name: '', anime: '', brand: '', totalPrice: '', deposit: '', releaseDate: '' });
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        const fileRef = ref(storage, `preorders/${Date.now()}_${screenshotFile.name}`);
        await uploadBytes(fileRef, screenshotFile);
        screenshotUrl = await getDownloadURL(fileRef);
      }
      const currentUser = auth.currentUser;
      const cleanName = currentUser?.email?.split('@')[0] || 'Anonymous';
      await addDoc(collection(db, 'preorders'), {
        ...formData,
        totalPrice: Number(formData.totalPrice),
        deposit: Number(formData.deposit),
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
    if (window.confirm('Delete this pre-order?')) {
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
        <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {preorders.map((item) => (
            <PreOrderCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onImageClick={setSelectedImage}
            />
          ))}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[3rem] p-10 relative my-auto animate-in zoom-in duration-300 shadow-2xl">
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
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white"
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
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Total Price ($) *"
                    className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Deposit ($) *"
                    className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    required
                  />
                </div>
                <input
                  placeholder="Est. Release (e.g. Q4 2026)"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />

                <div className="space-y-3">
                  <label className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] px-1 block italic text-left">
                    Order Confirmation Screenshot
                  </label>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 hover:border-orange-500/50 transition-all group overflow-hidden relative">
                    {screenshotPreview ? (
                      <img
                        src={screenshotPreview}
                        className="w-full h-full object-cover object-top opacity-60"
                        alt="preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera
                          className="text-gray-500 group-hover:text-orange-500 mb-2 transition-colors"
                          size={24}
                        />
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-4 text-center">
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
                  className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg hover:bg-orange-500 transition-all shadow-xl"
                >
                  {submitting ? 'SAVING...' : 'ADD TO PRE-ORDERS'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Fullscreen Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white">
              <X size={28} />
            </button>
            <img
              src={selectedImage}
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10 object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrders;
