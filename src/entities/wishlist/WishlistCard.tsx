import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { Tag, Trash2, Pencil, ExternalLink, Heart, CheckCircle, MoreVertical } from 'lucide-react';
import type { WishlistItem } from './model';
import { useI18n } from '../../app/i18n/I18nProvider';
import ImageWithFallback from '../../shared/ImageWithFallback';

// Интерфейс для данных объекта в вишлисте
// Интерфейс пропсов компонента
interface WishlistCardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onGotIt: (item: WishlistItem) => void;
}

const WishlistCard: FC<WishlistCardProps> = ({ item, onEdit, onDelete, onGotIt }) => {
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const closeMenu = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [showMenu]);

  return (
    <div className="ui-card relative group border overflow-hidden hover:border-pink-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full text-left">
      {/* Кнопки управления (Pencil и Trash) */}
      <div ref={menuRef} className="absolute top-4 right-4 z-50 translate-y-0 opacity-100 transition-all duration-300 md:-translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <button
          type="button"
          aria-label={`${t('common.edit')} / ${t('common.delete')}`}
          aria-expanded={showMenu}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu((current) => !current);
          }}
          className={`rounded-xl p-2.5 text-white backdrop-blur-md transition-colors shadow-lg cursor-pointer ${showMenu ? 'bg-blue-600' : 'bg-black/60 hover:bg-blue-600'}`}
        >
          <MoreVertical size={16} />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl border border-[#333] bg-[#1a1a1a] shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onEdit(item); }} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"><Pencil size={14} />{t('common.edit')}</button>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onDelete(item.id); }} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-500/10"><Trash2 size={14} />{t('common.delete')}</button>
          </div>
        )}
      </div>

      {/* Фото секция */}
      <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative">
        {item.image ? (
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            loading="lazy"
            wrapperClassName="h-full w-full"
            className="w-full h-full object-cover group-hover:scale-110 brightness-[0.8] group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <Heart size={48} />
          </div>
        )}
      </div>

      {/* Инфо секция */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
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
                aria-label={t('details.openListing')}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

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
        <div className="mt-6 pt-4 sm:mt-8 sm:pt-5 border-t border-white/5 flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 opacity-40">
              <Tag size={12} className="text-pink-500" />
              <span className="text-[9px] uppercase font-black tracking-widest text-white italic">
                {t('common.price')}
              </span>
            </div>
            <div className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-1">
              {Number(item.price).toLocaleString()}
              <span className="text-pink-500 not-italic text-lg ml-1">$</span>
            </div>
          </div>

          <button
            onClick={() => onGotIt(item)}
            className="ui-button bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white px-4 py-2.5 flex items-center gap-2 font-black uppercase italic text-[10px] border border-green-500/20 hover:border-green-600 shadow-lg"
          >
            <CheckCircle size={14} />
            <span>{t('wishlist.gotIt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
