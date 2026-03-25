import React, { useEffect, useState, useMemo } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import {
  LayoutGrid,
  Loader2,
  Tag,
  Trash2,
  Plus,
  Search,
  X,
  Pencil,
  Filter,
  ChevronDown,
  Monitor,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

// --- ЛОКАЛЬНЫЙ КОМПОНЕНТ КАРТОЧКИ ---
const FigureCard = ({ figure, onEdit, onDelete }) => {
  return (
    <div className="relative group bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full">
      {/* Кнопки управления */}
      <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
        <button
          onClick={onEdit}
          className="bg-black/60 hover:bg-blue-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="bg-black/60 hover:bg-red-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <Link to={`/figure/${figure.id}`} className="flex flex-col h-full cursor-pointer">
        {/* Фото */}
        <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
          <img
            src={figure.previewImage || figure.image}
            alt={figure.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
          />
        </div>

        {/* Информация */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            {/* Аниме и Пол */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.25em] italic truncate max-w-[80%]">
                {figure.anime}
              </span>
              <div
                className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${
                  figure.gender === 'Female'
                    ? 'border-pink-500/30 text-pink-500'
                    : 'border-blue-500/30 text-blue-500'
                }`}
              >
                {figure.gender === 'Female' ? 'F' : 'M'}
              </div>
            </div>

            {/* Имя с синей полоской */}
            <div className="relative pl-4 border-l-[3px] border-blue-600 py-1">
              <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                {figure.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
                {figure.brand || 'Original'}
              </p>
            </div>
          </div>

          {/* Цена */}
          <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-40">
              <Tag size={14} className="text-blue-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-white italic">
                Price
              </span>
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-1">
              {Number(figure.price).toLocaleString()}
              <span className="text-blue-500 not-italic text-xl ml-1">$</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
const Collection = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterAnime, setFilterAnime] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, 'figures'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );

        const unsubscribeSnap = onSnapshot(q, (querySnapshot) => {
          const figuresArray = [];
          querySnapshot.forEach((doc) => {
            figuresArray.push({ ...doc.data(), id: doc.id });
          });
          setFigures(figuresArray);
          setLoading(false);
        });

        return () => unsubscribeSnap();
      } else {
        setFigures([]);
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const animeOptions = useMemo(() => {
    const titles = figures.map((f) => f.anime).filter(Boolean);
    return ['All', ...new Set(titles)].sort();
  }, [figures]);

  const handleConfirmDelete = async () => {
    if (!figureToDelete) return;
    try {
      await deleteDoc(doc(db, 'figures', figureToDelete.id));
      const imageUrls =
        figureToDelete.images || (figureToDelete.image ? [figureToDelete.image] : []);
      for (const url of imageUrls) {
        try {
          const imageRef = ref(storage, url);
          await deleteObject(imageRef);
        } catch {
          console.warn('Image already deleted');
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsModalOpen(false);
      setFigureToDelete(null);
    }
  };

  const processedFigures = useMemo(() => {
    let result = [...figures];

    if (searchTerm) {
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.anime?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterAnime !== 'All') {
      result = result.filter((f) => f.anime === filterAnime);
    }

    result.sort((a, b) => {
      if (sortBy === 'cheap') return a.price - b.price;
      if (sortBy === 'expensive') return b.price - a.price;
      if (sortBy === 'oldest') return a.createdAt?.seconds - b.createdAt?.seconds;
      return b.createdAt?.seconds - a.createdAt?.seconds;
    });

    return result;
  }, [figures, searchTerm, filterAnime, sortBy]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] pb-24 font-sans text-left">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Figure"
        message={`Are you sure you want to delete "${figureToDelete?.name}"?`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#333] pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
              <LayoutGrid className="text-blue-500" size={26} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                Shelf
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 italic">
                Collection Registry / {processedFigures.length} Units
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-grow md:w-72">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-blue-500' : 'text-gray-600'
                }`}
                size={16}
              />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full bg-[#1a1a1a] border border-[#333] py-3.5 pl-11 pr-10 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs text-white cursor-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase italic cursor-pointer ${
                showFilters
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-blue-500/50'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <Link
              to="/add"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black uppercase italic tracking-tighter flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Unit</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 p-8 bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
                Sort Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: 'Newest Units' },
                  { id: 'oldest', label: 'Archive' },
                  { id: 'cheap', label: 'Low Cost' },
                  { id: 'expensive', label: 'Premium' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                      sortBy === opt.id
                        ? 'bg-blue-600/10 border-blue-500 text-blue-500'
                        : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
                Source Origin
              </label>
              <div className="relative">
                <select
                  value={filterAnime}
                  onChange={(e) => setFilterAnime(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] p-3.5 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs text-white appearance-none cursor-pointer"
                >
                  {animeOptions.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={14}
                />
              </div>
            </div>
          </div>
        )}

        {/* Сетка */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {processedFigures.length > 0 ? (
            processedFigures.map((figure) => (
              <FigureCard
                key={figure.id}
                figure={figure}
                onEdit={() => navigate(`/edit/${figure.id}`)}
                onDelete={() => {
                  setFigureToDelete(figure);
                  setIsModalOpen(true);
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-32 text-center opacity-30">
              <Monitor className="mx-auto mb-4" size={48} />
              <p className="text-xl font-black uppercase italic tracking-widest">Database empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
