import React from 'react';
import { Info } from 'lucide-react';

export default function MainGrail({ favoriteFigure, setIsSelectOpen, navigate }) {
  return (
    <div className="lg:col-span-4 relative group/container text-left">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-[3rem] shadow-3xl h-full overflow-hidden flex flex-col relative z-10 transition-all duration-500 group hover:border-blue-500/30">
        <button
          onClick={() => setIsSelectOpen(true)}
          className="absolute top-6 left-6 z-40 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-xl transition-all active:scale-95 text-[10px] font-black uppercase italic tracking-widest cursor-pointer text-left"
        >
          Switch Grail
        </button>
        <button
          onClick={() => navigate(`/figure/${favoriteFigure?.id}`)}
          className="absolute top-6 right-6 z-40 bg-black/40 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer hover:bg-white hover:text-black"
        >
          <Info size={20} />
        </button>
        {favoriteFigure ? (
          <div className="h-full relative flex flex-col">
            <div className="flex-1 overflow-hidden relative">
              <img
                src={favoriteFigure.previewImage || favoriteFigure.image}
                className="w-full h-full object-cover transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105"
                alt="favorite"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent text-left pointer-events-none">
                <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1 italic leading-none">
                  {favoriteFigure.anime}
                </p>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 text-left">
                  {favoriteFigure.name}
                </h3>
                <div className="flex items-center gap-3 text-left">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest border-r border-white/10 pr-3 italic leading-none">
                    Main grail
                  </span>
                  <span className="text-2xl font-black text-white italic tracking-tight leading-none">
                    ${favoriteFigure.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-10 font-black italic text-left">
            Empty Shelf
          </div>
        )}
      </div>
    </div>
  );
}
