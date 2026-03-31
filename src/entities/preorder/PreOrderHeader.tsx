import React, { FC } from 'react';
import { Clock, Plus } from 'lucide-react';

interface PreOrderHeaderProps {
  onAddClick: () => void;
}

const PreOrderHeader: FC<PreOrderHeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6 text-left">
      <div className="flex items-center gap-3">
        <Clock className="text-orange-500" size={30} />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
          Pre-Orders
        </h2>
      </div>
      <button
        type="button"
        onClick={onAddClick}
        className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl cursor-pointer"
      >
        <Plus size={20} /> Add New
      </button>
    </div>
  );
};

export default PreOrderHeader;
