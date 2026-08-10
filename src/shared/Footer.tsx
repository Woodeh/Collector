import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Database, Share2, Cpu, Instagram, Github, Info } from 'lucide-react';
import faceLogo from '../assets/face.png';
import { useI18n } from '../app/i18n/I18nProvider';

interface NavLink {
  name: string;
  path: string;
}

const Footer: FC = () => {
  const { t } = useI18n();
  const currentYear: number = new Date().getFullYear();

  const navLinks: NavLink[] = [
    { name: t('nav.collection'), path: '/collection' },
    { name: 'Statistics', path: '/stats' },
    { name: 'User Profile', path: '/profile' },
  ];

  return (
    <footer className="bg-[#111] border-t border-[#222] px-3 py-10 sm:px-5 sm:py-12 md:px-8 md:py-14 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10 mb-10 md:mb-12">
          {/* BRAND SECTION */}
          <div className="space-y-6 text-left">
            <Link to="/" className="flex items-center gap-3 select-none shrink-0 w-fit cursor-pointer">
              <div className="w-10 h-10 rounded-full border border-[#333] overflow-hidden">
                <img src={faceLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="uppercase text-white tracking-tighter font-black text-xl italic leading-none">
                Figure.<span className="text-blue-500">Collector</span>
              </span>
            </Link>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.15em] leading-relaxed italic max-w-[220px]">
              {t('footer.description')}
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-5 md:mb-6 flex items-center gap-2 italic">
              <Database size={12} /> {t('footer.navigation')}
            </h4>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic w-fit cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* COMMUNITY */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-5 md:mb-6 flex items-center gap-2 italic">
              <Share2 size={12} /> {t('footer.community')}
            </h4>
            <nav className="flex flex-col gap-4">
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group cursor-pointer"
              >
                <Instagram size={14} className="group-hover:text-pink-500 transition-colors" />{' '}
                Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group cursor-pointer"
              >
                <Github size={14} className="group-hover:text-white transition-colors" /> Repository
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group cursor-pointer"
              >
                <Info size={14} className="group-hover:text-blue-500 transition-colors" /> Support
              </a>
            </nav>
          </div>

          {/* SYSTEM INFO */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-5 md:mb-6 flex items-center gap-2 italic">
              <Cpu size={12} /> {t('footer.system')}
            </h4>
            <div className="space-y-3 p-5 bg-[#161616] rounded-2xl border border-[#222] shadow-inner">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                  {t('footer.network')}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span className="text-[10px] text-white font-black uppercase italic">{t('footer.active')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                  {t('footer.version')}
                </span>
                <span className="text-[10px] text-white font-mono opacity-80">v1.2.0_STABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-7 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] italic">
            {t('footer.madeFor')} <Heart size={10} className="text-red-600 fill-red-600" />
          </div>

          <div className="flex items-center gap-4 text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">
            <span>&copy; {currentYear} FIGURE COLLECTOR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
