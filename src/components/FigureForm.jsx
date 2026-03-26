import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Loader2, Link as LinkIcon, Edit3, Zap, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import SuccessModal from './SuccessModal';
import SpecsSection from './SpecsSection';
import BasicInfoSection from './BasicInfoSection';
import PhotoUploadSection from './PhotoUploadSection';
import ImageCropper from './ImageCropper';

import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import imageCompression from 'browser-image-compression';

import 'react-datepicker/dist/react-datepicker.css';

const FigureForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [epicSuccess, setEpicSuccess] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [mediaItems, setMediaItems] = useState([]);
  const [previewId, setPreviewId] = useState(null);
  const [cropTarget, setCropTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    fullDisplayName: '',
    anime: '',
    brand: '',
    price: '',
    gender: 'Male',
    auctionUrl: '',
    purchaseDate: '',
    conditionGrade: 'New (Sealed)',
    conditionNotes: '',
    hasBox: 'Yes',
    purchasePlace: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const EXCHANGE_RATES = { USD: 1, KZT: 0.0022, CNY: 0.14 };

  const brandOptions = [
    { value: 'Bandai Spirits', label: 'Bandai Spirits' },
    { value: 'BANDAI', label: 'BANDAI' },
    { value: 'Bandai Masterlise', label: 'Bandai Masterlise' },
    { value: 'MegaHouse', label: 'MegaHouse' },
    { value: 'Sega', label: 'Sega' },
    { value: 'Taito', label: 'Taito' },
    { value: 'FuRyu', label: 'FuRyu' },
    { value: 'Good Smile Company', label: 'Good Smile Co.' },
    { value: 'Kotobukiya', label: 'Kotobukiya' },
    { value: 'Inart', label: 'Inart' },
    { value: 'Alter', label: 'Alter' },
    { value: 'Banpresto', label: 'Banpresto' },
    { value: 'Ichiban Kuji', label: 'Ichiban Kuji' },
    { value: 'Other', label: 'Other / Original' },
  ];

  const conditionOptions = [
    { value: 'New (Sealed)', label: 'New (Sealed)' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Minor Damage', label: 'Minor Damage' },
    { value: 'Missing Parts', label: 'Missing Parts' },
    { value: 'Poor', label: 'Poor Condition' },
  ];

  const shopOptions = [
    { value: 'Jalan Jalan Japan', label: 'Jalan Jalan Japan' },
    { value: 'TaoBao', label: 'TaoBao' },
    { value: 'OLX', label: 'OLX' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    if (isEdit && id) {
      const fetchFigure = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'figures', id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(data);
            const images = data.images || [];
            const items = images.map((url) => ({ id: url, url, type: 'existing' }));
            setMediaItems(items);
            setPreviewId(data.previewImage || (items.length > 0 ? items[0].id : null));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setFetching(false);
        }
      };
      fetchFigure();
    }
  }, [id, isEdit]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCustomChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleFiles = async (newFiles) => {
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
      const compressedItems = await Promise.all(
        validFiles.map(async (file) => {
          let finalFile = file;
          if (file.size > 200 * 1024) finalFile = await imageCompression(file, compressionOptions);
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(finalFile),
            file: finalFile,
            type: 'new',
          };
        }),
      );
      setMediaItems((prev) => {
        const combined = [...prev, ...compressedItems].slice(0, 5);
        if (!previewId && combined.length > 0) setPreviewId(combined[0].id);
        return combined;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCropperForItem = (id) => {
    const item = mediaItems.find((i) => i.id === id);
    if (!item) return;
    setCropTarget({ id: item.id, url: item.url, name: item.file?.name || 'edit.webp' });
  };

  const onCropFinal = async (croppedBlob) => {
    const targetId = cropTarget.id;
    const targetName = cropTarget.name;
    const oldUrl = cropTarget.url;
    setCropTarget(null);
    setLoading(true);

    try {
      const croppedFile = new File([croppedBlob], targetName, { type: 'image/webp' });
      const finalFile = await imageCompression(croppedFile, {
        maxSizeMB: 0.8,
        fileType: 'image/webp',
      });
      const finalUrl = URL.createObjectURL(finalFile);

      if (oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);

      setMediaItems((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, url: finalUrl, file: finalFile, type: 'new' } : item,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (previewId === id && filtered.length > 0) setPreviewId(filtered[0].id);
      return filtered;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mediaItems.length === 0) return alert('Please upload photo');
    setLoading(true);
    try {
      const finalUrls = [];
      for (const item of mediaItems) {
        if (item.type === 'existing') {
          finalUrls.push(item.url);
        } else {
          const fileRef = ref(storage, `figures/${Date.now()}_${item.id}.webp`);
          await uploadBytes(fileRef, item.file, { contentType: 'image/webp' });
          const url = await getDownloadURL(fileRef);
          finalUrls.push(url);
        }
      }
      const previewIndex = mediaItems.findIndex((i) => i.id === previewId);
      const previewUrl = finalUrls[previewIndex !== -1 ? previewIndex : 0];
      const priceInUSD = parseFloat((Number(formData.price) * EXCHANGE_RATES[currency]).toFixed(2));
      const finalData = {
        ...formData,
        userId: auth.currentUser.uid,
        images: finalUrls,
        previewImage: previewUrl,
        price: priceInUSD,
        updatedAt: new Date(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'figures', id), finalData);
      } else {
        await addDoc(collection(db, 'figures'), {
          ...finalData,
          createdAt: new Date(),
          authorName: (auth.currentUser?.displayName || auth.currentUser?.email || 'Anon').split(
            '@',
          )[0],
          authorId: auth.currentUser.uid,
        });
      }
      setEpicSuccess({ name: formData.name, img: previewUrl });
      setTimeout(() => navigate('/collection'), 3000);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass =
    'w-full bg-[#121212] !bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl font-bold text-white text-sm outline-none transition-all focus:border-blue-500 placeholder:text-gray-700 autofill:shadow-[0_0_0_30px_#121212_inset] autofill:text-fill-white';

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        {' '}
        <Loader2 className="animate-spin text-blue-500" size={40} />{' '}
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:p-6 text-[#e4e4e4] relative text-left font-sans tracking-tight">
      <style>{`
        input, select, textarea { font-family: inherit !important; background-color: #121212 !important; }
        .react-datepicker-wrapper { width: 100% !important; }
        .react-datepicker__input-container input { 
           width: 100% !important; height: 54px !important; background-color: #121212 !important; 
           color: white !important; border: 1px solid #333 !important; padding-left: 3rem !important;
           border-radius: 0.75rem !important; font-weight: 700 !important;
        }
        .react-datepicker { background-color: #1a1a1a !important; border: 1px solid #333 !important; color: white !important; }
        .react-datepicker__header { background-color: #121212 !important; border-bottom: 1px solid #333 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: white !important; }
        .react-datepicker__day--selected { background-color: #2563eb !important; }
      `}</style>

      {cropTarget && (
        <ImageCropper
          image={cropTarget.url}
          onCropComplete={onCropFinal}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-6" size={60} />
          <h3 className="text-xl font-black uppercase italic tracking-[0.2em] text-white animate-pulse">
            Processing...
          </h3>
        </div>
      )}

      <SuccessModal data={epicSuccess} />

      <div className="mb-10 text-left">
        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-4 uppercase italic text-white leading-none">
          {isEdit ? (
            <Edit3 className="text-blue-500" size={28} />
          ) : (
            <PlusCircle className="text-blue-500" size={28} />
          )}
          {isEdit ? 'Edit Details' : 'Add Figure'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-[#333] space-y-12 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          <BasicInfoSection
            formData={formData}
            handleCustomChange={handleCustomChange}
            brandOptions={brandOptions}
            currency={currency}
            setCurrency={setCurrency}
            handleChange={handleChange}
          />
          <SpecsSection
            formData={formData}
            handleCustomChange={handleCustomChange}
            conditionOptions={conditionOptions}
            shopOptions={shopOptions}
          />
        </div>

        <div className="mt-12 pt-10 border-t border-[#333]/50 space-y-4 text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic block">
            Full Figure Name
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

        <div className="pt-2">
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
            onCropItem={openCropperForItem}
          />
        </div>

        <div className="space-y-6 pt-10 border-t border-[#333]/50">
          <div className="relative">
            <LinkIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              name="auctionUrl"
              autoComplete="off"
              placeholder="Listing URL"
              className={inputBaseClass}
              onChange={handleChange}
              value={formData.auctionUrl || ''}
            />
          </div>
          <div className="relative">
            <Zap className="absolute left-4 top-5 text-gray-600" size={18} />
            <textarea
              name="conditionNotes"
              placeholder="Condition notes..."
              className={`${inputBaseClass} h-32 resize-none pt-4 pl-12`}
              onChange={handleChange}
              value={formData.conditionNotes || ''}
            ></textarea>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl tracking-widest uppercase italic transition-all active:scale-95 shadow-xl shadow-blue-600/20"
        >
          {isEdit ? 'Save Changes' : 'Add to Collection'}
        </button>
      </form>
    </div>
  );
};

export default FigureForm;
