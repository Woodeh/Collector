import React, { useEffect, useState, useMemo } from 'react';
import { db, storage, auth } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Loader2, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

import { FigureCard, CollectionHeader, CollectionFilters } from '../components/collection';

const CollectionPage = () => {
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
        const unsubscribeSnap = onSnapshot(q, (snap) => {
          const figuresArray = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          setFigures(figuresArray);
          setLoading(false);
        });
        return () => unsubscribeSnap();
      } else {
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
          await deleteObject(ref(storage, url));
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
    if (filterAnime !== 'All') result = result.filter((f) => f.anime === filterAnime);

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
        />

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

export default CollectionPage;
