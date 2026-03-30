import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Globe, Lock, ArrowRight } from 'lucide-react';
import FigureCard from '../collection/FigureCard';

const CommunityTeaser = ({ loading, communityFigures, onJoin }) => {
  return (
    <section
      id="community-scan"
      className="relative py-24 px-4 bg-[#0d0d0d]/80 backdrop-blur-sm border-y border-[#333] z-10"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Globe size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Global Network
              </span>
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              Live Database <span className="text-blue-500">Scan.</span>
            </h2>
          </div>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest max-w-xs md:text-right italic">
            Scanning real-time additions to the collective vault. Join to contribute your own
            assets.
          </p>
        </div>

        {/* INFINITE MARQUEE CAROUSEL */}
        {!loading && communityFigures.length > 0 ? (
          <div className="relative overflow-hidden py-10 opacity-70 pointer-events-none select-none grayscale-[0.4] blur-[0.3px] min-h-[400px]">
            <Motion.div
              className="flex gap-6 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 80,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[...communityFigures, ...communityFigures, ...communityFigures].map(
                (figure, idx) => (
                  <div key={`${figure.id}-${idx}`} className="w-48 md:w-64 shrink-0">
                    <FigureCard figure={figure} isCommunity={true} />
                  </div>
                ),
              )}
            </Motion.div>

            {/* Виньетка по краям для глубины */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent z-10" />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#333] rounded-[2rem] opacity-20">
            <p className="font-black uppercase tracking-widest text-xs italic">
              Initialising Data Stream...
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onJoin}
            className="group text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 hover:text-white transition-colors flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Lock size={14} /> Join to view full database{' '}
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunityTeaser;
