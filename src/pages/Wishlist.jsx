import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import {
  Plus,
  Loader2,
  X,
  Heart,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  CheckCircle,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import AnimeSearch from '../components/AnimeSearch';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', anime: '', brand: '', price: '', link: '' });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
        );

        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setItems(docs);
          setLoading(false);
        });
        return () => unsubscribeSnap();
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

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
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'wishlist'), {
        ...formData,
        userId: user.uid,
        price: Number(formData.price),
        createdAt: new Date(),
      });
      setShowForm(false);
      setFormData({ name: '', anime: '', brand: '', price: '', link: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this grail?')) {
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
    <div className="min-h-screen bg-[#121212] p-4 md:p-10 text-[#e4e4e4] font-sans">
      <div className="max-w-7xl mx-auto text-left">
        {/* HEADER: Приведен к масштабу Collection */}
        <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={24} />
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                Wishlist
              </h2>
            </div>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-pink-500 text-xs font-black border border-[#333]">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Target</span>
          </button>
        </div>

        {/* GRID: Карточки стали компактнее */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#1a1a1a] border border-[#333] rounded-[1.5rem] p-5 relative overflow-hidden flex flex-col justify-between hover:border-pink-500/30 transition-all group"
            >
              <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-pink-600 opacity-40" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[8px] font-black bg-pink-600/10 text-pink-500 px-2 py-1 rounded-md uppercase tracking-widest border border-pink-500/10 truncate max-w-[140px]">
                    {item.brand || 'Premium'}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-blue-500 text-[9px] font-black uppercase italic tracking-widest mb-0.5 truncate">
                  {item.anime}
                </p>
                <h3 className="text-base md:text-lg font-black text-white uppercase italic tracking-tighter leading-tight mb-6 line-clamp-2 min-h-[2.5rem]">
                  {item.name}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-[#333]/50">
                  <div>
                    <p className="text-gray-600 text-[7px] uppercase font-black tracking-widest mb-0.5">
                      Price
                    </p>
                    <div className="text-xl font-black text-white italic tracking-tight">
                      ${item.price}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#121212] p-2.5 rounded-xl text-gray-500 hover:text-pink-500 border border-[#333] transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => handleGotIt(item)}
                      className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white p-2.5 px-4 rounded-xl transition-all flex items-center gap-2 font-black uppercase italic text-[10px]"
                    >
                      <CheckCircle size={16} />
                      <span>Got it</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {items.length === 0 && (
          <div className="py-20 text-center opacity-10">
            <Heart size={60} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-sm">Wishlist Empty</p>
          </div>
        )}

        {/* MODAL: Теперь аккуратный, как на других страницах */}
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter text-white">
                New Grail Target
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Figure Name *"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-pink-600 text-sm text-white font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <AnimeSearch
                  value={formData.anime}
                  onChange={(val) => setFormData({ ...formData, anime: val })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Brand"
                    className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Price ($)"
                    className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <input
                  placeholder="Link (URL)"
                  className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none text-sm text-white font-bold"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />

                <button
                  disabled={submitting}
                  className="w-full bg-pink-600 py-4 rounded-xl font-black text-sm hover:bg-pink-500 text-white uppercase italic tracking-widest transition-all active:scale-95"
                >
                  {submitting ? 'Adding...' : 'Add to Wishlist'}
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
