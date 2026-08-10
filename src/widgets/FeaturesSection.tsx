import React, { FC, ReactNode } from 'react';
import { motion as Motion } from 'framer-motion';
import { Layers, BarChart3, Zap, Trophy } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

// Интерфейс для структуры фичи
interface Feature {
  icon: ReactNode;
  title: string;
  desc: string;
}

const FeaturesSection: FC = () => {
  const { t } = useI18n();
  const features: Feature[] = [
    { icon: <Layers className="text-blue-500" size={24} />, title: t('landing.featureVault'), desc: t('landing.featureVaultDesc') },
    { icon: <BarChart3 className="text-pink-500" size={24} />, title: t('landing.featureAnalytics'), desc: t('landing.featureAnalyticsDesc') },
    { icon: <Zap className="text-orange-500" size={24} />, title: t('landing.featurePreorders'), desc: t('landing.featurePreordersDesc') },
    { icon: <Trophy className="text-amber-500" size={24} />, title: t('landing.featureRanks'), desc: t('landing.featureRanksDesc') },
  ];
  return (
    <section className="relative px-3 py-16 sm:px-5 sm:py-24 md:px-8 md:py-28 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((f, i) => (
            <Motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
              whileHover={{ y: -10 }}
              className="p-5 sm:p-6 md:p-8 bg-[#1a1a1a] border border-[#333] rounded-[2rem] md:rounded-[2.5rem] space-y-5 md:space-y-6 hover:border-blue-500/50 transition-all group text-left"
            >
              <div className="w-14 h-14 bg-[#121212] border border-[#333] rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                {f.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">{f.desc}</p>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
