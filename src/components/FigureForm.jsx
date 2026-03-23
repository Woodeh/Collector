import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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
  ShoppingCart,
  Info,
  ShieldCheck,
  Tag,
  Edit3,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomSelect from '../components/Select';
import AnimeSearch from '../components/AnimeSearch';

const FigureForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    price: '',
    gender: 'Male',
    auctionUrl: '',
    purchaseDate: '',
    conditionGrade: 'New',
    conditionNotes: '',
    hasBox: 'Yes',
    purchasePlace: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchFigure = async () => {
        try {
          const docRef = doc(db, 'figures', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(data);
            setExistingImages(data.images || []);
            const pIdx = data.images?.indexOf(data.previewImage);
            setPreviewIdx(pIdx !== -1 ? pIdx : 0);
          }
        } catch (error) {
          console.error('Error fetching figure:', error);
        } finally {
          setFetching(false);
        }
      };
      fetchFigure();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + existingImages.length + selectedFiles.length > 5)
      return alert('Maximum 5 photos allowed');
    setFiles([...files, ...selectedFiles]);
  };

  const removeNewFile = (index) => setFiles(files.filter((_, i) => i !== index));
  const removeExistingFile = (index) =>
    setExistingImages(existingImages.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 && existingImages.length === 0)
      return alert('Please upload at least one photo');

    setLoading(true);
    try {
      const newImageUrls = [];
      for (const file of files) {
        const fileRef = ref(storage, `figures/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        newImageUrls.push(url);
      }

      const allImages = [...existingImages, ...newImageUrls];
      const currentUser = auth.currentUser;
      const cleanName = (currentUser?.displayName || currentUser?.email || 'Anonymous').split(
        '@',
      )[0];

      const finalData = {
        ...formData,
        images: allImages,
        previewImage: allImages[previewIdx] || allImages[0],
        price: Number(formData.price) || 0,
        updatedAt: new Date(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'figures', id), finalData);
      } else {
        await addDoc(collection(db, 'figures'), {
          ...finalData,
          createdAt: new Date(),
          authorName: cleanName,
          authorId: currentUser?.uid || 'unknown',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/collection');
      }, 2000);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 text-[#e4e4e4] relative text-left">
      {success && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#1a1a1a] border border-green-500/50 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-300">
            <div className="bg-green-500 p-4 rounded-full">
              <Check size={40} className="text-[#121212] stroke-[4px]" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {isEdit ? 'Updated!' : 'Saved!'}
            </h3>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
        {isEdit ? <Edit3 className="text-blue-500" /> : <PlusCircle className="text-blue-500" />}
        {isEdit ? 'Edit Details' : 'Add Figure'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-[#333] space-y-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 italic">
              <Info size={14} /> Basic Information
            </h3>
            <input
              name="name"
              placeholder="Name *"
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 text-white"
              onChange={handleChange}
              value={formData.name}
              required
            />
            <div className="relative z-[60]">
              <AnimeSearch
                value={formData.anime}
                onChange={(val) => handleCustomChange('anime', val)}
              />
            </div>
            <div className="relative">
              <Tag className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                name="brand"
                placeholder="Manufacturer / Brand"
                className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl outline-none focus:border-blue-500 text-white"
                onChange={handleChange}
                value={formData.brand}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="price"
                type="number"
                placeholder="Price ($) *"
                className="bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 text-white"
                onChange={handleChange}
                value={formData.price}
                required
              />
              <CustomSelect
                options={[
                  { value: 'Male', label: 'Male ♂' },
                  { value: 'Female', label: 'Female ♀' },
                ]}
                value={formData.gender}
                onChange={(val) => handleCustomChange('gender', val)}
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 italic">
              <PlusCircle size={14} /> Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="purchaseDate"
                type="date"
                className="bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 text-white"
                onChange={handleChange}
                value={formData.purchaseDate}
              />
              <CustomSelect
                options={[
                  { value: 'Yes', label: 'Box: Original' },
                  { value: 'No', label: 'Box: No Box' },
                ]}
                value={formData.hasBox}
                onChange={(val) => handleCustomChange('hasBox', val)}
              />
            </div>
            <CustomSelect
              icon={ShieldCheck}
              options={[
                { value: 'New', label: 'New (Sealed)' },
                { value: 'Like New', label: 'Like New' },
                { value: 'Good', label: 'Good' },
                { value: 'Damaged', label: 'Damaged' },
              ]}
              value={formData.conditionGrade}
              onChange={(val) => handleCustomChange('conditionGrade', val)}
            />
            <div className="relative group">
              <ShoppingCart className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                name="purchasePlace"
                placeholder="Shop Name"
                className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl outline-none focus:border-blue-500 text-white"
                onChange={handleChange}
                value={formData.purchasePlace}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <LinkIcon className="absolute left-4 top-4 text-gray-600" size={18} />
            <input
              name="auctionUrl"
              placeholder="Listing / Store URL"
              className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl outline-none focus:border-blue-500 text-white"
              onChange={handleChange}
              value={formData.auctionUrl}
            />
          </div>
          <textarea
            name="conditionNotes"
            placeholder="Notes..."
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 h-20 resize-none"
            onChange={handleChange}
            value={formData.conditionNotes}
          ></textarea>
        </div>

        {/* PHOTOS SECTION */}
        <div className="space-y-5">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-[2rem] cursor-pointer hover:bg-[#1f1f1f] transition-all group">
            <Upload className="text-gray-600 mb-2 group-hover:text-blue-500" size={28} />
            <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">
              Photos (Max 5)
            </span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>

          <div className="grid grid-cols-5 gap-4">
            {existingImages.map((url, idx) => (
              <div
                key={`old-${idx}`}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 ${
                  previewIdx === idx ? 'border-blue-500' : 'border-[#333]'
                }`}
              >
                <img src={url} className="w-full h-full object-cover" alt="figure" />
                <button
                  type="button"
                  onClick={() => setPreviewIdx(idx)}
                  className="absolute top-2 left-2 bg-black/70 p-1.5 rounded-lg"
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
                  onClick={() => removeExistingFile(idx)}
                  className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-lg text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.map((file, idx) => (
              <div
                key={`new-${idx}`}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-blue-500/50 opacity-60"
              >
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  alt="new"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(idx)}
                  className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-lg text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-5 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 uppercase"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Add Figure'
          )}
        </button>
      </form>
    </div>
  );
};

export default FigureForm;
