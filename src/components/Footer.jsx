import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Database, Share2, Cpu, Instagram, Github, Info } from 'lucide-react';
import faceLogo from '../assets/face.png'; // Путь к твоему лого

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111] border-t border-[#222] pt-16 pb-8 px-6 mt-20 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* BRAND SECTION (STATIC LOGO) */}
          <div className="space-y-6 text-left">
            <Link to="/" className="flex items-center gap-3 select-none shrink-0 w-fit">
              {/* Убраны все hover-эффекты: border и масштаб не меняются */}
              <div className="w-10 h-10 rounded-full border border-[#333] overflow-hidden">
                <img src={faceLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="uppercase text-white tracking-tighter font-black text-xl italic leading-none">
                Figure.<span className="text-blue-500">Collector</span>
              </span>
            </Link>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.15em] leading-relaxed italic max-w-[220px]">
              Your personal digital archive for anime figures. Organize, track, and showcase your
              shelf.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2 italic">
              <Database size={12} /> Navigation
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { name: 'My Collection', path: '/collection' },
                { name: 'Statistics', path: '/stats' },
                { name: 'Add Figure', path: '/add' },
                { name: 'User Profile', path: '/profile' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic w-fit"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* SOCIALS / COMMS */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2 italic">
              <Share2 size={12} /> Community
            </h4>
            <nav className="flex flex-col gap-4">
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group"
              >
                <Instagram size={14} className="group-hover:text-pink-500 transition-colors" />{' '}
                Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group"
              >
                <Github size={14} className="group-hover:text-white transition-colors" /> Repository
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all italic group"
              >
                <Info size={14} className="group-hover:text-blue-500 transition-colors" /> Support
              </a>
            </nav>
          </div>

          {/* SYSTEM INFO */}
          <div className="text-left">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2 italic">
              <Cpu size={12} /> System
            </h4>
            <div className="space-y-3 p-5 bg-[#161616] rounded-2xl border border-[#222] shadow-inner">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                  Network
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span className="text-[10px] text-white font-black uppercase italic">Active</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                  Version
                </span>
                <span className="text-[10px] text-white font-mono opacity-80">v1.2.0_STABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] italic">
            Developed with <Heart size={10} className="text-red-600 fill-red-600" /> for Collectors
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
