import React, { FC } from 'react';
import { Zap } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

interface FinalCTAProps {
  onLogin: () => void;
}

const FinalCTA: FC<FinalCTAProps> = ({ onLogin }) => {
  const { t } = useI18n();
  return (
    <section className="relative px-3 pb-16 sm:px-5 sm:pb-24 md:px-8 md:pb-28 z-10">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] rounded-[3.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
        <div className="bg-[#121212] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 text-center space-y-6 md:space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 -z-10" />

          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            {t('landing.ctaTitle')}
          </h2>

          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest italic max-w-lg mx-auto leading-relaxed">
            {t('landing.ctaDesc')}
          </p>

          <button
            type="button"
            onClick={onLogin}
            className="px-6 sm:px-10 py-4 sm:py-5 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer shadow-xl"
          >
            {t('nav.access')} <Zap size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
