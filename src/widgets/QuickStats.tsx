import React, { FC } from 'react';
import { ShieldCheck, Coins, Factory, BarChart3 } from 'lucide-react';

// Интерфейс для данных статистики
interface Stats {
  totalValue: number;
  topBrand: string;
}

interface QuickStatsProps {
  stats: Stats;
}

const QuickStats: FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="relative group w-full lg:w-auto lg:min-w-[380px]">
      {/* Subtle Site Accent Glow */}
      <div className="absolute -inset-0.5 bg-blue-500/10 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-700" />

      <div className="relative bg-[#1a1a1a] border border-[#333] p-8 md:p-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Background "Ghost" Icon */}
        <BarChart3
          className="absolute -bottom-10 -right-10 text-blue-500/5 rotate-[-15deg]"
          size={240}
        />

        {/* Top Header Section */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping absolute inset-0" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full relative" />
            </div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">
              Portfolio Metrics
            </h4>
          </div>
          <div className="text-[7px] font-black text-gray-500 border border-[#333] px-2 py-1 rounded tracking-widest uppercase italic">
            SYNC.LIVE
          </div>
        </div>

        <div className="space-y-12 relative z-10">
          {/* TOTAL WORTH */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 opacity-50">
              <Coins size={12} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e4e4e4]">
                Total Assets Value
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-500 italic tracking-tighter">$</span>
              <p className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
                {stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* DOMINANT BRAND */}
          <div className="pt-10 border-t border-[#333]">
            <div className="flex items-center justify-between group/brand">
              <div className="space-y-3">
                <div className="flex items-center gap-2 opacity-50">
                  <Factory size={12} className="text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e4e4e4]">
                    Primary Source
                  </span>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight leading-none truncate max-w-[200px]">
                    {stats.topBrand}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-blue-500/60">
                    <ShieldCheck size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest italic">
                      Authenticity Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Analyzer visual */}
              <div className="flex gap-1 items-end h-10 opacity-10 group-hover/brand:opacity-30 transition-opacity duration-500">
                {[0.4, 0.8, 0.5, 1, 0.6, 0.9].map((val, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-blue-500 rounded-full"
                    style={{ height: `${val * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer System Lines */}
        <div className="mt-12 flex items-center gap-4 opacity-20">
          <div className="h-px flex-1 bg-[#333]" />
          <div className="text-[6px] font-black text-gray-600 uppercase tracking-[1em] whitespace-nowrap italic">
            SECURE_DATA_LINK
          </div>
          <div className="h-px flex-1 bg-[#333]" />
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
