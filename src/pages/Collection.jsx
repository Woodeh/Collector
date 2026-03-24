import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { LayoutGrid, Loader2, Tag, Trash2, User, Plus, Search, X, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Collection = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

  const filteredFigures = figures.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.anime?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-[#333] pb-6 md:pb-8 gap-6 text-left">
          <div className="flex items-center gap-3 md:gap-4">
            <LayoutGrid className="text-blue-500" size={24} md:size={30} />
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
              Collection
            </h2>
            <span className="bg-[#1a1a1a] px-2.5 py-0.5 rounded-full text-blue-500 text-xs md:text-sm font-mono border border-[#333] font-bold">
              {filteredFigures.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <div className="relative group w-full sm:w-64 md:w-80">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-blue-500' : 'text-gray-500 group-focus-within:text-blue-500'
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search figures..."
                className="w-full bg-[#1a1a1a] border border-[#333] py-3 pl-12 pr-10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <Link
              to="/add"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20 text-[12px] md:text-[13px]"
            >
              <Plus size={18} />
              <span>Add New</span>
            </Link>
          </div>
        </div>

        {/* Figures Grid - Адаптивная сетка */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredFigures.map((figure) => (
            <div key={figure.id} className="relative group h-full">
              {/* Кнопки управления ( Edit и Delete) - Всегда видны на тач-устройствах */}
              <div className="absolute top-3 right-3 z-40 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/edit/${figure.id}`);
                  }}
                  className="bg-[#121212]/90 hover:bg-blue-600 text-white p-2 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-xl"
                >
                  <Pencil size={16} md:size={18} />
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
                  <Trash2 size={16} md:size={18} />
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
                  {figure.authorName && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/5">
                      <User size={10} className="text-blue-400" />
                      <span className="text-[9px] md:text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                        {figure.authorName.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-7 flex-grow flex flex-col justify-between">
                  <div className="text-left space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-[8px] md:text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80 leading-none truncate max-w-[70%] italic">
                        {figure.anime}
                      </p>
                      <span
                        className={`shrink-0 text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded border ${
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
                      <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] italic truncate">
                        {figure.brand || 'Original Character'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-8 pt-3 md:pt-4 border-t border-white/5 flex justify-between items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} md:size={14} className="text-blue-500" />
                      <span className="text-gray-500 text-[8px] md:text-[9px] uppercase font-bold tracking-widest leading-none">
                        Price
                      </span>
                    </div>
                    <span className="text-lg md:text-2xl font-black text-white italic leading-none">
                      {Number(figure.price).toLocaleString()}{' '}
                      <span className="text-xs md:text-sm font-normal text-blue-500 not-italic">
                        $
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
