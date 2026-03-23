import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import {
  Plus,
  Loader2,
  X,
  Heart,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Импортируем навигацию
import AnimeSearch from '../components/AnimeSearch';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate(); // Инициализируем навигацию

  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    price: '',
    link: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'wishlist'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Функция для переноса в коллекцию
  const handleGotIt = (item) => {
    navigate('/add', {
      state: {
        initialData: {
          name: item.name,
          anime: item.anime,
          brand: item.brand,
          price: item.price,
          auctionUrl: item.link || '',
        },
        fromWishlistId: item.id,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'wishlist'), {
        ...formData,
        price: Number(formData.price),
        createdAt: new Date(),
        userId: auth.currentUser?.uid,
      });
      setShowForm(false);
      setFormData({ name: '', anime: '', brand: '', price: '', link: '' });
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove from Wishlist?')) {
      await deleteDoc(doc(db, 'wishlist', id));
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
      <div className="max-w-7xl mx-auto text-left">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6">
          <div className="flex items-center gap-3">
            <Heart className="text-pink-500 fill-pink-500" size={30} />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Wishlist
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl"
          >
            <Plus size={20} /> Add Target
          </button>
        </div>

        {/* Сетка хотелок */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#1a1a1a] border border-[#333] rounded-[2rem] p-6 relative group overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full uppercase tracking-widest">
                    {item.brand || 'Unknown Brand'}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{item.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-4 italic">{item.anime}</p>

                <div className="flex items-center justify-between mt-6">
                  <div className="text-2xl font-black text-white">${item.price}</div>

                  <div className="flex gap-2">
                    {/* Кнопка "Купил" */}
                    <button
                      onClick={() => handleGotIt(item)}
                      className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
                      title="Convert to Collection"
                    >
                      <CheckCircle size={20} />
                      <span className="hidden group-hover:block">Got It!</span>
                    </button>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#222] hover:bg-[#333] p-3 rounded-xl text-pink-500 transition-all"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[3rem] p-10 relative animate-in zoom-in duration-300">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black mb-8 uppercase italic tracking-tighter text-white">
                New Wish
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  placeholder="Figure Name *"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-pink-500 text-white font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <AnimeSearch
                  value={formData.anime}
                  onChange={(val) => setFormData({ ...formData, anime: val })}
                />

                <input
                  placeholder="Brand"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-pink-500 text-white font-bold"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />

                <input
                  type="number"
                  placeholder="Approx. Price ($)"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-pink-500 text-white font-bold"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />

                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-4 text-gray-600" size={18} />
                  <input
                    placeholder="Product Link (URL)"
                    className="w-full bg-[#121212] border border-[#333] p-4 pl-12 rounded-xl outline-none focus:border-pink-500 text-white font-bold"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>

                <button
                  disabled={submitting}
                  className="w-full bg-pink-600 py-4 rounded-2xl font-black text-lg hover:bg-pink-500 text-white shadow-xl uppercase italic"
                >
                  {submitting ? 'ADDING...' : 'ADD TO WISHLIST'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
