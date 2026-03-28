import React from 'react';

export default function NextArrival({ nextRelease, navigate }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl relative group overflow-hidden text-left">
      <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-6">
        Next Arrival
      </h4>
      {nextRelease ? (
        <div className="space-y-6 text-left">
          <div className="text-left">
            <p className="text-orange-500 font-black uppercase text-[9px] tracking-widest mb-1 italic leading-none text-left">
              {nextRelease.anime}
            </p>
            <h3 className="text-xl font-black text-white uppercase italic leading-tight truncate text-left">
              {nextRelease.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
              <p className="text-[7px] text-gray-500 uppercase font-bold mb-1 text-left">Release</p>
              <p className="text-[10px] font-black text-white leading-none text-left">
                {nextRelease.releaseDate}
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
              <p className="text-[7px] text-gray-500 uppercase font-bold mb-1 text-left">Brand</p>
              <p className="text-[10px] font-black text-white truncate leading-none text-left">
                {nextRelease.brand}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/preorders')}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center text-center"
          >
            Check Pre-orders
          </button>
        </div>
      ) : (
        <p className="opacity-20 uppercase font-black italic text-xs text-center py-10">
          Nothing pending
        </p>
      )}
    </div>
  );
}
