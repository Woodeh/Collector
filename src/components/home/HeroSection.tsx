import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { useI18n } from '../../app/i18n/I18nProvider';

interface HeroSectionProps {
  // Using the User type from Firebase auth, or a partial if you prefer
  user: User | { displayName: string | null, email: string | null };
}

const HeroSection: FC<HeroSectionProps> = ({ user }) => {
  const { t } = useI18n();
  const name = user.displayName || user.email?.split('@')[0] || 'Collector';
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 md:gap-16">
      <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 lg:pt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
          {t('home.heroLine1')} <br />
          <span className="text-blue-500 animate-blink">{t('home.heroLine2')}</span>
        </h1>

        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] max-w-xl mx-auto lg:mx-0">
          {t('home.welcome', { name })}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
          <Link
            to="/add"
            className="ui-button bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-10 py-4 md:py-5 font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.22)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3"
          >
            <PlusCircle size={20} /> {t('home.addFigure')}
          </Link>

          <Link
            to="/collection"
            className="ui-button bg-[#1a1a1a] border border-[#333] hover:border-white hover:bg-white hover:text-black text-white px-8 md:px-10 py-4 md:py-5 font-black uppercase italic tracking-widest text-center"
          >
            {t('home.viewCollection')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
