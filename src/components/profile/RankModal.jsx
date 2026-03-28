import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';

const ranks = [
  {
    name: 'Mythic Overlord',
    min: 500,
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    desc: 'Absolute dominance over the physical and digital realms. God-tier asset capacity.',
  },
  {
    name: 'Legendary Curator',
    min: 250,
    color: 'text-rose-500',
    bg: 'bg-rose-500',
    desc: 'A collection of immense proportions. You define the archive standards.',
  },
  {
    name: 'Master Architect',
    min: 100,
    color: 'text-purple-500',
    bg: 'bg-purple-500',
    desc: 'Designating space for triple-digit assets. High-end display protocol active.',
  },
  {
    name: 'Elite Hunter',
    min: 50,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    desc: 'High-value asset specialist. Significant market influence.',
  },
  {
    name: 'Veteran Tracker',
    min: 25,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500',
    desc: 'Experienced field operative. Extensive knowledge of rarity and procurement.',
  },
  {
    name: 'Active Collector',
    min: 10,
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    desc: 'Confirmed field operative. Multiple assets logged.',
  },
  {
    name: 'Apprentice',
    min: 5,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    desc: 'Basic database clearance established. Initializing serious acquisition.',
  },
  {
    name: 'Novice',
    min: 0,
    color: 'text-gray-500',
    bg: 'bg-gray-500',
    desc: 'Entry level access. Initializing database.',
  },
];

const RankModal = ({ isOpen, onClose, count }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            <div className="p-8 border-b border-[#333] bg-[#121212]/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <Award size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] italic mb-1">
                    System Protocol
                  </p>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Collector Ranks
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {ranks.map((r) => (
                <div
                  key={r.name}
                  className={`flex items-start gap-5 p-4 rounded-2xl border transition-all ${
                    count >= r.min
                      ? 'bg-blue-500/5 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                      : 'bg-[#121212] border-[#222] opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r.bg} text-white shadow-lg`}
                  >
                    <Award size={20} />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className={`font-black uppercase italic tracking-tight ${r.color}`}>
                        {r.name}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-600 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                        {r.min}+ units
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RankModal;
