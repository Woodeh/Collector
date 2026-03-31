import React, { FC } from 'react';
import { motion as Motion } from 'framer-motion';
import { Shield } from 'lucide-react';

// Интерфейс для вложенного объекта ранга
interface RankProtocol {
  name: string;
  next: number;
  color: string;
  bg: string;
}

// Интерфейс для общей статистики
interface RankStats {
  count: number;
  rank: RankProtocol;
}

interface RankSectionProps {
  stats: RankStats | null | undefined;
}

const RankSection: FC<RankSectionProps> = ({ stats }) => {
  if (!stats?.rank) return null;

  const progressPercentage = Math.min((stats.count / stats.rank.next) * 100, 100);
  const unitsRemaining = Math.max(stats.rank.next - stats.count, 0);

  return (
    <div className="lg:col-span-7 bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] relative overflow-hidden group">
      {/* Background Decorative Icon */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Shield size={120} />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">
              Clearance Level
            </p>
            <h3
              className={`text-3xl font-black uppercase italic tracking-tighter ${stats.rank.color}`}
            >
              {stats.rank.name}
            </h3>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">
              Next Tier At
            </p>
            <p className="text-xl font-black text-white italic">{stats.rank.next} Units</p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Progress Bar Container */}
          <div className="h-3 w-full bg-[#121212] rounded-full overflow-hidden border border-white/5 p-0.5">
            <Motion.div
              initial={{ width: 0 }}
              whileInView={{
                width: `${progressPercentage}%`,
              }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'circOut' }}
              className={`h-full rounded-full ${stats.rank.bg} shadow-[0_0_15px_rgba(59,130,246,0.3)]`}
            />
          </div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center italic">
            {unitsRemaining} units remaining until next protocol upgrade
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankSection;
