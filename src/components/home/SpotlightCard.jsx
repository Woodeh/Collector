import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Target, ChevronRight } from 'lucide-react';

export default function SpotlightCard({ spotlight }) {
  if (!spotlight) return null;

  return (
    <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3.5rem] border border-[#333] bg-[#1a1a1a] shadow-2xl transition-all hover:border-blue-500/20">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 aspect-[4/5] md:aspect-[3/4] overflow-hidden md:border-r border-[#333] bg-[#121212] relative">
          <img
            src={spotlight.previewImage || spotlight.image}
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
            alt={spotlight.name}
          />
          <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-mono text-blue-400">
            <span>ID:{spotlight.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="p-6 sm:p-8 md:p-12 flex-1 text-left space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic">
            Featured Masterpiece
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            {spotlight.name}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] italic text-xs md:text-sm border-b border-[#333] pb-4 truncate max-w-full">
            {spotlight.anime}
          </p>
          <div className="grid grid-cols-2 gap-4 md:gap-x-10 md:gap-y-4 pt-2">
            <div className="flex items-center gap-2 md:gap-3">
              <Box size={12} className="text-blue-500" />
              <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase truncate">
                {spotlight.brand}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Target size={12} className="text-blue-500" />
              <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase">
                {spotlight.category || 'Scale'}
              </p>
            </div>
          </div>
          <div className="pt-4 md:pt-6 flex justify-between items-end border-t border-[#333]">
            <div>
              <p className="text-gray-600 text-[8px] md:text-[9px] uppercase font-black mb-1">
                Asset Value
              </p>
              <p className="text-3xl md:text-4xl font-black text-white italic tracking-tight leading-none">
                ${spotlight.price}
              </p>
            </div>
            <Link
              to={`/figure/${spotlight.id}`}
              className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase italic tracking-widest text-white border-b-2 border-blue-500 pb-1 hover:text-blue-500 transition-colors"
            >
              Open Data <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
