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
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Collection = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Состояния для фильтрации
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'cheap', 'expensive'
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

  // Генерируем список уникальных аниме для фильтра
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

  // ОСНОВНАЯ ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ
  const processedFigures = useMemo(() => {
    let result = [...figures];

    // 1. Поиск по тексту
    if (searchTerm) {
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.anime?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 2. Фильтр по конкретному аниме
    if (filterAnime !== 'All') {
      result = result.filter((f) => f.anime === filterAnime);
    }

    // 3. Сортировка
    result.sort((a, b) => {
      if (sortBy === 'cheap') return a.price - b.price;
      if (sortBy === 'expensive') return b.price - a.price;
      if (sortBy === 'oldest') return a.createdAt?.seconds - b.createdAt?.seconds;
      return b.createdAt?.seconds - a.createdAt?.seconds; // newest
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
    <div className="min-h-screen bg-[#121212] p-4 md:p-6 text-[#e4e4e4] pb-20">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Figure"
        message={`Are you sure you want to delete "${figureToDelete?.name}"?`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-6 text-left border-b border-[#333] pb-6">
          <div className="flex items-center gap-4">
            <LayoutGrid className="text-blue-500" size={30} />
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
              Shelf
            </h2>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded-xl text-blue-500 text-xs font-black border border-[#333]">
              {processedFigures.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-grow sm:flex-grow-0">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  searchTerm ? 'text-blue-500' : 'text-gray-500'
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-64 bg-[#1a1a1a] border border-[#333] py-3 pl-12 pr-10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-black text-xs uppercase italic ${
                showFilters
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-blue-500/50'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <Link
              to="/add"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-tight flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20 text-xs"
            >
              <Plus size={18} />
              <span>Add</span>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-6 bg-[#1a1a1a] border border-[#333] rounded-[2rem] animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">
                Sort By Price/Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: 'Newest' },
                  { id: 'oldest', label: 'Oldest' },
                  { id: 'cheap', label: 'Cheapest' },
                  { id: 'expensive', label: 'Most Expensive' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`py-2 px-4 rounded-xl text-[10px] font-bold uppercase transition-all border ${
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

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">
                Filter by Anime
              </label>
              <div className="relative group">
                <select
                  value={filterAnime}
                  onChange={(e) => setFilterAnime(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs text-white appearance-none cursor-pointer"
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

        {/* Figures Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {processedFigures.length > 0 ? (
            processedFigures.map((figure) => (
              <div key={figure.id} className="relative group h-full">
                <div className="absolute top-3 right-3 z-40 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/edit/${figure.id}`);
                    }}
                    className="bg-[#121212]/90 hover:bg-blue-600 text-white p-2 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-xl"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFigureToDelete(figure);
                      setIsModalOpen(true);
                    }}
                    className="bg-[#121212]/90 hover:bg-red-600 text-white p-2 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <Link
                  to={`/figure/${figure.id}`}
                  className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] border border-[#333] overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col shadow-xl h-full"
                >
                  <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative border-b border-[#333]">
                    <img
                      src={figure.previewImage || figure.image}
                      alt={figure.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-105 brightness-[0.95] sm:group-hover:brightness-100"
                    />
                  </div>

                  <div className="p-4 md:p-7 flex-grow flex flex-col justify-between">
                    <div className="text-left space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] opacity-80 leading-none truncate max-w-[70%] italic">
                          {figure.anime}
                        </p>
                        <span
                          className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            figure.gender === 'Female'
                              ? 'border-pink-500/30 text-pink-400'
                              : 'border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {figure.gender === 'Female' ? 'F' : 'M'}
                        </span>
                      </div>

                      <div className="border-l-2 border-blue-500/40 pl-3 md:pl-4 py-0.5">
                        <h3 className="text-base md:text-xl font-black text-white leading-tight mb-1 truncate sm:group-hover:text-blue-500 transition-colors uppercase italic tracking-tighter">
                          {figure.name}
                        </h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] italic truncate leading-none">
                          {figure.brand || 'Original Character'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-8 pt-3 md:pt-4 border-t border-white/5 flex justify-between items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-blue-500" />
                        <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest leading-none">
                          Price
                        </span>
                      </div>
                      <span className="text-lg md:text-2xl font-black text-white italic leading-none">
                        {Number(figure.price).toLocaleString()}{' '}
                        <span className="text-sm font-normal text-blue-500 not-italic">$</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-40">
              <p className="text-xl font-black uppercase italic tracking-widest">Shelf is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
