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
              {t('home.preorders')}
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
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
        className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between hover:border-pink-500/30 transition-all group shadow-xl"
      >
        <div className="flex items-center gap-8">
          <div className="p-5 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
            <Target size={32} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">
              {t('home.wishlist')}
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
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
