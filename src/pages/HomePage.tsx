import React, { useState, useEffect } from 'react';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import { useI18n } from '../app/i18n/I18nProvider';

import { HeroSection, QuickStats, SpotlightCard } from '../components/home';
import RankSection from '../widgets/RankSection';
import QuickActions from '../components/home/QuickActions';
import RecentFigures from '../widgets/RecentFigures';
import HomeWidgets from '../components/home/HomeWidgets';
import LandingPage from './LandingPage';
import type { Figure, RankProtocol } from '../types/figure';
import { getUserFigures } from '../entities/figures/api/figureRepository';
import { getPreOrderCount } from '../entities/preorder/preOrderRepository';
import { getWishlistCount } from '../entities/wishlist/wishlistRepository';
import { selectDailyFigure } from '../entities/figures/model/dailyFigure';

interface Stats {
  totalValue: number;
  count: number;
  topBrand: string;
  rank: RankProtocol;
}

interface WidgetStats {
  preorders: number;
  wishlist: number;
}

const HomePage: React.FC = () => {
  const { t } = useI18n();
  const [recentFigures, setRecentFigures] = useState<Figure[]>([]);
  const [spotlight, setSpotlight] = useState<Figure | null>(null);
  const [stats, setStats] = useState<Stats>({ totalValue: 0, count: 0, topBrand: 'None', rank: { name: 'Novice', next: 5, color: 'text-gray-500', bg: 'bg-gray-500' } });
  const [loading, setLoading] = useState<boolean>(true);
  const { user, initializing } = useAuth();

  const nickname =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Collector';

  // Параллакс логика
  const { scrollYProgress } = useScroll();

  // Фоновые слои
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const floatingTextX = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  // Смещение контента для эффекта левитации
  const heroOffset = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const statsOffset = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.all([fetchData(user.uid), fetchWidgetStats(user.uid)]);
  }, [initializing, user]);

  const fetchData = async (uid: string) => {
    try {
      const allDocs = await getUserFigures(uid);

      if (allDocs.length > 0) {
        setSpotlight(selectDailyFigure(allDocs));

        // Расчет статистики
        const val = allDocs.reduce((acc, d) => acc + (Number(d.price) || 0), 0);
        const brands = allDocs.reduce((acc: Record<string, number>, d) => {
          if (d.brand) acc[d.brand] = (acc[d.brand] || 0) + 1;
          return acc;
        }, {});
        const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Original';

        const getRankInfo = (count: number): RankProtocol => {
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

      setRecentFigures(allDocs.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [widgetStats, setWidgetStats] = useState<WidgetStats>({ preorders: 0, wishlist: 0 });
  const fetchWidgetStats = async (uid: string) => {
    const [preorders, wishlist] = await Promise.all([
      getPreOrderCount(uid),
      getWishlistCount(uid),
    ]);
    setWidgetStats({
      preorders,
      wishlist,
    });
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!user) return <LandingPage />;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] text-[#e4e4e4] font-sans pb-20 selection:bg-blue-500/30 overflow-x-hidden relative"
    >
      {/* PARALLAX BACKGROUND SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Сетка */}
        <Motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.15]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </Motion.div>

        {/* Хайповый фоновый текст */}
        <Motion.div
          style={{ x: floatingTextX, opacity: 0.05 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[16vw] font-black uppercase tracking-[-0.04em] text-slate-800 dark:text-slate-200 select-none pointer-events-none"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400">
            {nickname}
          </span>
        </Motion.div>

        {/* Очень мягкий общий виньеточный градиент вместо пятен */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />

        {/* Grain/Noise Overlay to fix banding */}
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-24 md:space-y-32 relative">
        {/* HERO & STATS SECTION */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 relative z-10"
        >
          <Motion.div style={{ y: heroOffset }} className="w-full lg:w-auto">
            <HeroSection user={user} />
          </Motion.div>

          <Motion.div style={{ y: statsOffset }} className="w-full lg:w-auto">
            <QuickStats stats={stats} />
          </Motion.div>
        </Motion.section>

        {/* RANK PROGRESS & QUICK ACTIONS */}
        {user && (
          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
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
              {t('home.figureOfDay')}
            </span>
          </div>
          <SpotlightCard spotlight={spotlight} />
        </Motion.section>

        <RecentFigures recentFigures={recentFigures} />
        <HomeWidgets widgetStats={widgetStats} />
      </div>
    </Motion.div>
  );
};

export default HomePage;
