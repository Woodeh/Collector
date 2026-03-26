import React from 'react';
import { Zap } from 'lucide-react';

export default function QuickStats({ stats }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full lg:min-w-[360px] lg:w-auto relative overflow-hidden group">
      <div className="absolute top-4 right-6 md:top-6 md:right-8 p-2 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl text-blue-500 animate-pulse">
        <Zap size={18} fill="currentColor" />
      </div>
      <h4 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 md:mb-10 italic">
        Portfolio Intelligence
      </h4>
      <div className="space-y-8 md:space-y-12">
        <div>
          <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
            Total Collection Value
          </p>
          <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
            ${stats.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="pt-6 md:pt-10 border-t border-[#333] flex justify-between items-end gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6 flex-1">
            <div>
              <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
                Dominant Brand
              </p>
              <p className="text-lg md:text-xl font-black text-white italic uppercase truncate max-w-[120px] sm:max-w-none">
                {stats.topBrand}
              </p>
            </div>
            <div className="h-1 w-full bg-[#121212] rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 w-[60%]"></div>
              <div className="h-full bg-blue-500/40 w-[25%]"></div>
              <div className="h-full bg-blue-500/10 w-[15%]"></div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-600 text-[8px] md:text-[9px] uppercase font-black tracking-widest mb-1">
              Collector Rank
            </p>
            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase italic leading-tight">
              {stats.rank}
            </p>
            <p className="text-gray-500 text-[9px] md:text-[10px] font-bold mt-1">
              ({stats.count} Pcs)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
