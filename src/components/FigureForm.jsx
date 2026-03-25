import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Upload, Loader2, Link as LinkIcon, Edit3 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// ИМПОРТЫ КОМПОНЕНТОВ (Импортируем без фигурных скобок, так как там export default)
import SortablePhotoItem from './SortablePhotoItem';
import SuccessModal from './SuccessModal';
import SpecsSection from './SpecsSection';
import BasicInfoSection from './BasicInfoSection';

// DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

// Стили
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

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: 'Bandai Spirits',
    price: '',
    gender: 'Male',
    auctionUrl: '',
    purchaseDate: '',
    conditionGrade: 'New (Sealed)',
    conditionNotes: '',
    hasBox: 'Yes',
    purchasePlace: 'Jalan Jalan Japan',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const EXCHANGE_RATES = { USD: 1, KZT: 0.0022, CNY: 0.14 };

  const brandOptions = [
    { value: 'Bandai Spirits', label: 'Bandai Spirits' },
    { value: 'Sega', label: 'Sega' },
    { value: 'Taito', label: 'Taito' },
    { value: 'FuRyu', label: 'FuRyu' },
    { value: 'Good Smile Company', label: 'Good Smile Co.' },
    { value: 'Other', label: 'Other / Original' },
  ];

  const conditionOptions = [
    { value: 'New (Sealed)', label: 'New (Sealed)' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Minor Damage', label: 'Minor Damage' },
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

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    const items = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file: file,
      type: 'new',
    }));

    setMediaItems((prev) => {
      const combined = [...prev, ...items].slice(0, 5);
      if (!previewId && combined.length > 0) setPreviewId(combined[0].id);
      return combined;
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

  const removeItem = (id) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (previewId === id && filtered.length > 0) setPreviewId(filtered[0].id);
      return filtered;
    });
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
          const fileRef = ref(storage, `figures/${Date.now()}_${item.file.name}`);
          await uploadBytes(fileRef, item.file);
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

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:p-6 text-[#e4e4e4] relative text-left font-sans">
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { background-color: #1a1a1a !important; border: 1px solid #333 !important; border-radius: 1rem !important; color: white !important; }
        .react-datepicker__header { background-color: #121212 !important; border-bottom: 1px solid #333 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: white !important; }
        .react-datepicker__day--selected { background-color: #2563eb !important; }
      `}</style>

      <SuccessModal data={epicSuccess} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-4 uppercase tracking-tighter italic text-white">
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
        className="bg-[#1a1a1a] p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-[#333] space-y-6 sm:space-y-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
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

        <div className="space-y-4 pt-4 border-t border-[#333]/50">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center w-full h-28 sm:h-36 border-2 border-dashed rounded-2xl sm:rounded-[2.5rem] cursor-pointer transition-all ${
              isDraggingOver
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-[#333] hover:border-blue-500/50'
            }`}
          >
            <Upload
              className={isDraggingOver ? 'text-blue-500 scale-110' : 'text-gray-600'}
              size={24}
            />
            <span className="text-gray-500 font-black text-[9px] uppercase tracking-widest mt-2 px-4 text-center">
              Photos (Max 5)
            </span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              accept="image/*"
            />
          </label>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <SortableContext
                items={mediaItems.map((i) => i.id)}
                strategy={horizontalListSortingStrategy}
              >
                {mediaItems.map((item) => (
                  <SortablePhotoItem
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    isPreview={previewId === item.id}
                    onSetPreview={() => setPreviewId(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#333]/50">
          <div className="relative">
            <LinkIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={16}
            />
            <input
              name="auctionUrl"
              placeholder="Listing URL"
              className="w-full bg-[#121212] border border-[#333] p-4 pl-10 rounded-xl font-bold text-white text-sm focus:border-blue-500 outline-none"
              onChange={handleChange}
              value={formData.auctionUrl}
            />
          </div>
          <textarea
            name="conditionNotes"
            placeholder="Condition notes..."
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none h-24 resize-none font-bold text-white text-sm focus:border-blue-500"
            onChange={handleChange}
            value={formData.conditionNotes}
          ></textarea>
        </div>

        <button
          disabled={loading}
          className="w-full py-5 sm:py-6 rounded-xl sm:rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-lg sm:text-xl tracking-widest transition-all shadow-xl active:scale-95 uppercase italic flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Add to Collection'
          )}
        </button>
      </form>
    </div>
  );
};

export default FigureForm;
