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
      const allDocs = (await getDocs(qAll)).docs.map((d) => ({ ...d.data(), id: d.id }));

      if (allDocs.length > 0) {
        setSpotlight(allDocs[Math.floor(Math.random() * allDocs.length)]);

        // Расчет статистики
        const val = allDocs.reduce((acc, d) => acc + (Number(d.price) || 0), 0);
        const brands = allDocs.reduce((acc, d) => {
          if (d.brand) acc[d.brand] = (acc[d.brand] || 0) + 1;
          return acc;
        }, {});
        const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Original';

        const getRank = (count) => {
          if (count > 100) return 'Legendary Curator';
          if (count > 50) return 'Master Collector';
          return 'Novice Collector';
        };

        setStats({
          totalValue: val,
          count: allDocs.length,
          topBrand,
          rank: getRank(allDocs.length),
        });
      }

      const recentQ = query(
        collection(db, 'figures'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10),
      );
      setRecentFigures((await getDocs(recentQ)).docs.map((d) => ({ ...d.data(), id: d.id })));
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

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e4e4] font-sans pb-20 selection:bg-blue-500/30">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-20 md:space-y-32">
        {/* HERO & STATS SECTION */}
        <section className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12">
          <HeroSection user={user} />
          <QuickStats stats={stats} />
        </section>

        {/* SPOTLIGHT SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-blue-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">
              Spotlight Discovery
            </span>
          </div>
          <SpotlightCard spotlight={spotlight} />
        </section>

        {/* RECENTLY ADDED */}
        <section className="space-y-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#333] pb-6">
            <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
              <LayoutGrid size={24} className="text-blue-500" /> Recent Assets
            </h2>
            <Link
              to="/collection"
              className="group text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 hover:text-white transition-colors"
            >
              Full Library{' '}
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative -mx-4 sm:mx-0">
            <div className="animate-marquee py-4">
              {[...recentFigures, ...recentFigures].map((figure, idx) => (
                <div key={`${figure.id}-${idx}`} className="w-[260px] md:w-[320px] px-4 shrink-0">
                  <Link
                    to={`/figure/${figure.id}`}
                    className="group block bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 h-full"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#121212] relative">
                      <img
                        src={figure.previewImage || figure.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60"></div>
                    </div>
                    <div className="p-6">
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest truncate mb-2 italic">
                        {figure.anime}
                      </p>
                      <h3 className="text-sm font-black text-white uppercase italic truncate leading-tight">
                        {figure.name}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WIDGETS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
          <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-orange-500/30 transition-all cursor-default">
            <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500">
              <Clock size={32} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
                Status: Pending Arrival
              </span>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Pre-orders active
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
                Check shipping schedule
              </p>
            </div>
          </div>

          <Link
            to="/wishlist"
            className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between hover:border-blue-500/30 transition-all group"
          >
            <div className="flex items-center gap-8">
              <div className="p-4 bg-blue-500 rounded-2xl text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Heart size={32} fill="currentColor" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  Vault Wishlist
                </h3>
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest italic">
                  Target acquired: 0 units
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-blue-500 group-hover:translate-x-2 transition-transform"
              size={28}
            />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
