import React from 'react';
import { Tag, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FigureCard({ figure, onEdit, onDelete }) {
  return (
    <div className="relative group bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full text-left">
      <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="bg-black/60 hover:bg-blue-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="bg-black/60 hover:bg-red-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <Link to={`/figure/${figure.id}`} className="flex flex-col h-full cursor-pointer">
        <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
          <img
            src={figure.previewImage || figure.image}
            alt={figure.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
          />
        </div>

        <div className="p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.25em] italic truncate max-w-[80%]">
                {figure.anime}
              </span>
              <div
                className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${
                  figure.gender === 'Female'
                    ? 'border-pink-500/30 text-pink-500'
                    : 'border-blue-500/30 text-blue-500'
                }`}
              >
                {figure.gender === 'Female' ? 'F' : 'M'}
              </div>
            </div>

            <div className="relative pl-4 border-l-[3px] border-blue-600 py-1">
              <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                {figure.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
                {figure.brand || 'Original'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-40">
              <Tag size={14} className="text-blue-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-white italic">
                Price
              </span>
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-1">
              {Number(figure.price).toLocaleString()}
              <span className="text-blue-500 not-italic text-xl ml-1">$</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
