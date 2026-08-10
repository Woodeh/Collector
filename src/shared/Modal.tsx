import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useI18n();
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) { setConfirming(false); return; }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId} className="ui-dialog w-full max-w-md overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="rounded-xl bg-red-500/10 p-3"><AlertTriangle className="text-red-500" size={24} aria-hidden="true" /></div>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="text-gray-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><X size={20} /></button>
        </div>
        <div className="p-6">
          <h3 id={titleId} className="mb-2 text-xl font-bold text-white">{title}</h3>
          <p id={messageId} className="leading-relaxed text-gray-400">{message}</p>
        </div>
        <div className="flex gap-3 bg-[#121212]/50 p-6">
          <button ref={cancelRef} type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#333] bg-[#252525] px-4 py-2.5 font-medium text-white transition-all hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('common.cancel')}</button>
          <button type="button" disabled={confirming} onClick={async () => { if (confirming) return; setConfirming(true); try { await onConfirm(); } finally { setConfirming(false); } }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">{confirming && <Loader2 className="animate-spin" size={16} />}{t('common.delete')}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
