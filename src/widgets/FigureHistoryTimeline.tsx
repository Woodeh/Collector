import { Camera, CircleDollarSign, Eye, FilePenLine, History, PackageCheck, Plus } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';
import type { FigureHistoryEvent, FigureHistoryEventType } from '../types/figure';

interface FigureHistoryTimelineProps { events: FigureHistoryEvent[] | undefined }

const eventConfig: Record<FigureHistoryEventType, { key: 'history.created' | 'history.details' | 'history.price' | 'history.condition' | 'history.visibility' | 'history.photos'; icon: typeof History; color: string }> = {
  created: { key: 'history.created', icon: Plus, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  details_changed: { key: 'history.details', icon: FilePenLine, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  price_changed: { key: 'history.price', icon: CircleDollarSign, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  condition_changed: { key: 'history.condition', icon: PackageCheck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  visibility_changed: { key: 'history.visibility', icon: Eye, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  photos_changed: { key: 'history.photos', icon: Camera, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
};

const FigureHistoryTimeline = ({ events = [] }: FigureHistoryTimelineProps) => {
  const { locale, t } = useI18n();
  const sortedEvents = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="mt-16 border-t border-[#333] pt-10 text-left">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500"><History size={20} /></div>
        <div><h2 className="text-xl font-black uppercase italic tracking-tight text-white">{t('history.title')}</h2><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">{t('history.subtitle')}</p></div>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#333] p-8 text-center text-xs font-bold uppercase tracking-wider text-gray-600">{t('history.empty')}</p>
      ) : (
        <ol className="relative ml-5 border-l border-[#333]">
          {sortedEvents.map((event) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const hasValues = event.from !== undefined && event.to !== undefined;
            const detail = hasValues
              ? t(event.type === 'photos_changed' ? 'history.photoCount' : 'history.fromTo', { from: event.from!, to: event.to! })
              : null;
            return (
              <li key={event.id} className="relative pb-8 pl-8 last:pb-0">
                <div className={`absolute -left-[17px] top-0 rounded-xl border p-2 ${config.color}`}><Icon size={15} /></div>
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#181818] p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <p className="text-sm font-black uppercase italic text-white">{t(config.key)}</p>
                    <time className="text-[9px] font-bold uppercase tracking-wider text-gray-600" dateTime={event.createdAt}>
                      {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}
                    </time>
                  </div>
                  {detail && <p className="mt-2 text-xs font-bold text-gray-400">{detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default FigureHistoryTimeline;
