import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  User,
  LogOut,
  DollarSign,
  Clock,
  Target,
  X,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  History,
  TrendingUp,
} from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333] shadow-2xl text-left backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none italic">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-blue-500 italic leading-none">
          {payload[0].value} Units
        </p>
      </div>
    );
  }
  return null;
};

const Profile = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [user, setUser] = useState(null);
  const [allFigures, setAllFigures] = useState([]);
  const [recentFigures, setRecentFigures] = useState([]);
  const [collectionStats, setCollectionStats] = useState({ totalValue: 0, count: 0 });
  const [preorderStats, setPreorderStats] = useState({ totalValue: 0, count: 0 });
  const [wishlistStats, setWishlistStats] = useState({ totalValue: 0, count: 0 });
  const [nextRelease, setNextRelease] = useState(null);
  const [brandData, setBrandData] = useState([]);
  const [animeData, setAnimeData] = useState([]);
  const [favoriteFigure, setFavoriteFigure] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  // Функция прокрутки слайдера
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const qFigures = query(collection(db, 'figures'), where('userId', '==', currentUser.uid));

        const unsubFigures = onSnapshot(qFigures, (snap) => {
          const figuresList = [];
          let totalValue = 0,
            count = 0;
          const brandsMap = {};
          const animeMap = {};

          snap.docs.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            figuresList.push(data);
            if (data.conditionGrade?.toLowerCase().trim() !== 'pre-order') {
              totalValue += Number(data.price) || 0;
              count++;
              brandsMap[data.brand || 'Other'] = (brandsMap[data.brand || 'Other'] || 0) + 1;
              animeMap[data.anime || 'Original'] = (animeMap[data.anime || 'Original'] || 0) + 1;
            }
          });

          setAllFigures(figuresList);
          setRecentFigures(
            [...figuresList]
              .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
              .slice(0, 10),
          );

          setAnimeData(
            Object.keys(animeMap)
              .map((n) => ({ name: n, value: animeMap[n] }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5),
          );
          setBrandData(
            Object.keys(brandsMap)
              .map((b) => ({ name: b, value: brandsMap[b] }))
              .sort((a, b) => b.value - a.value),
          );
          setCollectionStats({ totalValue, count });

          const manualFav = figuresList.find((f) => f.isFavorite === true);
          setFavoriteFigure(manualFav || [...figuresList].sort((a, b) => b.price - a.price)[0]);
        });

        const qPreorders = query(
          collection(db, 'preorders'),
          where('userId', '==', currentUser.uid),
        );
        const unsubPreorders = onSnapshot(qPreorders, (snap) => {
          let totalPreValue = 0;
          const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.forEach((i) => (totalPreValue += Number(i.totalPrice) || 0));
          if (items.length > 0)
            setNextRelease(
              [...items].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))[0],
            );
          setPreorderStats({ totalValue: totalPreValue, count: snap.size });
        });

        const qWish = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
        const unsubWish = onSnapshot(qWish, (snap) => {
          let totalWishValue = 0;
          snap.docs.forEach((doc) => (totalWishValue += Number(doc.data().price) || 0));
          setWishlistStats({ totalValue: totalWishValue, count: snap.size });
        });

        return () => {
          unsubFigures();
          unsubPreorders();
          unsubWish();
        };
      }
    });
    return () => unsubAuth();
  }, []);

  const handleSelectFavorite = async (figureId) => {
    try {
      const currentFav = allFigures.find((f) => f.isFavorite === true);
      if (currentFav) await updateDoc(doc(db, 'figures', currentFav.id), { isFavorite: false });
      await updateDoc(doc(db, 'figures', figureId), { isFavorite: true });
      setIsSelectOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-12 pb-32 text-left font-sans relative overflow-hidden">
      <style>{`
        @keyframes flashlightFocus {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          33% { transform: translate(-48%, -52%) scale(1.1); opacity: 0.2; }
          66% { transform: translate(-52%, -48%) scale(0.95); opacity: 0.15; }
        }
        .center-flashlight {
          position: fixed; top: 50%; left: 50%; width: 80vw; height: 80vw;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 60%);
          filter: blur(100px); z-index: 0; pointer-events: none; animation: flashlightFocus 12s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="center-flashlight"></div>

      {/* MODAL */}
      {isSelectOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-2xl rounded-[3rem] p-8 relative shadow-2xl max-h-[80vh] flex flex-col text-left">
            <button
              onClick={() => setIsSelectOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white cursor-pointer"
            >
              <X />
            </button>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 text-left">
              Select Main Grail
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar text-left">
              {allFigures.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelectFavorite(f.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    f.id === favoriteFigure?.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/5 bg-[#121212] hover:border-white/20'
                  }`}
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#222]">
                    <img
                      src={f.previewImage || f.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="truncate text-left text-left">
                    <p className="text-white font-black uppercase italic text-sm truncate leading-tight group-hover:text-blue-400">
                      {f.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {f.anime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 text-left">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] gap-6 shadow-2xl relative z-10 text-left">
          <div className="flex items-center gap-6 text-left">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg">
              <User size={40} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black uppercase italic text-white leading-none text-left">
                {user.displayName || user.email.split('@')[0]}
              </h1>
              <p className="text-blue-500 font-bold text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              auth.signOut();
              navigate('/login');
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 text-left">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] space-y-6 shadow-2xl text-left">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic text-left">
                Financial Hub
              </h4>
              <div className="space-y-4 text-left">
                {[
                  {
                    label: 'Total Value',
                    val: collectionStats.totalValue,
                    color: 'text-white',
                    icon: <DollarSign size={18} />,
                    bg: 'bg-blue-500/10',
                  },
                  {
                    label: 'Pre-order Debt',
                    val: preorderStats.totalValue,
                    color: 'text-orange-500',
                    icon: <Clock size={18} />,
                    bg: 'bg-orange-500/10',
                  },
                  {
                    label: 'Wishlist Budget',
                    val: wishlistStats.totalValue,
                    color: 'text-pink-500',
                    icon: <Target size={18} />,
                    bg: 'bg-pink-500/10',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-[#121212] rounded-2xl border border-white/5 transition-all hover:border-white/10 text-left text-left"
                  >
                    <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>{stat.icon}</div>
                    <div className="text-left">
                      <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-xl font-black ${stat.color} italic leading-none`}>
                        ${stat.val.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl h-[400px] text-left">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-6 text-left text-left">
                Top Franchises
              </h4>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={animeData} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[0, 10, 10, 0]}
                    barSize={20}
                    className="cursor-pointer outline-none"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 relative group/container text-left">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-[3rem] shadow-3xl h-full overflow-hidden flex flex-col relative z-10 transition-all duration-500 group hover:border-blue-500/30">
              <button
                onClick={() => setIsSelectOpen(true)}
                className="absolute top-6 left-6 z-40 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-xl transition-all active:scale-95 text-[10px] font-black uppercase italic tracking-widest cursor-pointer text-left"
              >
                Switch Grail
              </button>
              <button
                onClick={() => navigate(`/figure/${favoriteFigure?.id}`)}
                className="absolute top-6 right-6 z-40 bg-black/40 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer hover:bg-white hover:text-black"
              >
                <Info size={20} />
              </button>
              {favoriteFigure ? (
                <div className="h-full relative flex flex-col">
                  <div className="flex-1 overflow-hidden relative">
                    <img
                      src={favoriteFigure.previewImage || favoriteFigure.image}
                      className="w-full h-full object-cover transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105"
                      alt="favorite"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent text-left pointer-events-none text-left">
                      <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1 italic leading-none">
                        {favoriteFigure.anime}
                      </p>
                      <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 text-left">
                        {favoriteFigure.name}
                      </h3>
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest border-r border-white/10 pr-3 italic leading-none">
                          Main grail
                        </span>
                        <span className="text-2xl font-black text-white italic tracking-tight leading-none">
                          ${favoriteFigure.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center opacity-10 font-black italic text-left text-left text-left">
                  Empty Shelf
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 text-left">
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl relative group overflow-hidden text-left text-left">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-6">
                Next Arrival
              </h4>
              {nextRelease ? (
                <div className="space-y-6 text-left">
                  <div className="text-left text-left">
                    <p className="text-orange-500 font-black uppercase text-[9px] tracking-widest mb-1 italic leading-none text-left">
                      {nextRelease.anime}
                    </p>
                    <h3 className="text-xl font-black text-white uppercase italic leading-tight truncate text-left">
                      {nextRelease.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center text-left">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
                      <p className="text-[7px] text-gray-500 uppercase font-bold mb-1 text-left">
                        Release
                      </p>
                      <p className="text-[10px] font-black text-white leading-none text-left">
                        {nextRelease.releaseDate}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
                      <p className="text-[7px] text-gray-500 uppercase font-bold mb-1 text-left">
                        Brand
                      </p>
                      <p className="text-[10px] font-black text-white truncate leading-none text-left">
                        {nextRelease.brand}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/preorders')}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all cursor-pointer shadow-lg active:scale-95 text-left"
                  >
                    Check Pre-orders
                  </button>
                </div>
              ) : (
                <p className="opacity-20 uppercase font-black italic text-xs text-center py-10">
                  Nothing pending
                </p>
              )}
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl min-h-[400px] flex flex-col text-left">
              <div className="flex items-center justify-between mb-8 text-left">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic text-left">
                  Brands Split
                </h4>
                <Layers size={14} className="text-gray-700" />
              </div>
              <div className="flex flex-col gap-6 text-left">
                <div className="h-40 w-full relative text-left text-left">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={brandData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {brandData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[18px] font-black text-white italic leading-none">
                      {collectionStats.count}
                    </p>
                    <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest">
                      Units
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  {brandData.slice(0, 5).map((brand, i) => (
                    <div key={i} className="space-y-1.5 text-left">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-left text-left">
                          <div
                            className="w-1 h-1 rounded-full text-left text-left"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <p className="text-[10px] font-black text-white uppercase italic truncate max-w-[120px] text-left text-left">
                            {brand.name}
                          </p>
                        </div>
                        <p className="text-[10px] font-black text-blue-500 italic text-left">
                          {brand.value} Units
                        </p>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden text-left">
                        <div
                          className="h-full transition-all duration-1000 ease-out text-left"
                          style={{
                            width: `${(brand.value / collectionStats.count) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BLOCK: FULL-FEATURED SLIDER */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-[3rem] p-10 shadow-3xl relative z-10 text-left overflow-hidden text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 text-left">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 text-left">
                <History size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none text-left">
                  Collection Stream
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1 italic text-left">
                  Slide through your latest acquisitions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto text-left">
              <button
                onClick={() => scroll('left')}
                className="p-3 rounded-xl border border-white/5 bg-[#121212] text-white hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-3 rounded-xl border border-white/5 bg-[#121212] text-white hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar hide-scrollbar scroll-smooth active:cursor-grabbing select-none text-left"
          >
            {recentFigures.length > 0 ? (
              recentFigures.map((fig) => (
                <div
                  key={fig.id}
                  onClick={() => navigate(`/figure/${fig.id}`)}
                  className="flex-shrink-0 w-64 bg-[#121212] border border-white/5 rounded-3xl p-5 group hover:border-blue-500/40 transition-all duration-500 cursor-pointer relative text-left text-left"
                >
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 rounded-lg p-1.5 shadow-lg text-left">
                    <Info size={14} className="text-white" />
                  </div>
                  <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 bg-[#1a1a1a] relative text-left text-left">
                    <img
                      src={fig.previewImage || fig.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 text-left"></div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-left text-left">
                      <span className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase italic text-left">
                        Recent
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic truncate text-left">
                      {fig.anime}
                    </p>
                    <h4 className="text-sm font-black text-white uppercase italic truncate tracking-tight text-left">
                      {fig.name}
                    </h4>
                    <div className="flex items-center justify-between pt-2 text-left">
                      <p className="text-xs font-black text-gray-400 italic text-left">
                        ${Number(fig.price).toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-600 font-black uppercase text-left">
                        {fig.brand || 'Original'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-20 flex flex-col items-center justify-center opacity-10 text-left text-left text-left">
                <TrendingUp size={48} className="mb-4 text-left text-left" />
                <p className="font-black italic uppercase tracking-widest text-left">Empty Vault</p>
              </div>
            )}

            <div
              onClick={() => navigate('/add-figure')}
              className="flex-shrink-0 w-64 bg-blue-600/5 border border-dashed border-blue-500/20 rounded-3xl p-5 flex flex-col items-center justify-center text-center group hover:bg-blue-600/10 hover:border-blue-500/40 transition-all duration-500 cursor-pointer text-left text-left text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform text-left text-left text-left">
                <Target size={24} />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest italic text-left">
                Register New
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
