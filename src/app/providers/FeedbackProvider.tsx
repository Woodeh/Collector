import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { FeedbackContext, type ConfirmOptions, type ToastType } from './feedbackContext';

interface Toast { id: number; message: string; type: ToastType }
interface ConfirmRequest extends ConfirmOptions { resolve: (confirmed: boolean) => void }

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmRequest | null>(null);
  const nextId = useRef(0);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    setConfirmation({ ...options, resolve });
  }), []);

  const closeConfirmation = useCallback((result: boolean) => {
    setConfirmation((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!confirmation) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConfirmation(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeConfirmation, confirmation]);

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}

      <div className="pointer-events-none fixed inset-x-3 top-20 z-[300] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-[380px]" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
          const color = toast.type === 'success' ? 'text-emerald-400 border-emerald-500/30' : toast.type === 'error' ? 'text-red-400 border-red-500/30' : 'text-blue-400 border-blue-500/30';
          return (
            <div key={toast.id} className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-[#1a1a1a]/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4 ${color}`} role={toast.type === 'error' ? 'alert' : 'status'}>
              <Icon className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-bold leading-5 text-gray-200">{toast.message}</p>
              <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label={t('common.close')} className="shrink-0 text-gray-600 hover:text-white"><X size={17} /></button>
            </div>
          );
        })}
      </div>

      {confirmation && (
        <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeConfirmation(false); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId} className="ui-dialog w-full max-w-md border p-6 shadow-2xl animate-in zoom-in-95">
            <div className="mb-5 flex items-start gap-4">
              <div className={`rounded-xl p-3 ${confirmation.danger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}><Trash2 size={22} aria-hidden="true" /></div>
              <div><h2 id={titleId} className="text-xl font-black text-white">{confirmation.title}</h2><p id={messageId} className="mt-2 text-sm leading-6 text-gray-400">{confirmation.message}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => closeConfirmation(false)} className="rounded-xl border border-[#333] bg-[#252525] px-4 py-3 font-bold text-white hover:bg-[#303030]">{t('common.cancel')}</button>
              <button ref={confirmButtonRef} type="button" onClick={() => closeConfirmation(true)} className={`rounded-xl px-4 py-3 font-black text-white ${confirmation.danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{confirmation.confirmLabel ?? t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};
