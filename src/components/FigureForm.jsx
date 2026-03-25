import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  PlusCircle,
  Upload,
  Loader2,
  Star,
  X,
  Link as LinkIcon,
  Calendar,
  ShoppingCart,
  Info,
  ShieldCheck,
  Tag,
  Edit3,
  Sparkles,
  CheckCircle2,
  Scan, // Добавил иконку скана
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom'; // Убрал useLocation
import CustomSelect from '../components/Select';
import AnimeSearch from '../components/AnimeSearch';
import CharacterSearch from '../components/CharacterSearch';
import Scanner from '../components/Scanner'; // Импорт твоего нового компонента сканера

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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Календарь
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Вспомогательный компонент для сортируемого фото
const SortablePhotoItem = ({ id, url, isPreview, onSetPreview, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
        isPreview ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-[#333]'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <img src={url} className="w-full h-full object-cover pointer-events-none" alt="preview" />

      {/* Область для перетаскивания (вся картинка) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onSetPreview}
        className="absolute top-2 left-2 z-20 bg-black/70 p-1.5 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Star size={14} className={isPreview ? 'text-yellow-400 fill-yellow-400' : 'text-white'} />
      </button>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="absolute top-2 right-2 z-20 bg-red-600/80 p-1.5 rounded-lg text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const FigureForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [epicSuccess, setEpicSuccess] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Состояние модалки сканера
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
    { value: 'Max Factory', label: 'Max Factory' },
    { value: 'MegaHouse', label: 'MegaHouse' },
    { value: 'Kotobukiya', label: 'Kotobukiya' },
    { value: 'Banpresto', label: 'Banpresto' },
    { value: 'Other', label: 'Other / Original' },
  ];

  const conditionOptions = [
    { value: 'New (Sealed)', label: 'New (Sealed)' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Aged', label: 'Aged (Time Wear)' },
    { value: 'Sticky', label: 'Sticky Plastic' },
    { value: 'Sun Faded', label: 'Sun Faded' },
    { value: 'Minor Damage', label: 'Minor Damage' },
    { value: 'Broken / Fixed', label: 'Broken / Fixed' },
    { value: 'Junk', label: 'Junk / Parts' },
    { value: 'Pre-order', label: 'Pre-order' },
  ];

  const shopOptions = [
    { value: 'Jalan Jalan Japan', label: 'Jalan Jalan Japan' },
    { value: 'TaoBao', label: 'TaoBao' },
    { value: 'OLX', label: 'OLX' },
    { value: 'AmiAmi', label: 'AmiAmi' },
    { value: 'Mandarake', label: 'Mandarake' },
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
            if (data.previewImage) {
              setPreviewId(data.previewImage);
            } else if (items.length > 0) {
              setPreviewId(items[0].id);
            }
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
    if (active.id !== over.id) {
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

    const currentUser = auth.currentUser;
    if (!currentUser) return alert('You must be logged in');

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

      const previewUrl = finalUrls[mediaItems.findIndex((i) => i.id === previewId)] || finalUrls[0];
      const priceInCurrency = Number(formData.price) || 0;
      const priceInUSD = parseFloat((priceInCurrency * EXCHANGE_RATES[currency]).toFixed(2));

      const finalData = {
        ...formData,
        userId: currentUser.uid,
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
          authorName: (currentUser?.displayName || currentUser?.email || 'Anon').split('@')[0],
          authorId: currentUser.uid,
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
    <div className="max-w-4xl mx-auto p-6 text-[#e4e4e4] relative text-left font-sans">
      <Scanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { background-color: #1a1a1a !important; border: 1px solid #333 !important; border-radius: 1.5rem !important; color: white !important; }
        .react-datepicker__header { background-color: #121212 !important; border-bottom: 1px solid #333 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: white !important; font-size: 10px !important; }
        .react-datepicker__day--selected { background-color: #2563eb !important; }
      `}</style>

      {epicSuccess && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative bg-[#1a1a1a] border border-[#333] rounded-[3rem] p-8 text-center max-w-sm">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-3xl font-black text-white uppercase italic mb-6">Success!</h3>
            <img
              src={epicSuccess.img}
              className="w-full aspect-[3/4] object-cover rounded-2xl mb-4 border-2 border-blue-500"
              alt="success"
            />
            <p className="text-blue-500 font-bold animate-pulse uppercase tracking-widest text-xs">
              Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* ШАПКА ФОРМЫ С КНОПКОЙ СКАНЕРА */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-4xl font-black flex items-center gap-4 uppercase tracking-tighter italic">
          {isEdit ? (
            <Edit3 className="text-blue-500" size={32} />
          ) : (
            <PlusCircle className="text-blue-500" size={32} />
          )}
          {isEdit ? 'Edit Details' : 'Add Figure'}
        </h2>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-blue-500 px-6 py-3 rounded-2xl transition-all group active:scale-95 shadow-xl"
        >
          <Scan size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-black uppercase italic text-[10px] tracking-widest text-white">
            Visual Search
          </span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-[#333] space-y-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-blue-500 font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
              <Info size={14} /> Basic Information
            </h3>
            <CharacterSearch
              value={formData.name}
              onChange={(val) => handleCustomChange('name', val)}
            />
            <div className="relative z-[60]">
              <AnimeSearch
                value={formData.anime}
                onChange={(val) => handleCustomChange('anime', val)}
              />
            </div>
            <CustomSelect
              icon={Tag}
              options={brandOptions}
              value={formData.brand}
              onChange={(val) => handleCustomChange('brand', val)}
            />
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <input
                  name="price"
                  type="number"
                  placeholder={`Price (${currency}) *`}
                  className="bg-[#121212] border border-[#333] p-4.5 rounded-2xl outline-none focus:border-blue-500 font-bold text-white"
                  onChange={handleChange}
                  value={formData.price}
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#121212] border border-[#333] px-4 rounded-2xl text-white font-black text-xs appearance-none"
                >
                  <option value="USD">$</option>
                  <option value="KZT">₸</option>
                  <option value="CNY">¥</option>
                </select>
              </div>
            </div>
            <CustomSelect
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              value={formData.gender}
              onChange={(val) => handleCustomChange('gender', val)}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-gray-500 font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
              <PlusCircle size={14} /> Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10"
                  size={18}
                />
                <DatePicker
                  selected={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
                  onChange={(date) =>
                    handleCustomChange('purchaseDate', date ? date.toISOString().split('T')[0] : '')
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  className="w-full bg-[#121212] border border-[#333] p-4.5 rounded-2xl text-white font-bold text-[11px]"
                />
              </div>
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
              options={conditionOptions}
              value={formData.conditionGrade}
              onChange={(val) => handleCustomChange('conditionGrade', val)}
            />
            <CustomSelect
              icon={ShoppingCart}
              options={shopOptions}
              value={formData.purchasePlace}
              onChange={(val) => handleCustomChange('purchasePlace', val)}
            />
          </div>
        </div>

        {/* DRAG & DROP AREA */}
        <div className="space-y-6 pt-4 border-t border-[#333]/50">
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
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all ${
              isDraggingOver
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-[#333] hover:border-blue-500/50'
            }`}
          >
            <Upload
              className={isDraggingOver ? 'text-blue-500 scale-110' : 'text-gray-600'}
              size={32}
            />
            <span className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em]">
              Photos (Max 5) / Drag thumbnails to reorder
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
              size={18}
            />
            <input
              name="auctionUrl"
              placeholder="Listing / Store URL"
              className="w-full bg-[#121212] border border-[#333] p-4.5 pl-12 rounded-2xl font-bold text-white focus:border-blue-500"
              onChange={handleChange}
              value={formData.auctionUrl}
            />
          </div>
          <textarea
            name="conditionNotes"
            placeholder="Notes..."
            className="w-full bg-[#121212] border border-[#333] p-5 rounded-2xl outline-none h-24 resize-none font-bold text-white focus:border-blue-500"
            onChange={handleChange}
            value={formData.conditionNotes}
          ></textarea>
        </div>

        <button
          disabled={loading}
          className="w-full py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl tracking-widest transition-all shadow-xl active:scale-[0.98] uppercase italic flex items-center justify-center gap-3"
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
