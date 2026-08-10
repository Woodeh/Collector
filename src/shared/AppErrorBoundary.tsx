import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

interface BoundaryProps { children: ReactNode; fallback: ReactNode }
interface BoundaryState { failed: boolean }

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application render failed:', error, info); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const fallback = (
    <section className="flex min-h-[70dvh] items-center justify-center bg-[#121212] px-4 text-center" role="alert">
      <div className="max-w-md">
        <AlertOctagon className="mx-auto text-red-500" size={48} aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-black uppercase italic text-white">{t('errorBoundary.title')}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">{t('errorBoundary.description')}</p>
        <button type="button" onClick={() => window.location.reload()} className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-blue-500">
          <RefreshCw size={16} aria-hidden="true" /> {t('common.retry')}
        </button>
      </div>
    </section>
  );
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

export default AppErrorBoundary;
