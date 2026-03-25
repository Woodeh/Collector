import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  PlusCircle,
  Clock,
  Loader2,
  Heart,
  ChevronRight,
  Zap,
  Target,
  Box,
} from 'lucide-react';

const Home = () => {
  const [recentFigures, setRecentFigures] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [nextPreorder, setNextPreorder] = useState(null);
  const [stats, setStats] = useState({ totalValue: 0, count: 0, topBrand: 'None', rank: 'Novice' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid) => {
    try {
      const qAll = query(collection(db, 'figures'), where('userId', '==', uid));
      const allFiguresSnap = await getDocs(qAll);
      const allDocs = allFiguresSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      if (allDocs.length > 0) {
        setSpotlight(allDocs[Math.floor(Math.random() * allDocs.length)]);
      }

      const recentQ = query(
        collection(db, 'figures'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10),
      );
      const recentSnap = await getDocs(recentQ);
      setRecentFigures(recentSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      let val = 0;
      const brands = {};
      allDocs.forEach((d) => {
        val += Number(d.price) || 0;
        if (d.brand) brands[d.brand] = (brands[d.brand] || 0) + 1;
      });
      const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      const getRank = (count) => {
        if (count > 100) return 'Legendary Curator';
        if (count > 50) return 'Master Collector';
        if (count > 20) return 'Enthusiast';
        return 'Novice Collector';
      };

      setStats({
        totalValue: val,
        count: allDocs.length,
        topBrand,
        rank: getRank(allDocs.length),
      });

      const qPre = query(collection(db, 'preorders'), where('userId', '==', uid));
      const preorderSnap = await getDocs(qPre);
      if (!preorderSnap.empty) {
        const preorders = preorderSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setNextPreorder(preorders[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!user)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#121212] space-y-6">
        <h1 className="text-2xl font-black uppercase italic text-white">Access Denied</h1>
        <Link
          to="/login"
          className="bg-blue-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
          Login to System
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e4e4] overflow-hidden font-sans pb-10">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; }
        
        /* Плавное неоновое свечение без дерганий */
        @keyframes soft-glow {
          0%, 100% { 
            opacity: 1; 
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2);
          }
          50% { 
            opacity: 0.7; 
            text-shadow: 0 0 25px rgba(59, 130, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.3);
          }
        }

        .animate-blink { 
          animation: soft-glow 4s ease-in-out infinite; 
          will-change: opacity, text-shadow;
        }

        @media (hover: hover) { .animate-marquee:hover { animation-play-state: paused; } }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-16 md:space-y-24 text-left">
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 md:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 lg:pt-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
              Beyond The <br />
              Standard <span className="text-blue-500 animate-blink">Display</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] max-w-xl mx-auto lg:mx-0">
              Welcome back,{' '}
              <span className="text-white italic">
                {user.displayName || user.email.split('@')[0]}
              </span>
              . System check complete.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/add"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
              >
                <PlusCircle size={20} /> Add New
              </Link>
              <Link
                to="/collection"
                className="bg-[#1a1a1a] border border-[#333] hover:border-white/20 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest transition-all text-center"
              >
                Shelf View
              </Link>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full lg:min-w-[360px] lg:w-auto relative overflow-hidden group">
            <div className="absolute top-4 right-6 md:top-6 md:right-8 p-2 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl text-blue-500 animate-pulse">
              <Zap size={18} fill="currentColor" />
            </div>
            <h4 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 md:mb-10 italic">
              Portfolio Intelligence
            </h4>

            <div className="space-y-8 md:space-y-12">
              <div>
                <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
                  Total Collection Value
                </p>
                <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>

              <div className="pt-6 md:pt-10 border-t border-[#333] flex justify-between items-end gap-4 md:gap-6">
                <div className="space-y-4 md:space-y-6 flex-1">
                  <div>
                    <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
                      Dominant Brand
                    </p>
                    <p className="text-lg md:text-xl font-black text-white italic uppercase truncate max-w-[120px] sm:max-w-none">
                      {stats.topBrand}
                    </p>
                  </div>
                  <div className="h-1 w-full bg-[#121212] rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 w-[60%]"></div>
                    <div className="h-full bg-blue-500/40 w-[25%]"></div>
                    <div className="h-full bg-blue-500/10 w-[15%]"></div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-600 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
                    Collector Rank
                  </p>
                  <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase italic leading-tight">
                    {stats.rank}
                  </p>
                  <p className="text-gray-500 text-[9px] md:text-[10px] font-bold mt-1">
                    ({stats.count} Pcs)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SPOTLIGHT BLOCK */}
        {spotlight && (
          <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3.5rem] border border-[#333] bg-[#1a1a1a] shadow-2xl transition-all hover:border-blue-500/20">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 aspect-[4/5] md:aspect-[3/4] overflow-hidden md:border-r border-[#333] bg-[#121212] relative">
                <img
                  src={spotlight.previewImage || spotlight.image}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                  alt={spotlight.name}
                />
                <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-mono text-blue-400">
                  <span>ID:{spotlight.id.slice(0, 8)}</span>
                </div>
              </div>
              <div className="p-6 sm:p-8 md:p-12 flex-1 text-left space-y-4 md:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic">
                  Featured Masterpiece
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {spotlight.name}
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] italic text-xs md:text-sm border-b border-[#333] pb-4 truncate max-w-full">
                  {spotlight.anime}
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-x-10 md:gap-y-4 pt-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Box size={12} className="text-blue-500" />
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase truncate">
                      {spotlight.brand}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Target size={12} className="text-blue-500" />
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase">
                      {spotlight.category || 'Scale'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 md:pt-6 flex justify-between items-end border-t border-[#333]">
                  <div>
                    <p className="text-gray-600 text-[8px] md:text-[9px] uppercase font-black mb-1">
                      Asset Value
                    </p>
                    <p className="text-3xl md:text-4xl font-black text-white italic tracking-tight leading-none">
                      ${spotlight.price}
                    </p>
                  </div>
                  <Link
                    to={`/figure/${spotlight.id}`}
                    className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase italic tracking-widest text-white border-b-2 border-blue-500 pb-1 hover:text-blue-500 transition-colors"
                  >
                    Open Data <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INFINITE SLIDER */}
        <div className="space-y-6 md:space-y-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#333] pb-4 md:pb-6">
            <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
              <LayoutGrid size={18} className="text-blue-500" /> Recently Added
            </h2>
            <Link
              to="/collection"
              className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500 hover:text-white flex items-center gap-1"
            >
              Full <span className="hidden sm:inline">Library</span> <ChevronRight size={14} />
            </Link>
          </div>
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="hidden sm:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#121212] to-transparent z-20 pointer-events-none" />
            <div className="hidden sm:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#121212] to-transparent z-20 pointer-events-none" />
            <div className="animate-marquee cursor-grab active:cursor-grabbing py-4">
              {[...recentFigures, ...recentFigures].map((figure, index) => (
                <div
                  key={`${figure.id}-${index}`}
                  className="w-[240px] md:w-[300px] px-3 md:px-4 shrink-0"
                >
                  <Link
                    to={`/figure/${figure.id}`}
                    className="group bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] border border-[#333] overflow-hidden hover:border-blue-500/40 transition-all flex flex-col h-full shadow-xl"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#121212]">
                      <img
                        src={figure.previewImage || figure.image}
                        className="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-110"
                        alt=""
                      />
                    </div>
                    <div className="p-4 md:p-6 text-left">
                      <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em] truncate mb-1 italic">
                        {figure.anime}
                      </p>
                      <h3 className="text-[11px] md:text-sm font-black text-white uppercase italic truncate sm:group-hover:text-blue-500 transition-colors">
                        {figure.name}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-8 md:pb-12">
          {nextPreorder ? (
            <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center gap-6 md:gap-8 group hover:border-orange-500/30 transition-all">
              <div className="w-16 h-24 md:w-24 md:h-32 rounded-lg md:rounded-xl overflow-hidden border border-[#333] shrink-0">
                <img src={nextPreorder.screenshot} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="text-left space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 text-orange-500 animate-pulse">
                  <Clock size={14} />
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                    Incoming
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase italic truncate leading-tight">
                  {nextPreorder.name}
                </h3>
                <p className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-tight">
                  {nextPreorder.releaseDate}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center italic text-gray-600 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
              No active pre-orders
            </div>
          )}

          <Link
            to="/wishlist"
            className="bg-blue-600/5 border border-blue-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between hover:bg-blue-600/10 transition-all group"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 md:p-4 bg-blue-500 rounded-xl md:rounded-2xl text-white shadow-lg">
                <Heart size={20} md:size={24} fill="currentColor" />
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter">
                  Wishlist
                </h3>
                <p className="text-blue-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                  Hunt for grails
                </p>
              </div>
            </div>
            <ChevronRight className="text-blue-500 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
