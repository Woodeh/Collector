import React from 'react';
import { Tag, Trash2, Pencil, ExternalLink, CheckCircle, Heart } from 'lucide-react';

export default function WishlistCard({ item, onEdit, onDelete, onGotIt }) {
  return (
    <div className="relative group bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-pink-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full text-left">
      {/* Кнопки управления (Pencil и Trash) */}
      <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(item);
          }}
          className="bg-black/60 hover:bg-blue-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(item.id);
          }}
          className="bg-black/60 hover:bg-red-600 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Фото секция */}
      <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.8] group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <Heart size={48} />
          </div>
        )}
        {/* Жирную розовую полосу слева УДАЛИЛ */}
      </div>

      {/* Инфо секция */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-pink-500 font-black uppercase tracking-[0.25em] italic truncate max-w-[80%]">
              {item.anime}
            </span>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Имя с полоской (оставил розовую полоску только у текста для стиля) */}
          <div className="relative pl-4 border-l-[3px] border-pink-600 py-1">
            <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-pink-400 transition-colors truncate">
              {item.name}
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
              {item.brand || 'Target Grail'}
            </p>
          </div>
        </div>

        {/* Футер карточки */}
        <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 opacity-40">
              <Tag size={12} className="text-pink-500" />
              <span className="text-[9px] uppercase font-black tracking-widest text-white italic">
                Est. Price
              </span>
            </div>
            <div className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-1">
              {Number(item.price).toLocaleString()}
              <span className="text-pink-500 not-italic text-lg ml-1">$</span>
            </div>
          </div>

          <button
            onClick={() => onGotIt(item)}
            className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-black uppercase italic text-[10px] cursor-pointer border border-green-500/20 hover:border-green-600 shadow-lg active:scale-95"
          >
            <CheckCircle size={14} />
            <span>Got it</span>
          </button>
        </div>
      </div>
    </div>
  );
}
