import React, { FC } from 'react';
import { ArrowLeft, Share2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../app/i18n/I18nProvider';

// Используем те же правила опциональности, что и в основном интерфейсе Figure
interface UserProfile {
  uid: string;
}

interface FigureData {
  userId?: string; 
}

interface DetailsHeaderProps {
  currentUser: UserProfile | null | undefined;
  figure: FigureData | null | undefined;
  id: string | undefined;
  onShare: () => void;
  onDelete: () => void;
}

const DetailsHeader: FC<DetailsHeaderProps> = ({ 
  currentUser, 
  figure, 
  id, 
  onShare, 
  onDelete 
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  // Проверка прав теперь безопасна: если любого из ID нет, условие просто вернет false
  const isOwner = currentUser && figure && currentUser.uid === figure.userId;

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-8 text-left">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={t('details.back')}
        className="flex items-center gap-2 text-gray-600 hover:text-white group font-black uppercase text-[10px] tracking-[0.2em] italic transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] cursor-pointer"
      >
        <ArrowLeft size={16} /> {t('details.back')}
      </button>

      {isOwner && (
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={onShare}
            aria-label={t('details.share')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all shadow-lg shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          >
            <Share2 size={14} /> {t('details.share')}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/edit/${id}`)}
            aria-label={t('common.edit')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-gray-400 hover:text-blue-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          >
            <Pencil size={14} /> {t('common.edit')}
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={t('common.delete')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-red-500/50 text-gray-400 hover:text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          >
            <Trash2 size={14} /> {t('common.delete')}
          </button>
        </div>
      )}
    </header>
  );
};

export default DetailsHeader;
