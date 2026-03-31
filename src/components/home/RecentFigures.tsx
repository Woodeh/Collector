import React, { FC } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight, LayoutGrid } from 'lucide-react';

// Интерфейс для данных фигурки
interface Figure {
  id: string;
  name: string;
  anime: string;
  price: string | number;
  previewImage?: string;
  image?: string;
}

interface RecentFiguresProps {
  recentFigures: Figure[];
}

const RecentFigures: FC<RecentFiguresProps> = ({ recentFigures }) => {
  return (
    <Motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between border-b border-[#333] pb-6">
        <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
          <Zap size={24} className="text-blue-500" /> Latest Logged Units
        </h2>
        <Link
          to="/collection"
          className="group bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 hover:border-blue-500 hover:text-white transition-all"
        >
          Access Archive{' '}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {recentFigures.map((figure, idx) => (
          <Motion.div
            key={figure.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={`/figure/${figure.id}`}
              className="group block bg-[#1a1a1a] rounded-[1.8rem] border border-[#333] overflow-hidden hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 h-full text-left"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#121212] relative">
                <img
                  src={figure.previewImage || figure.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  alt={figure.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-80"></div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg">
                  <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">
                    New Entry
                  </p>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg">
                  <p className="text-[9px] font-black text-white italic">
                    ${Number(figure.price).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em] truncate mb-1 italic opacity-70">
                  {figure.anime}
                </p>
                <h3 className="text-xs font-black text-white uppercase italic truncate leading-tight tracking-wide">
                  {figure.name}
                </h3>
              </div>
            </Link>
          </Motion.div>
        ))}

        {recentFigures.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-[#333] rounded-[2.5rem] opacity-20">
            <LayoutGrid size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase italic tracking-[0.2em]">Database Empty</p>
          </div>
        )}
      </div>
    </Motion.section>
  );
};

export default RecentFigures;
