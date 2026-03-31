import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Target, ChevronRight, Fingerprint, ShieldCheck } from 'lucide-react';

// Интерфейс для данных объекта Spotlight
interface SpotlightFigure {
  id: string;
  name: string;
  anime: string;
  price: string | number;
  brand: string;
  previewImage?: string;
  image?: string;
  category?: string;
}

interface SpotlightCardProps {
  spotlight: SpotlightFigure | null | undefined;
}

const SpotlightCard: FC<SpotlightCardProps> = ({ spotlight }) => {
  if (!spotlight) return null;

  return (
    <div className="relative group w-full">
      {/* Background Accent Glow */}
      <div className="absolute -inset-1 bg-blue-500/5 rounded-[2.5rem] md:rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />

      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-[#333] bg-[#141414] shadow-2xl transition-all hover:border-blue-500/30">
        {/* Stylish Tech Background Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:120px_120px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5" />

        <div className="flex flex-col md:flex-row">
          {/* Visual Section */}
          <div className="w-full md:w-[35%] aspect-[4/5] md:aspect-auto overflow-hidden md:border-r border-[#333] bg-[#0a0a0a] relative group/img">
            <img
              src={spotlight.previewImage || spotlight.image}
              className="w-full h-full object-cover"
              alt={spotlight.name}
            />

            {/* Technical Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />

            {/* Scanline Animation */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] -translate-y-full group-hover:animate-scan" />

            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[7px] font-black font-mono text-blue-400 uppercase tracking-widest">
                Ref_ID: {spotlight.id.slice(0, 8)}
              </div>
              <div className="px-2 py-1 bg-blue-500/20 backdrop-blur-md rounded border border-blue-500/30 text-[7px] font-black text-white uppercase tracking-widest italic flex items-center gap-1">
                <ShieldCheck size={8} /> Verified_Asset
              </div>
            </div>
          </div>

          {/* Data Section */}
          <div className="p-8 sm:p-10 md:p-14 flex-1 text-left flex flex-col justify-center relative">
            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-blue-500" />
                  <span className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">
                    System_Featured_Unit
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                  {spotlight.name}
                </h2>
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] italic text-xs md:text-sm">
                  {spotlight.anime}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-[#333]">
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                    Manufacturer
                  </p>
                  <div className="flex items-center gap-2">
                    <Box size={14} className="text-blue-500" />
                    <p className="text-white text-sm font-black uppercase italic truncate">
                      {spotlight.brand}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                    Specification
                  </p>
                  <div className="flex items-center gap-2">
                    <Fingerprint size={14} className="text-blue-500" />
                    <p className="text-white text-sm font-black uppercase italic">
                      {spotlight.category || 'Scale_Unit'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4">
                <div className="space-y-1">
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest italic">
                    Current_Market_Valuation
                  </p>
                  <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-none">
                    <span className="text-blue-500 text-2xl mr-1">$</span>
                    {Number(spotlight.price).toLocaleString()}
                  </p>
                </div>

                <Link
                  to={`/figure/${spotlight.id}`}
                  className="flex items-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl active:scale-95"
                >
                  Access Archive <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightCard;
