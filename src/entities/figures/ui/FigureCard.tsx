import React, { useState, useRef, useEffect, FC, MouseEvent as ReactMouseEvent } from 'react';
import { Tag, Trash2, Pencil, User, MoreVertical, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Figure } from '../../../types/figure';
import { useI18n } from '../../../app/i18n/I18nProvider';
import ImageWithFallback from '../../../shared/ImageWithFallback';

interface FigureCardProps {
  figure: Figure;
  onEdit?: () => void;
  onDelete?: () => void;
  isCommunity?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const FigureCard: FC<FigureCardProps> = ({ 
  figure, 
  onEdit, 
  onDelete, 
  isCommunity = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleMenuToggle = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className={`ui-card figure-card-interactive relative group border overflow-hidden transition-[transform,border-color,box-shadow] duration-300 flex flex-col h-full text-left font-sans ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : ''}`}>
      <span className="figure-card-accent" aria-hidden="true" />
      {selectionMode && (
        <button type="button" onClick={onToggleSelection} aria-label={figure.name} aria-pressed={isSelected} className={`absolute left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-xl border shadow-lg backdrop-blur-md ${isSelected ? 'border-blue-400 bg-blue-600 text-white' : 'border-white/20 bg-black/70 text-transparent'}`}>
          <Check size={18} />
        </button>
      )}
      {/* Action Menu (Три точки) */}
      {!selectionMode && (onEdit || onDelete) && (
        <div
          className="absolute top-4 right-4 z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 md:-translate-y-2 md:group-hover:translate-y-0"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={handleMenuToggle}
            aria-label={`${t('common.edit')} / ${t('common.delete')}`}
            aria-expanded={showMenu}
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest text-gray-400 hover:bg-blue-600/10 hover:text-blue-500 transition-all border-b border-[#333]/50 last:border-0 cursor-pointer"
                >
                  <Pencil size={14} />
                  <span>{t('common.edit')}</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{t('common.delete')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <Link
        to={`/figure/${figure.id}`}
        onClick={(event) => { if (selectionMode) { event.preventDefault(); onToggleSelection?.(); } }}
        className="flex flex-col h-full cursor-pointer relative z-10"
      >
        {/* IMAGE SECTION */}
        <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
          <ImageWithFallback
            src={figure.previewImage || figure.image}
            alt={figure.name}
            loading="lazy"
            wrapperClassName="h-full w-full"
            className="w-full h-full object-cover brightness-[0.9] group-hover:brightness-100"
          />

          {/* Градиент для читаемости плашки */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* AUTHOR BADGE: Показываем только в Community */}
          {isCommunity && (
            <div className="absolute bottom-4 left-4 z-30">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <span className="text-[9px] font-black uppercase text-white tracking-tight italic">
                  {figure.authorName || t('common.anonymous')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            {/* TOP INFO ROW */}
            <div className="flex items-center">
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.25em] italic truncate max-w-[80%]">
                {figure.anime}
              </span>
            </div>

            {/* MAIN TITLE */}
            <div className="relative pl-4 border-l-[3px] border-blue-600 py-1">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                {figure.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
                {figure.brand || 'Original'}
              </p>
            </div>
          </div>

          {!isCommunity && (
            <div className="mt-5 sm:mt-8 pt-4 sm:pt-5 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 opacity-40">
                <Tag size={14} className="text-blue-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white italic">
                  {t('common.price')}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter flex items-center gap-1">
                {Math.round(Number(figure.price) || 0).toLocaleString()}
                <span className="text-blue-500 not-italic text-xl ml-1">$</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default FigureCard;
