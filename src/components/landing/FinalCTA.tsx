import React, { FC } from 'react';
import { Zap } from 'lucide-react';

interface FinalCTAProps {
  onLogin: () => void;
}

const FinalCTA: FC<FinalCTAProps> = ({ onLogin }) => {
  return (
    <section className="relative pb-32 px-4 z-10">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] rounded-[3.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
        <div className="bg-[#121212] rounded-[3.4rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 -z-10" />

          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            Your collection <br /> deserves a <span className="text-blue-500">Legendary</span>{' '}
            status.
          </h2>

          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest italic max-w-lg mx-auto leading-relaxed">
            Start your journey today. Join hundreds of collectors tracking thousands of items in the
            most advanced figure management system.
          </p>

          <button
            type="button"
            onClick={onLogin}
            className="px-12 py-6 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer shadow-xl"
          >
            Access System <Zap size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
