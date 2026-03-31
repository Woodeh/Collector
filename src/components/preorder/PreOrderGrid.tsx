import React, { FC } from 'react';
import PreOrderCard from '../PreOrderCard';

// Define the interface for a single preorder item
interface PreOrderItem {
  id: string;
  name: string;
  anime?: string;
  brand?: string;
  paymentDate: string;
  releaseDate: string;
  deposit: number | string;
  totalPrice: number | string;
  screenshot?: string;
}

// Define the interface for the component props
interface PreOrderGridProps {
  preorders: PreOrderItem[];
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
}

const PreOrderGrid: FC<PreOrderGridProps> = ({ preorders, onDelete, onImageClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {preorders.length > 0 ? (
        preorders.map((item) => (
          <PreOrderCard key={item.id} item={item} onDelete={onDelete} onImageClick={onImageClick} />
        ))
      ) : (
        <div className="col-span-full py-20 text-center opacity-20 italic uppercase font-black tracking-widest">
          No active pre-orders found
        </div>
      )}
    </div>
  );
};

export default PreOrderGrid;
