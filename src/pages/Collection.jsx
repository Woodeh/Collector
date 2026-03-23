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
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Figure"
        message={`Are you sure you want to delete "${figureToDelete?.name}"?`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-[#333] pb-8 gap-6 text-left">
          <div className="flex items-center gap-4">
            <LayoutGrid className="text-blue-500" size={30} />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Collection
            </h2>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-blue-500 text-sm font-mono border border-[#333] font-bold">
              {filteredFigures.length}
            </span>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
            <div className="relative group flex-grow md:w-80">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-blue-500' : 'text-gray-500 group-focus-within:text-blue-500'
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#1a1a1a] border border-[#333] py-2.5 pl-12 pr-10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <Link
              to="/add"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold uppercase tracking-tight flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20 text-[13px]"
            >
              <Plus size={18} />
              <span>Add New</span>
            </Link>
          </div>
        </div>

        {/* Figures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredFigures.map((figure) => (
            <div key={figure.id} className="relative group">
              {/* Кнопки управления (Edit и Delete) */}
              <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/edit/${figure.id}`);
                  }}
                  className="bg-[#121212]/80 hover:bg-blue-600 text-white p-2 rounded-xl backdrop-blur-md border border-white/5 transition-all shadow-xl"
                  title="Edit Figure"
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
                  className="bg-[#121212]/80 hover:bg-red-600 text-white p-2 rounded-xl backdrop-blur-md border border-white/5 transition-all shadow-xl"
                  title="Delete Figure"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <Link
                to={`/figure/${figure.id}`}
                className="bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col shadow-xl h-full"
              >
                <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative border-b border-[#333]">
                  <img
                    src={figure.previewImage || figure.image}
                    alt={figure.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.95] group-hover:brightness-100"
                  />
                  {figure.authorName && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/5">
                      <User size={10} className="text-blue-400" />
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                        {figure.authorName.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-7 flex-grow flex flex-col justify-between">
                  <div className="text-left space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] opacity-80 leading-none truncate max-w-[70%] italic">
                        {figure.anime}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded border ${
                          figure.gender === 'Female'
                            ? 'border-pink-500/30 text-pink-400'
                            : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {figure.gender === 'Female' ? 'F' : 'M'}
                      </span>
                    </div>

                    <div className="border-l-2 border-blue-500/40 pl-4 py-1">
                      <h3 className="text-xl font-black text-white leading-tight mb-1 truncate group-hover:text-blue-500 transition-colors uppercase italic tracking-tighter">
                        {figure.name}
                      </h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                        {figure.brand || 'Original Character'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-blue-500" />
                      <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest leading-none">
                        Price
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white italic leading-none">
                      {Number(figure.price).toLocaleString()}{' '}
                      <span className="text-sm font-normal text-blue-500 not-italic">$</span>
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
