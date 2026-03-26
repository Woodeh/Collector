import React from 'react';
import { X } from 'lucide-react';

export default function GrailModal({
  isSelectOpen,
  setIsSelectOpen,
  allFigures,
  favoriteFigure,
  handleSelectFavorite,
}) {
  if (!isSelectOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-2xl rounded-[3rem] p-8 relative shadow-2xl max-h-[80vh] flex flex-col text-left">
        <button
          onClick={() => setIsSelectOpen(false)}
          className="absolute top-8 right-8 text-gray-500 hover:text-white cursor-pointer"
        >
          <X />
        </button>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 text-left">
          Select Main Grail
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar text-left">
          {allFigures.map((f) => (
            <div
              key={f.id}
              onClick={() => handleSelectFavorite(f.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                f.id === favoriteFigure?.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/5 bg-[#121212] hover:border-white/20'
              }`}
            >
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#222]">
                <img
                  src={f.previewImage || f.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="truncate text-left">
                <p className="text-white font-black uppercase italic text-sm truncate leading-tight group-hover:text-blue-400">
                  {f.name}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {f.anime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
