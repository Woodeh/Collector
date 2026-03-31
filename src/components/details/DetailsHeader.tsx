import React, { FC } from 'react';
import { ArrowLeft, Share2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // Проверка прав теперь безопасна: если любого из ID нет, условие просто вернет false
  const isOwner = currentUser && figure && currentUser.uid === figure.userId;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-white group font-black uppercase text-[10px] tracking-[0.2em] italic transition-all cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Vault
      </button>

      {isOwner && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <Share2 size={14} /> Share
          </button>

          <button
            type="button"
            onClick={() => navigate(`/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-gray-400 hover:text-blue-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer"
          >
            <Pencil size={14} /> Edit Unit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-red-500/50 text-gray-400 hover:text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailsHeader;