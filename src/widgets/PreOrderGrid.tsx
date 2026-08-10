import React, { FC } from 'react';
import PreOrderCard from '../entities/preorder/PreOrderCard';
import type { PreOrder } from '../entities/preorder/model';
import { useI18n } from '../app/i18n/I18nProvider';

// Define the interface for the component props
interface PreOrderGridProps {
  preorders: PreOrder[];
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
  onContacted: (item: PreOrder) => Promise<void>;
}

const PreOrderGrid: FC<PreOrderGridProps> = ({ preorders, onDelete, onImageClick, onContacted }) => {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
      {preorders.length > 0 ? (
        preorders.map((item) => (
          <PreOrderCard key={item.id} item={item} onDelete={onDelete} onImageClick={onImageClick} onContacted={onContacted} />
        ))
      ) : (
        <div className="col-span-full py-16 md:py-20 text-center opacity-20 italic uppercase font-black tracking-widest">
          {t('preorders.empty')}
        </div>
      )}
    </div>
  );
};

export default PreOrderGrid;
