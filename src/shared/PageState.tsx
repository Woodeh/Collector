import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

interface PageStateProps {
  type: 'loading' | 'error';
  message?: string;
  accentClass?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
}

const PageState = ({ type, message, accentClass = 'text-blue-500', icon: Icon, onRetry }: PageStateProps) => {
  const { t } = useI18n();
  const StateIcon = Icon ?? (type === 'error' ? AlertTriangle : Loader2);
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-[#121212] px-4" role={type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <StateIcon className={`${accentClass} ${type === 'loading' ? 'animate-spin' : ''}`} size={40} aria-hidden="true" />
        <p className="text-sm font-bold text-gray-400">{message ?? (type === 'loading' ? t('common.loading') : t('common.loadError'))}</p>
        {type === 'error' && (
          <button type="button" onClick={onRetry ?? (() => window.location.reload())} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <RefreshCw size={15} aria-hidden="true" /> {t('common.retry')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageState;
