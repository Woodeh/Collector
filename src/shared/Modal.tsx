import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
        {/* Шапка модалки */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="bg-red-500/10 p-3 rounded-xl">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{message}</p>
        </div>

        {/* Кнопки действия */}
        <div className="p-6 bg-[#121212]/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#252525] hover:bg-[#2a2a2a] text-white font-medium transition-all border border-[#333] cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-900/20 cursor-pointer"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
