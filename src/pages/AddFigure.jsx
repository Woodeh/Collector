import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';
import AnimeSearch from '../components/AnimeSearch';
import CustomSelect from '../components/Select';

const AddFigure = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEpicSuccess, setShowEpicSuccess] = useState(null); // Стейт для НОВОЙ анимации

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
    if (files.length === 0) return alert('Загрузи фото!');
    setLoading(true);

    try {
      const file = files[0];
      const fileRef = ref(storage, `figures/${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'figures'), {
        ...formData,
        previewImage: url,
        createdAt: new Date(),
      });

      // ВКЛЮЧАЕМ НОВУЮ АНИМАЦИЮ
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

  return (
    <div className="max-w-4xl mx-auto p-6 text-white relative">
      {/* НОВАЯ АНИМАЦИЯ (ПРЯМО ЗДЕСЬ) */}
      {showEpicSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-2xl">
          <div className="relative p-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-[3rem] animate-in zoom-in duration-500">
            <div className="bg-[#121212] p-8 rounded-[2.9rem] text-center max-w-xs">
              <CheckCircle2 size={50} className="text-green-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-black uppercase italic mb-6">Confirmed!</h2>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 mb-4 shadow-2xl">
                <img src={showEpicSuccess.img} className="w-full h-full object-cover" />
              </div>
              <p className="font-black text-blue-400 uppercase truncate">{showEpicSuccess.name}</p>
            </div>
            <Sparkles
              className="absolute -top-4 -right-4 text-yellow-400 animate-pulse"
              size={40}
            />
          </div>
        </div>
      )}

      <h2 className="text-3xl font-black mb-8 flex items-center gap-3 uppercase italic">
        <PlusCircle className="text-blue-500" /> Add to Collection
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-[#333] space-y-8"
      >
        <input
          placeholder="Name"
          className="w-full bg-black p-4 rounded-xl border border-[#333]"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <PhotoUpload
          files={files}
          onFileChange={(e) => setFiles([...Array.from(e.target.files)])}
          onRemove={() => setFiles([])}
          previewIdx={0}
          setPreviewIdx={() => {}}
        />
        <button className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xl">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SAVE FIGURE'}
        </button>
      </form>
    </div>
  );
};

export default AddFigure;
