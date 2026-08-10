import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';
export interface ConfirmOptions { title: string; message: string; confirmLabel?: string; danger?: boolean }
export interface FeedbackValue {
  notify: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackValue | null>(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
};
