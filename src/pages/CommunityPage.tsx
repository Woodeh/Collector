import React, { useEffect, useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Users, Search, SlidersHorizontal } from 'lucide-react';
import { FigureCard, CollectionFilters } from '../components/collection';
import type { Figure } from '../types/figure';
import { subscribeToPublicFigures } from '../entities/figures/api/figureRepository';
import { useI18n } from '../app/i18n/I18nProvider';
import PageState from '../shared/PageState';

type SortOption = 'newest' | 'oldest' | 'cheap' | 'expensive' | 'az' | 'za';

const Community: React.FC = () => {
  const { t } = useI18n();
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Состояния для фильтров
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterAnime, setFilterAnime] = useState<string>('All Origins');
  const [filterBrand, setFilterBrand] = useState<string>('All');

  useEffect(() => {
    // Подписываемся на все фигурки
    const unsubscribe = subscribeToPublicFigures(
      (items) => {
        setFigures(items);
        setLoading(false);
      },
      (error) => {
        console.error('Community subscription failed:', error);
        setLoadError(true);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Динамический список аниме для фильтра
  const animeOptions = useMemo<string[]>(() => {
    const titles = figures.map((f) => f.anime).filter((val): val is string => Boolean(val));
    return ['All Origins', ...Array.from(new Set(titles))].sort();
  }, [figures]);

  // Динамический список брендов для фильтра
  const brandOptions = useMemo<string[]>(() => {
    const brands = figures.map((f) => f.brand).filter((val): val is string => Boolean(val));
    return ['All', ...Array.from(new Set(brands))].sort();
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
    const result = figures.filter((f) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (f.name?.toLowerCase().includes(lowerSearch) ?? false) ||
        (f.anime?.toLowerCase().includes(lowerSearch) ?? false);

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

  if (loading) return <PageState type="loading" message={t('community.syncing')} />;
  if (loadError) return <PageState type="error" />;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="app-page text-[#e4e4e4] text-left selection:bg-blue-500/30"
    >
      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="app-container space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 sm:gap-6 border-b border-[#333] pb-6 sm:pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                {t('community.network')}
              </span>
            </div>
            <h1 className="ui-page-title uppercase italic text-white">
              {t('community.global')} <span className="text-blue-500">{t('community.catalog')}</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
              {t('community.count', { count: figures.length })}
            </p>
          </div>

          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 sm:gap-3 lg:w-auto">
            <div className="relative min-w-0 lg:w-80">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-blue-500' : 'text-gray-500'
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder={t('collection.search')}
                className="ui-control py-3.5 sm:py-4 pl-12 pr-4 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label={t('filters.sorting')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                showFilters
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Filters Component */}
        <CollectionFilters
          showFilters={showFilters}
          sortBy={sortBy}
          setSortBy={(val: string) => setSortBy(val as SortOption)}
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
          <div className="grid grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {processedFigures.map((figure) => (
              <FigureCard key={figure.id} figure={figure} isCommunity={true} />
            ))}
          </div>
        ) : (
          <div className="py-16 md:py-20 text-center border border-dashed border-[#333] rounded-[2rem] md:rounded-[3rem]">
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] italic">
              {t('community.empty')}
            </p>
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default Community;
