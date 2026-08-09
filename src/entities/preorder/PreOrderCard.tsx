import { useEffect, useRef, useState, type FC, type MouseEvent as ReactMouseEvent } from 'react';
import { Calendar, CheckCircle2, Clock, ExternalLink, ImageIcon, MoreVertical, Tag, Trash2 } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';
import { getContactCycleStatus, getLastContactDate } from './contactCycle';
import type { PreOrder } from './model';

interface PreOrderCardProps {
  item: PreOrder;
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
  onContacted: (item: PreOrder) => Promise<void>;
}

const PreOrderCard: FC<PreOrderCardProps> = ({ item, onDelete, onImageClick, onContacted }) => {
  const { locale, t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [contactUpdating, setContactUpdating] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const cycle = getContactCycleStatus(item, now);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const statusText = cycle.status === 'overdue'
    ? t('preorders.overdueBy', { count: cycle.overdueDays })
    : t(cycle.status === 'due_soon' ? 'preorders.contactDueSoon' : 'preorders.contactOnTrack', { count: cycle.daysRemaining });
  const statusColor = cycle.status === 'overdue' ? 'text-red-500' : cycle.status === 'due_soon' ? 'text-orange-500' : 'text-green-500';

  const handleMenuToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowMenu((open) => !open);
  };

  const handleContacted = async () => {
    setContactUpdating(true);
    try {
      await onContacted(item);
      setNow(new Date());
    } finally {
      setContactUpdating(false);
    }
  };

  return (
    <article className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-[#1a1a1a] text-left shadow-2xl transition-all ${cycle.status === 'overdue' ? 'border-red-500/40' : 'border-[#333] hover:border-orange-500/40'}`}>
      <div className="absolute right-4 top-4 z-50" ref={menuRef}>
        <button type="button" onClick={handleMenuToggle} className="rounded-xl border border-white/10 bg-black/60 p-2 text-gray-400 backdrop-blur-md"><MoreVertical size={18} /></button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-[#333] bg-[#1a1a1a] shadow-2xl">
            <button type="button" onClick={() => onDelete(item.id)} className="flex w-full items-center gap-3 px-4 py-3 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10"><Trash2 size={14} />{t('common.delete')}</button>
          </div>
        )}
      </div>

      <div className="relative aspect-[10/8] overflow-hidden border-b border-[#333]/50 bg-[#121212]">
        {item.screenshot ? (
          <button type="button" className="h-full w-full cursor-zoom-in" onClick={() => onImageClick(item.screenshot!)}>
            <img src={item.screenshot} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
          </button>
        ) : <div className="flex h-full items-center justify-center"><ImageIcon className="text-gray-800" size={48} /></div>}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{item.anime}</span>
          <span className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black text-gray-400"><Calendar size={10} />{item.releaseDate}</span>
        </div>
        <h3 className="truncate border-l-[3px] border-blue-600 pl-4 text-xl font-black uppercase italic tracking-tight text-white">{item.name}</h3>
        <p className="mt-1 truncate pl-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.brand || 'Original Character'}</p>
        {item.sellerName && <p className="mt-4 text-xs font-bold text-gray-300">{t('preorders.seller')}: <span className="text-white">{item.sellerName}</span></p>}

        <div className="my-5 rounded-2xl border border-white/5 bg-[#121212] p-4">
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${statusColor}`}><Clock size={14} />{statusText}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[9px] font-bold uppercase text-gray-600">
            <div><span className="block">{t('preorders.lastContact')}</span><strong className="mt-1 block text-gray-300">{dateFormat.format(getLastContactDate(item))}</strong></div>
            <div><span className="block">{t('preorders.nextContact')}</span><strong className="mt-1 block text-gray-300">{dateFormat.format(cycle.nextContactDate)}</strong></div>
          </div>
          <p className="mt-3 text-[9px] font-bold uppercase text-gray-600">{t('preorders.contactCount', { count: item.contactCount ?? 0 })}</p>
          <div className="mt-4 flex flex-col gap-2">
            {item.sellerContactUrl && <a href={item.sellerContactUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-[10px] font-black uppercase text-orange-400"><ExternalLink size={13} />{t('preorders.openContact')}</a>}
            <button type="button" disabled={contactUpdating} onClick={handleContacted} className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-[10px] font-black uppercase text-white transition hover:bg-orange-500 disabled:opacity-50"><CheckCircle2 size={14} />{t('preorders.contactedToday')}</button>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-white/5 pt-5">
          <div className="flex justify-between text-[10px] font-black uppercase text-gray-500"><span>{t('preorders.deposit')}</span><span className="text-green-500">${Math.round(item.deposit).toLocaleString()}</span></div>
          <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500"><Tag size={13} />{t('preorders.total')}</span><span className="text-2xl font-black italic text-white">${Math.round(item.totalPrice).toLocaleString()}</span></div>
        </div>
      </div>
    </article>
  );
};

export default PreOrderCard;
