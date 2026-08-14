import React, { FC } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Target, ChevronRight } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';

// Интерфейс для статистики, передаваемой в пропсы
interface WidgetStats {
  preorders: number | string;
  wishlist: number | string;
}

interface HomeWidgetsProps {
  widgetStats: WidgetStats;
}

const HomeWidgets: FC<HomeWidgetsProps> = ({ widgetStats }) => {
  const { t } = useI18n();
  return (
    <Motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 gap-4 pb-10 sm:gap-6 md:grid-cols-2 md:gap-8"
    >
      <Link
        to="/preorders"
        className="group flex min-w-0 items-center justify-between gap-3 rounded-[2rem] border border-[#333] bg-[#1a1a1a] p-5 shadow-xl transition-all hover:border-orange-500/30 sm:rounded-[2.5rem] sm:p-8"
      >
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <div className="shrink-0 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-orange-500 transition-all duration-500 group-hover:bg-orange-500 group-hover:text-white sm:p-5">
            <Clock size={32} />
          </div>
          <div className="min-w-0 space-y-1 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
              {t('home.preorders')}
            </span>
            <h3 className="truncate text-xl font-black text-white uppercase italic tracking-tighter leading-none sm:text-2xl">
              {t('nav.preorders')}
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
              {t('home.preorderCount', { count: widgetStats.preorders })}
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
        className="group flex min-w-0 items-center justify-between gap-3 rounded-[2rem] border border-[#333] bg-[#1a1a1a] p-5 shadow-xl transition-all hover:border-pink-500/30 sm:rounded-[2.5rem] sm:p-8"
      >
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <div className="shrink-0 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-pink-500 transition-all duration-500 group-hover:bg-pink-500 group-hover:text-white sm:p-5">
            <Target size={32} />
          </div>
          <div className="min-w-0 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">
              {t('home.wishlist')}
            </span>
            <h3 className="truncate text-xl font-black text-white uppercase italic tracking-tighter leading-none sm:text-2xl">
              {t('nav.wishlist')}
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
              {t('home.wishlistCount', { count: widgetStats.wishlist })}
            </p>
          </div>
        </div>
        <ChevronRight
          className="text-pink-500 group-hover:translate-x-2 transition-transform"
          size={28}
        />
      </Link>
    </Motion.section>
  );
};

export default HomeWidgets;
