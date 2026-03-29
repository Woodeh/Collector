import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { db, auth } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

import { HeroSection, QuickStats, SpotlightCard } from '../components/home';
import RankSection from '../components/home/RankSection';
import QuickActions from '../components/home/QuickActions';
import RecentFigures from '../components/home/RecentFigures';
import HomeWidgets from '../components/home/HomeWidgets';

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

        {/* RANK PROGRESS & QUICK ACTIONS */}
        {user && (
          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            <RankSection stats={stats} />
            <QuickActions />
          </Motion.section>
        )}

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

        <RecentFigures recentFigures={recentFigures} />
        <HomeWidgets widgetStats={widgetStats} />
      </div>
    </div>
  );
};

export default HomePage;
