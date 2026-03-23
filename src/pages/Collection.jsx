import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { LayoutGrid, Loader2, Tag, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const Collection = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [figureToDelete, setFigureToDelete] = useState(null);

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

  const openModal = (e, figure) => {
    e.preventDefault();
    e.stopPropagation();
    setFigureToDelete(figure);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!figureToDelete) return;

    try {
      await deleteDoc(doc(db, 'figures', figureToDelete.id));

      if (figureToDelete.images && figureToDelete.images.length > 0) {
        for (const imgUrl of figureToDelete.images) {
          try {
            const imageRef = ref(storage, imgUrl);
            await deleteObject(imageRef);
          } catch {
            console.warn('Файл не найден');
          }
        }
      } else if (figureToDelete.image) {
        try {
          const imageRef = ref(storage, figureToDelete.image);
          await deleteObject(imageRef);
        } catch {
          console.warn('Файл не найден');
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
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
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление фигурки"
        message={`Вы действительно хотите удалить "${figureToDelete?.name}" и все его фотографии?`}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-10 border-b border-[#333] pb-6">
          <LayoutGrid className="text-blue-500" size={30} />
          <h2 className="text-3xl font-black uppercase tracking-tight">Коллекция</h2>
          <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-blue-500 text-sm font-mono border border-[#333]">
            {figures.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {figures.map((figure) => (
            <Link
              to={`/figure/${figure.id}`}
              key={figure.id}
              className="group bg-[#1a1a1a] rounded-2xl border border-[#333] overflow-hidden hover:border-blue-500/30 transition-all duration-500 relative flex flex-col shadow-xl"
            >
              <button
                onClick={(e) => openModal(e, figure)}
                className="absolute top-4 right-4 z-30 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-red-500/20"
              >
                <Trash2 size={20} />
              </button>

              <div className="aspect-[3/4] overflow-hidden bg-[#121212] relative">
                <img
                  src={figure.previewImage || figure.image}
                  alt={figure.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {figure.authorName && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/5">
                    <User size={10} className="text-blue-400" />
                    <span className="text-[10px] text-gray-300 font-semibold truncate max-w-[80px]">
                      {figure.authorName.split(' ')[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between relative z-10 bg-[#1a1a1a]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white truncate pr-2 group-hover:text-blue-400 transition-colors">
                      {figure.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        figure.gender === 'Female'
                          ? 'border-pink-500/30 text-pink-400'
                          : 'border-blue-500/30 text-blue-400'
                      }`}
                    >
                      {figure.gender === 'Female' ? 'F' : 'M'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Tag size={14} className="text-blue-500" />
                    <span className="truncate italic">{figure.anime}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {Number(figure.price).toLocaleString()}{' '}
                    <span className="text-sm font-normal text-blue-500">$</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
