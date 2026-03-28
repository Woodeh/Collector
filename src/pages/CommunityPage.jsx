import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Users, Search, SlidersHorizontal } from 'lucide-react';
import FigureCard from '../components/collection/FigureCard';
import CollectionFilters from '../components/collection/CollectionFilters';

const Community = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Состояния для фильтров
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterAnime, setFilterAnime] = useState('All Origins');
  const [filterBrand, setFilterBrand] = useState('All'); // Новое состояние

  useEffect(() => {
    // Подписываемся на все фигурки
    const q = query(collection(db, 'figures'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const figuresArray = [];
      querySnapshot.forEach((doc) => {
        figuresArray.push({ ...doc.data(), id: doc.id });
      });
      setFigures(figuresArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Динамический список аниме для фильтра
  const animeOptions = useMemo(() => {
    const titles = figures.map((f) => f.anime).filter(Boolean);
    return ['All Origins', ...new Set(titles)].sort();
  }, [figures]);

  // Динамический список брендов для фильтра
  const brandOptions = useMemo(() => {
    const brands = figures.map((f) => f.brand).filter(Boolean);
    return ['All', ...new Set(brands)].sort();
  }, [figures]);

  // Функция сброса калибровки
  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setFilterAnime('All Origins');
    setFilterBrand('All');
  };

  // Логика фильтрации и сортировки
  const processedFigures = useMemo(() => {
    let result = figures.filter((f) => {
      const matchesSearch =
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.anime?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAnime = filterAnime === 'All Origins' || f.anime === filterAnime;
      const matchesBrand = filterBrand === 'All' || f.brand === filterBrand;

      return matchesSearch && matchesAnime && matchesBrand;
    });

    // Расширенная сортировка
    return result.sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sortBy === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      if (sortBy === 'cheap') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'expensive') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });
  }, [figures, searchTerm, filterAnime, filterBrand, sortBy]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.3em]">
            Syncing Global Database
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] pb-20 text-left selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#333] pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Community Network
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
              Global <span className="text-blue-500">Catalog.</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
              Scanning {figures.length} unique assets in public access
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-blue-500' : 'text-gray-500'
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search database..."
                className="w-full bg-[#1a1a1a] border border-[#333] py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                showFilters
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Filters Component - Теперь со всеми пропсами */}
        <CollectionFilters
          showFilters={showFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterAnime={filterAnime}
          setFilterAnime={setFilterAnime}
          animeOptions={animeOptions}
          filterBrand={filterBrand}
          setFilterBrand={setFilterBrand}
          brandOptions={brandOptions}
          onReset={handleResetFilters}
        />

        {/* Grid Section */}
        {processedFigures.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {processedFigures.map((figure) => (
              <FigureCard key={figure.id} figure={figure} isCommunity={true} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-[#333] rounded-[3rem]">
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] italic">
              No units found in current sector
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
