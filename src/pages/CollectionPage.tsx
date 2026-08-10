import React, { useEffect, useState, useMemo } from 'react';
import { useI18n } from '../app/i18n/I18nProvider';
import { motion as Motion } from 'framer-motion';
import { storage } from '../firebase/config';
import { ref, deleteObject } from 'firebase/storage';
import { CheckSquare, Edit3, Monitor, Square, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../shared/Modal.js';
import { useAuth } from '../app/providers/AuthProvider';

import { FigureCard, CollectionHeader, CollectionFilters } from '../components/collection';
import type { Figure } from '../types/figure';
import { bulkUpdateFigures, deleteFigure, subscribeToUserFigures, type BulkFigureChanges } from '../entities/figures/api/figureRepository';
import BulkEditModal from '../features/bulk-edit-figures/BulkEditModal';
import PageState from '../shared/PageState';

const Collection: React.FC = () => {
  const { t } = useI18n();
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState<Figure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Состояния фильтров
  const [sortBy, setSortBy] = useState('newest');
  const [filterAnime, setFilterAnime] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const unsubscribeSnap = subscribeToUserFigures(
      user.uid,
      (items) => {
        setFigures(items);
        setLoading(false);
      },
      (error) => {
        console.error('Collection subscription failed:', error);
        setLoadError(true);
        setLoading(false);
      },
    );

    return unsubscribeSnap;
  }, [user]);

  // Подготовка опций для селектов
  const animeOptions = useMemo(() => {
    const titles = figures
      .map((f) => f.anime)
      .filter((val): val is string => Boolean(val));
    return ['All', ...new Set(titles)].sort();
  }, [figures]);

  const brandOptions = useMemo(() => {
    const brands = figures
      .map((f) => f.brand)
      .filter((val): val is string => Boolean(val));
    return ['All', ...new Set(brands)].sort();
  }, [figures]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setFilterAnime('All');
    setFilterBrand('All');
  };

  const processedFigures = useMemo(() => {
    let result = [...figures];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(term) ||
          f.anime?.toLowerCase().includes(term),
      );
    }

    if (filterAnime !== 'All') result = result.filter((f) => f.anime === filterAnime);
    if (filterBrand !== 'All') result = result.filter((f) => f.brand === filterBrand);

    result.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;

      if (sortBy === 'cheap') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'expensive') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'oldest') return timeA - timeB;
      return timeB - timeA; // newest
    });

    return result;
  }, [figures, searchTerm, filterAnime, filterBrand, sortBy]);

  const handleConfirmDelete = async () => {
    if (!figureToDelete) return;
    try {
      await deleteFigure(figureToDelete.id);
      
      const imageUrls = figureToDelete.images || (figureToDelete.image ? [figureToDelete.image] : []);
      
      for (const url of imageUrls) {
        // Проверяем, что картинка лежит именно в нашем Firebase Storage
        if (url && url.includes('firebasestorage.googleapis.com')) {
          try {
            await deleteObject(ref(storage, url));
          } catch (e) {
            console.warn('Image cleanup skipped or failed:', e);
          }
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsModalOpen(false);
      setFigureToDelete(null);
    }
  };

  const toggleSelection = (figureId: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(figureId)) next.delete(figureId); else next.add(figureId);
    return next;
  });

  const stopSelection = () => { setSelectionMode(false); setSelectedIds(new Set()); };
  const allVisibleSelected = processedFigures.length > 0 && processedFigures.every((figure) => selectedIds.has(figure.id));
  const toggleAllVisible = () => setSelectedIds((current) => {
    const next = new Set(current);
    processedFigures.forEach((figure) => allVisibleSelected ? next.delete(figure.id) : next.add(figure.id));
    return next;
  });
  const handleBulkApply = async (changes: BulkFigureChanges) => {
    const selectedFigures = figures.filter((figure) => selectedIds.has(figure.id));
    await bulkUpdateFigures(selectedFigures, changes);
    stopSelection();
  };

  if (loading) return <PageState type="loading" />;
  if (loadError) return <PageState type="error" />;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] p-3 sm:p-4 md:p-8 text-[#e4e4e4] pb-24 font-sans text-left overflow-x-hidden relative"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('details.deleteTitle')}
        message={t('details.deleteMessage', { name: figureToDelete?.name || '' })}
      />
      <BulkEditModal isOpen={bulkModalOpen} selectedCount={selectedIds.size} onClose={() => setBulkModalOpen(false)} onApply={handleBulkApply} />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 relative z-10">
        <CollectionHeader
          processedCount={processedFigures.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

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

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#333] bg-[#1a1a1a] p-3">
          {!selectionMode ? (
            <button type="button" onClick={() => setSelectionMode(true)} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-blue-400"><CheckSquare size={16} />{t('bulk.select')}</button>
          ) : (
            <>
              <span className="px-2 text-[10px] font-black uppercase tracking-wider text-blue-400">{t('bulk.selected', { count: selectedIds.size })}</span>
              <button type="button" onClick={toggleAllVisible} className="flex items-center gap-2 rounded-xl border border-[#333] px-4 py-3 text-[10px] font-black uppercase text-gray-300">{allVisibleSelected ? <CheckSquare size={15} /> : <Square size={15} />}{t('bulk.selectAll')}</button>
              <button type="button" disabled={selectedIds.size === 0} onClick={() => setBulkModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white disabled:opacity-40"><Edit3 size={15} />{t('bulk.edit')}</button>
              <button type="button" onClick={stopSelection} className="ml-auto flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white"><X size={15} />{t('common.cancel')}</button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
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
                selectionMode={selectionMode}
                isSelected={selectedIds.has(figure.id)}
                onToggleSelection={() => toggleSelection(figure.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-32 text-center opacity-30">
              <Monitor className="mx-auto mb-4" size={48} />
              <p className="text-xl font-black uppercase italic tracking-widest">{t('collection.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

export default Collection;
