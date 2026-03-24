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
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../components/Select';
import AnimeSearch from '../components/AnimeSearch';

// Календарь
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FigureForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = mode === 'edit';

  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [epicSuccess, setEpicSuccess] = useState(null);

  // Валюта (по умолчанию USD)
  const [currency, setCurrency] = useState('USD');

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

  // Курсы валют (примерные, можно обновлять)
  const EXCHANGE_RATES = {
    USD: 1,
    KZT: 0.0022, // 1 KZT ≈ 0.0022 USD
    CNY: 0.14, // 1 CNY ≈ 0.14 USD
  };

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
    if (!isEdit && location.state?.initialData) {
      setFormData((prev) => ({ ...prev, ...location.state.initialData }));
    }
    if (isEdit && id) {
      const fetchFigure = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'figures', id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(data);
            setExistingImages(data.images || []);
            setPreviewIdx(data.images?.indexOf(data.previewImage) || 0);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setFetching(false);
        }
      };
      fetchFigure();
    }
  }, [id, isEdit, location.state]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCustomChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 && existingImages.length === 0) return alert('Please upload photo');

    // ПРОВЕРКА АВТОРИЗАЦИИ
    const currentUser = auth.currentUser;
    if (!currentUser) return alert('You must be logged in to save figures');

    setLoading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        const fileRef = ref(storage, `figures/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        newUrls.push(url);
      }

      const allImages = [...existingImages, ...newUrls];
      const previewImg = allImages[previewIdx] || allImages[0];

      // КОНВЕРТАЦИЯ ЦЕНЫ В USD
      const priceInCurrency = Number(formData.price) || 0;
      const priceInUSD = parseFloat((priceInCurrency * EXCHANGE_RATES[currency]).toFixed(2));

      // ФОРМИРУЕМ ДАННЫЕ С ПРИВЯЗКОЙ К USER ID
      const finalData = {
        ...formData,
        userId: currentUser.uid, // Привязываем к ID аккаунта
        images: allImages,
        previewImage: previewImg,
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
          authorId: currentUser.uid, // Дополнительно сохраняем для истории
        });
      }

      setEpicSuccess({ name: formData.name, img: previewImg });
      setTimeout(() => {
        setEpicSuccess(null);
        navigate('/collection');
      }, 3000);
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
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          background-color: #1a1a1a !important;
          border: 1px solid #333 !important;
          border-radius: 1.5rem !important;
          font-family: inherit !important;
          color: white !important;
          overflow: hidden;
        }
        .react-datepicker__header {
          background-color: #121212 !important;
          border-bottom: 1px solid #333 !important;
          border-radius: 0 !important;
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day {
          color: white !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
        }
        .react-datepicker__day:hover {
          background-color: #2563eb !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__day--selected {
          background-color: #2563eb !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__day--outside-month { color: #444 !important; }
      `}</style>

      {epicSuccess && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-sm animate-in zoom-in duration-300">
            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-[#1a1a1a] border border-[#333] rounded-[3rem] p-8 shadow-2xl text-center">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">
                {isEdit ? 'Updated!' : 'Captured!'}
              </h3>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-blue-500/50 mb-6 shadow-2xl">
                <img src={epicSuccess.img} alt="p" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-white font-black uppercase italic truncate">
                  {epicSuccess.name}
                </p>
                <Sparkles className="absolute top-3 right-3 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse italic">
                Processing data...
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-4xl font-black mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
        {isEdit ? (
          <Edit3 className="text-blue-500" size={32} />
        ) : (
          <PlusCircle className="text-blue-500" size={32} />
        )}
        {isEdit ? 'Edit Details' : 'Add Figure'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-[#333] space-y-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-blue-500 font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
              <Info size={14} /> Basic Information
            </h3>
            <input
              name="name"
              placeholder="Name *"
              className="w-full bg-[#121212] border border-[#333] p-4.5 rounded-2xl outline-none focus:border-blue-500 font-bold text-white placeholder:text-gray-700"
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
                  className="bg-[#121212] border border-[#333] p-4.5 rounded-2xl outline-none focus:border-blue-500 font-bold text-white placeholder:text-gray-700"
                  onChange={handleChange}
                  value={formData.price}
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#121212] border border-[#333] px-4 rounded-2xl outline-none text-white font-black text-xs cursor-pointer hover:border-blue-500 transition-colors appearance-none"
                >
                  <option value="USD">$</option>
                  <option value="KZT">₸</option>
                  <option value="CNY">¥</option>
                </select>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest pl-2">
                Will be saved as USD
              </p>
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
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10"
                  size={18}
                />
                <DatePicker
                  selected={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
                  onChange={(date) =>
                    handleCustomChange('purchaseDate', date ? date.toISOString().split('T')[0] : '')
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  className="w-full bg-[#121212] border border-[#333] p-4.5 pl-12 rounded-2xl outline-none text-white font-bold uppercase text-[11px] tracking-widest focus:border-blue-500 transition-colors cursor-pointer"
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

        {/* ... Остальная часть формы (URL, Notes, Photos, Button) без изменений ... */}
        <div className="space-y-4 pt-4 border-t border-[#333]/50">
          <div className="relative">
            <LinkIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              name="auctionUrl"
              placeholder="Listing / Store URL"
              className="w-full bg-[#121212] border border-[#333] p-4.5 pl-12 rounded-2xl outline-none font-bold text-white placeholder:text-gray-700 focus:border-blue-500 transition-colors"
              onChange={handleChange}
              value={formData.auctionUrl}
            />
          </div>
          <textarea
            name="conditionNotes"
            placeholder="Notes..."
            className="w-full bg-[#121212] border border-[#333] p-5 rounded-2xl outline-none h-24 resize-none font-bold text-white placeholder:text-gray-700 focus:border-blue-500 transition-colors"
            onChange={handleChange}
            value={formData.conditionNotes}
          ></textarea>
        </div>

        <div className="space-y-6">
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#333] rounded-[2.5rem] cursor-pointer hover:bg-[#1f1f1f] hover:border-blue-500/50 transition-all group">
            <Upload
              className="text-gray-600 mb-2 group-hover:text-blue-500 transition-transform group-hover:-translate-y-1"
              size={32}
            />
            <span className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em]">
              Photos (Max 5)
            </span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
              accept="image/*"
            />
          </label>
          <div className="grid grid-cols-5 gap-4">
            {existingImages.map((url, idx) => (
              <div
                key={`old-${idx}`}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
                  previewIdx === idx
                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'border-[#333]'
                }`}
              >
                <img src={url} className="w-full h-full object-cover" alt="f" />
                <button
                  type="button"
                  onClick={() => setPreviewIdx(idx)}
                  className="absolute top-2 left-2 bg-black/70 p-1.5 rounded-lg hover:bg-blue-600 transition-colors"
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
                  onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-lg hover:bg-red-600 transition-colors text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.map((file, idx) => (
              <div
                key={`new-${idx}`}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-blue-500/30"
              >
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  alt="n"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-lg text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl tracking-widest transition-all shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-[0.98] uppercase italic flex items-center justify-center gap-3"
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
