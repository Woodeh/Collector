import React, { FC } from 'react';
import { Clock, Plus } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';

interface PreOrderHeaderProps {
  onAddClick: () => void;
}

const PreOrderHeader: FC<PreOrderHeaderProps> = ({ onAddClick }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 mb-6 sm:mb-10 border-b border-[#333] pb-5 sm:flex-row sm:items-center sm:pb-6 text-left">
      <div className="flex items-center gap-3">
        <Clock className="text-orange-500" size={30} />
        <h2 className="ui-section-title uppercase italic text-white">
          {t('preorders.title')}
        </h2>
      </div>
      <button
        type="button"
        onClick={onAddClick}
        className="ui-button bg-orange-600 hover:bg-orange-500 text-white px-5 sm:px-8 py-3 font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
      >
        <Plus size={20} /> {t('preorders.add')}
      </button>
    </div>
  );
};

export default PreOrderHeader;
