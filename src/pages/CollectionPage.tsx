import React, { useEffect, useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { db, storage, auth } from '../firebase/config';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  where,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Loader2, Monitor } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Modal from '../shared/Modal.js';

import { FigureCard, CollectionHeader, CollectionFilters } from '../components/collection';

interface Figure {
  id: string;
  name: string;
  anime?: string;
  brand?: string;
  price?: string | number;
  image?: string;
  images?: string[];
  createdAt?: { seconds: number };
}

const Collection: React.FC = () => {
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState<Figure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Состояния фильтров
  const [sortBy, setSortBy] = useState('newest');
  const [filterAnime, setFilterAnime] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        const q = query(
          collection(db, 'figures'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );
        
        const unsubscribeSnap = onSnapshot(q, (snap) => {
          const figuresArray = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          } as Figure));
          setFigures(figuresArray);
          setLoading(false);
        });
        
        return () => unsubscribeSnap();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // Подготовка опций для селектов
  const animeOptions = useMemo(() => {
    const titles = figures.map((f) => f.anime).filter(Boolean);
    return ['All', ...new Set(titles)].sort();
  }, [figures]);

  const brandOptions = useMemo(() => {
    const brands = figures.map((f) => f.brand).filter(Boolean);
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
      await deleteDoc(doc(db, 'figures', figureToDelete.id));
      
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] pb-24 font-sans text-left overflow-x-hidden relative"
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
        title="Delete Figure"
        message={`Delete "${figureToDelete?.name}"?`}
      />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
              <p className="text-xl font-black uppercase italic tracking-widest">No units found</p>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

export default Collection;