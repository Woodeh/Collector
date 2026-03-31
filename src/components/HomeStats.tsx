import React, { FC } from 'react';
import { Zap } from 'lucide-react';

interface StatsData {
  totalValue?: number;
  topBrand?: string;
  rank?: string;
  count?: number;
}

interface HomeStatsProps {
  stats: StatsData | null | undefined;
}

export const HomeStats: FC<HomeStatsProps> = ({ stats }) => (
  <div className="bg-[#1a1a1a] border border-[#333] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full lg:min-w-[360px] lg:w-auto relative overflow-hidden group">
    <div className="absolute top-4 right-6 p-2 bg-blue-500/10 rounded-xl text-blue-500 animate-pulse">
      <Zap size={18} fill="currentColor" />
    </div>

    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic mb-6">
      Portfolio Intelligence
    </h4>

    <div className="space-y-8">
      <div>
        <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
          Total Collection Value
        </p>
        <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
          ${stats?.totalValue?.toLocaleString() || 0}
        </p>
      </div>

      <div className="pt-6 border-t border-[#333] flex justify-between items-end gap-6">
        <div className="space-y-4 flex-1">
          <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
            Dominant Brand
          </p>
          <p className="text-lg font-black text-white italic uppercase truncate">
            {stats?.topBrand || 'N/A'}
          </p>
          <div className="h-1 w-full bg-[#121212] rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500 w-[60%]"></div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-gray-600 text-[9px] uppercase font-black tracking-widest mb-1">
            {stats?.rank || 'Novice'}
          </p>
          <p className="text-gray-500 text-[10px] font-bold">({stats?.count || 0} Pcs)</p>
        </div>
      </div>
    </div>
  </div>
);
