import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';
import { getContactCycleStatus } from './contactCycle';
import type { PreOrder } from './model';

interface PreOrderContactSummaryProps { preorders: PreOrder[] }

const PreOrderContactSummary = ({ preorders }: PreOrderContactSummaryProps) => {
  const { t } = useI18n();
  const counts = preorders.reduce((result, item) => {
    const status = getContactCycleStatus(item).status;
    result[status] += 1;
    return result;
  }, { overdue: 0, due_soon: 0, ok: 0 });

  const items = [
    { label: t('preorders.summaryOverdue'), value: counts.overdue, icon: AlertTriangle, className: 'border-red-500/20 bg-red-500/10 text-red-400' },
    { label: t('preorders.summarySoon'), value: counts.due_soon, icon: CalendarClock, className: 'border-orange-500/20 bg-orange-500/10 text-orange-400' },
    { label: t('preorders.summaryScheduled'), value: counts.ok, icon: CheckCircle2, className: 'border-green-500/20 bg-green-500/10 text-green-400' },
  ];

  return (
    <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={t('preorders.nextContact')}>
      {items.map(({ label, value, icon: Icon, className }) => (
        <div key={label} className={`flex items-center justify-between rounded-2xl border p-4 ${className}`}>
          <div><p className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</p><p className="mt-1 text-3xl font-black italic">{value}</p></div>
          <Icon size={24} className="opacity-70" />
        </div>
      ))}
    </section>
  );
};

export default PreOrderContactSummary;
