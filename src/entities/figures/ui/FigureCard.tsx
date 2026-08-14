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
        <button type="button" onClick={onToggleSelection} aria-label={figure.name} aria-pressed={isSelected} className={`absolute left-2 top-2 z-[60] flex h-8 w-8 items-center justify-center rounded-lg border shadow-lg backdrop-blur-md sm:left-4 sm:top-4 sm:h-9 sm:w-9 sm:rounded-xl ${isSelected ? 'border-blue-400 bg-blue-600 text-white' : 'border-white/20 bg-black/70 text-transparent'}`}>
          <Check size={16} />
        </button>
      )}
      {/* Action Menu (Три точки) */}
      {!selectionMode && (onEdit || onDelete) && (
        <div
          className="absolute right-2 top-2 z-50 translate-y-0 opacity-100 transition-all duration-300 md:right-4 md:top-4 md:-translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={handleMenuToggle}
            aria-label={`${t('common.edit')} / ${t('common.delete')}`}
            aria-expanded={showMenu}
            className={`rounded-lg border p-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer sm:rounded-xl sm:p-2 ${
              showMenu
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <MoreVertical size={16} />
          </button>

          {/* Выпадающий список */}
          {showMenu && (
            <div className="absolute right-0 mt-1.5 w-28 overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 sm:mt-2 sm:w-32 sm:rounded-2xl">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 border-b border-[#333]/50 px-3 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-400 transition-all last:border-0 hover:bg-blue-600/10 hover:text-blue-500 sm:gap-3 sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-widest cursor-pointer"
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
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-red-500/70 transition-all hover:bg-red-500/10 hover:text-red-500 sm:gap-3 sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-widest cursor-pointer"
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
            <div className="absolute bottom-2 left-2 right-2 z-30 sm:bottom-4 sm:left-4 sm:right-auto">
              <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2 py-1 shadow-xl backdrop-blur-md sm:gap-2 sm:rounded-xl sm:px-3 sm:py-1.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <User size={10} className="text-white" />
                </div>
                <span className="truncate text-[9px] font-black uppercase text-white tracking-tight italic">
                  {figure.authorName || t('common.anonymous')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="flex flex-grow flex-col justify-between p-3 sm:p-5">
          <div className="space-y-2.5 sm:space-y-4">
            {/* TOP INFO ROW */}
            <div className="flex items-center">
              <span className="max-w-full truncate text-[9px] font-black uppercase tracking-[0.12em] text-blue-500 italic sm:max-w-[80%] sm:text-[10px] sm:tracking-[0.25em]">
                {figure.anime}
              </span>
            </div>

            {/* MAIN TITLE */}
            <div className="relative border-l-2 border-blue-600 py-0.5 pl-2.5 sm:border-l-[3px] sm:py-1 sm:pl-4">
              <h3 className="line-clamp-2 text-sm font-black uppercase italic leading-tight tracking-tighter text-white transition-colors group-hover:text-blue-400 sm:text-xl">
                {figure.name}
              </h3>
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wider text-gray-500 italic sm:text-[10px] sm:tracking-widest">
                {figure.brand || 'Original'}
              </p>
            </div>
          </div>

          {!isCommunity && (
            <div className="mt-3 flex items-center justify-end border-t border-white/5 pt-3 sm:mt-8 sm:justify-between sm:pt-5">
              <div className="hidden items-center gap-2 opacity-40 sm:flex">
                <Tag size={14} className="text-blue-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white italic">
                  {t('common.price')}
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-0.5 text-lg font-black italic tracking-tighter text-white sm:gap-1 sm:text-3xl">
                {Math.round(Number(figure.price) || 0).toLocaleString()}
                <span className="ml-0.5 text-sm not-italic text-blue-500 sm:ml-1 sm:text-xl">$</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default FigureCard;
