import React, { useState, useRef, useEffect } from 'react';
import { Tag, Trash2, Pencil, User, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FigureCard({ figure, onEdit, onDelete, isCommunity = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="relative group bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full text-left font-sans">
      {/* Action Menu (Три точки) */}
      {(onEdit || onDelete) && (
        <div
          className="absolute top-4 right-4 z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 md:-translate-y-2 md:group-hover:translate-y-0"
          ref={menuRef}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Чтобы не сработал переход по ссылке карточки
              setShowMenu(!showMenu);
            }}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
              showMenu
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <MoreVertical size={18} />
          </button>

          {/* Выпадающий список */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest text-gray-400 hover:bg-blue-600/10 hover:text-blue-500 transition-all border-b border-[#333]/50 last:border-0"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <Link
        to={`/figure/${figure.id}`}
        className="flex flex-col h-full cursor-pointer relative z-10"
      >
        {/* IMAGE SECTION */}
        <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
          <img
            src={figure.previewImage || figure.image}
            alt={figure.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
          />

          {/* Градиент для читаемости плашки */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* AUTHOR BADGE: Показываем только в Community, ПОВЕРХ фото, СНИЗУ */}
          {isCommunity && (
            <div className="absolute bottom-4 left-4 z-30">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <span className="text-[9px] font-black uppercase text-white tracking-tight italic">
                  {figure.authorName || 'Anonymous'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            {/* TOP INFO ROW */}
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

            {/* MAIN TITLE */}
            <div className="relative pl-4 border-l-[3px] border-blue-600 py-1">
              <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                {figure.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
                {figure.brand || 'Original'}
              </p>
            </div>
          </div>

          {/* PRICE BAR */}
          <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-40">
              <Tag size={14} className="text-blue-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-white italic">
                Price
              </span>
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-1">
              {Math.round(Number(figure.price) || 0).toLocaleString()}
              <span className="text-blue-500 not-italic text-xl ml-1">$</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
