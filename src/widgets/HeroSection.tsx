import React, { FC } from 'react';
import { motion as Motion, MotionValue } from 'framer-motion';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  // Motion values usually come from useScroll or useTransform
  titleY: MotionValue<number> | number;
  opacityHero: MotionValue<number> | number;
  descY: MotionValue<number> | number;
  onLogin: () => void;
  onExplore: () => void;
}

const HeroSection: FC<HeroSectionProps> = ({ titleY, opacityHero, descY, onLogin, onExplore }) => {
  return (
    <section className="relative pt-20 pb-32 px-4 z-10">
      <div className="max-w-7xl mx-auto text-center space-y-8 relative">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ y: titleY, opacity: opacityHero }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-full mb-4 mx-auto">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">
              System Status: Ready to Initialize
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
            The Ultimate <br />
            <span className="text-blue-600">Collector's</span> Vault.
          </h1>
        </Motion.div>

        <Motion.p
          style={{ y: descY, opacity: opacityHero }}
          className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest italic"
        >
          Archiving the world's finest figures. Secure, analytical, and community-driven.
        </Motion.p>

        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20"
        >
          <button
            type="button"
            onClick={onLogin}
            className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase italic tracking-widest text-white transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 cursor-pointer"
          >
            Initialize My Vault <ChevronRight size={20} />
          </button>

          <button
            type="button"
            onClick={onExplore}
            className="w-full sm:w-auto px-10 py-5 bg-[#1a1a1a] border border-[#333] hover:border-gray-600 rounded-2xl font-black uppercase italic tracking-widest text-gray-400 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            Explore Catalog
          </button>
        </Motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
