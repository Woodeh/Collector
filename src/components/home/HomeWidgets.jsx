import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Target, ChevronRight } from 'lucide-react';

const HomeWidgets = ({ widgetStats }) => {
  return (
    <Motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10"
    >
      <Link
        to="/preorders"
        className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-orange-500/30 transition-all shadow-xl"
      >
        <div className="flex items-center gap-8">
          <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
            <Clock size={32} />
          </div>
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
              Status: Incoming Supply
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              Pre-orders Log
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
              {widgetStats.preorders} units pending arrival
            </p>
          </div>
        </div>
        <ChevronRight
          className="text-orange-500 group-hover:translate-x-2 transition-transform"
          size={28}
        />
      </Link>

      <Link
        to="/wishlist"
        className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-between hover:border-pink-500/30 transition-all group shadow-xl"
      >
        <div className="flex items-center gap-8">
          <div className="p-5 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
            <Target size={32} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">
              System Priority: High
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              Target Wishlist
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">
              Monitoring {widgetStats.wishlist} desired assets
            </p>
          </div>
        </div>
        <ChevronRight
          className="text-pink-500 group-hover:translate-x-2 transition-transform"
          size={28}
        />
      </Link>
    </Motion.section>
  );
};

export default HomeWidgets;
