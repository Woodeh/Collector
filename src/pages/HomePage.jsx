import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { db, auth } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { LayoutGrid, Loader2, ChevronRight, Clock, Heart, Shield, Zap, Target } from 'lucide-react';

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
      if (currentUser) {
        fetchData(currentUser.uid);
        fetchWidgetStats(currentUser.uid);
      } else setLoading(false);
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

        const getRankInfo = (count) => {
          if (count >= 500)
            return {
              name: 'Mythic Overlord',
              next: 1000,
              color: 'text-amber-500',
              bg: 'bg-amber-500',
            };
          if (count >= 250)
            return {
              name: 'Legendary Curator',
              next: 500,
              color: 'text-rose-500',
              bg: 'bg-rose-500',
            };
          if (count >= 100)
            return {
              name: 'Master Architect',
              next: 250,
              color: 'text-purple-500',
              bg: 'bg-purple-500',
            };
          if (count >= 50)
            return {
              name: 'Elite Hunter',
              next: 100,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500',
            };
          if (count >= 25)
            return { name: 'Veteran Tracker', next: 50, color: 'text-cyan-500', bg: 'bg-cyan-500' };
          if (count >= 10)
            return {
              name: 'Active Collector',
              next: 25,
              color: 'text-blue-500',
              bg: 'bg-blue-500',
            };
          if (count >= 5)
            return {
              name: 'Apprentice',
              next: 10,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500',
            };
          return { name: 'Novice', next: 5, color: 'text-gray-500', bg: 'bg-gray-500' };
        };

        setStats({
          totalValue: val,
          count: allDocs.length,
          topBrand,
          rank: getRankInfo(allDocs.length),
        });
      }

      const recentQ = query(
        collection(db, 'figures'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5),
      );
      setRecentFigures((await getDocs(recentQ)).docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [widgetStats, setWidgetStats] = useState({ preorders: 0, wishlist: 0 });
  const fetchWidgetStats = async (uid) => {
    const qPre = query(collection(db, 'preorders'), where('userId', '==', uid));
    const qWish = query(collection(db, 'wishlist'), where('userId', '==', uid));
    const [preSnap, wishSnap] = await Promise.all([getDocs(qPre), getDocs(qWish)]);
    setWidgetStats({
      preorders: preSnap.size,
      wishlist: wishSnap.size,
    });
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e4e4] font-sans pb-20 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-24 md:space-y-32 relative">
        {/* HERO & STATS SECTION */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12"
        >
          <HeroSection user={user} />
          <QuickStats stats={stats} />
        </Motion.section>

        {/* SPOTLIGHT SECTION */}
        <Motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-blue-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">
              Spotlight Discovery
            </span>
          </div>
          <SpotlightCard spotlight={spotlight} />
        </Motion.section>

        {/* RECENTLY ADDED */}
        <Motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between border-b border-[#333] pb-6">
            <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
              <Zap size={24} className="text-blue-500" /> Latest Logged Units
            </h2>
            <Link
              to="/collection"
              className="group bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 hover:border-blue-500 hover:text-white transition-all"
            >
              Access Archive{' '}
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {recentFigures.map((figure, idx) => (
              <Motion.div
                key={figure.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/figure/${figure.id}`}
                  className="group block bg-[#1a1a1a] rounded-[1.8rem] border border-[#333] overflow-hidden hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 h-full"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#121212] relative">
                    <img
                      src={figure.previewImage || figure.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      alt={figure.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg">
                      <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">
                        New Entry
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em] truncate mb-1 italic opacity-70">
                      {figure.anime}
                    </p>
                    <h3 className="text-xs font-black text-white uppercase italic truncate leading-tight tracking-wide">
                      {figure.name}
                    </h3>
                  </div>
                </Link>
              </Motion.div>
            ))}
            {recentFigures.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-[#333] rounded-[2.5rem] opacity-20">
                <LayoutGrid size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase italic tracking-[0.2em]">Database Empty</p>
              </div>
            )}
          </div>
        </Motion.section>

        {/* WIDGETS */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10"
        >
          <Link
            to="/preorders"
            className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-orange-500/30 transition-all shadow-xl"
          >
            <div className="flex items-center gap-8">
              <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                <Clock size={32} />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
                  Status: Incoming Supply
                </span>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Pre-orders Log
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
                  {widgetStats.preorders} units pending arrival
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-orange-500 group-hover:translate-x-2 transition-transform"
              size={28}
            />
          </Link>

          <Link
            to="/wishlist"
            className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between hover:border-pink-500/30 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-8">
              <div className="p-5 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                <Target size={32} />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">
                  System Priority: High
                </span>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Target Wishlist
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
                  Monitoring {widgetStats.wishlist} desired assets
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-pink-500 group-hover:translate-x-2 transition-transform"
              size={28}
            />
          </Link>
        </Motion.section>
      </div>
    </div>
  );
};

export default HomePage;
