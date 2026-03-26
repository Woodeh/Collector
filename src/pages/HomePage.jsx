import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { LayoutGrid, Loader2, ChevronRight, Clock, Heart } from 'lucide-react';

import { HeroSection, QuickStats, SpotlightCard } from '../components/home';

const HomePage = () => {
  const [recentFigures, setRecentFigures] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [nextPreorder, setNextPreorder] = useState(null);
  const [stats, setStats] = useState({ totalValue: 0, count: 0, topBrand: 'None', rank: 'Novice' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchData(currentUser.uid);
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid) => {
    try {
      const qAll = query(collection(db, 'figures'), where('userId', '==', uid));
      const allFiguresSnap = await getDocs(qAll);
      const allDocs = allFiguresSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      if (allDocs.length > 0) setSpotlight(allDocs[Math.floor(Math.random() * allDocs.length)]);

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

      setStats({ totalValue: val, count: allDocs.length, topBrand, rank: getRank(allDocs.length) });

      const qPre = query(collection(db, 'preorders'), where('userId', '==', uid));
      const preorderSnap = await getDocs(qPre);
      if (!preorderSnap.empty)
        setNextPreorder(preorderSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))[0]);
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
          className="bg-blue-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
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
        @keyframes soft-glow {
          0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
          50% { opacity: 0.7; text-shadow: 0 0 25px rgba(59, 130, 246, 0.7); }
        }
        .animate-blink { animation: soft-glow 4s ease-in-out infinite; will-change: opacity, text-shadow; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-16 md:space-y-24 text-left">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 md:gap-16">
          <HeroSection user={user} />
          <QuickStats stats={stats} />
        </div>

        <SpotlightCard spotlight={spotlight} />

        {/* RECENTLY ADDED SLIDER */}
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
            <div className="animate-marquee py-4">
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
              <div className="w-16 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden border border-[#333] shrink-0">
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
                <p className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                  {nextPreorder.releaseDate}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center italic text-gray-600 font-bold uppercase text-[9px] tracking-widest">
              No active pre-orders
            </div>
          )}

          <Link
            to="/wishlist"
            className="bg-blue-600/5 border border-blue-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between hover:bg-blue-600/10 transition-all group"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 md:p-4 bg-blue-500 rounded-xl md:rounded-2xl text-white shadow-lg">
                <Heart size={20} fill="currentColor" />
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

export default HomePage;
