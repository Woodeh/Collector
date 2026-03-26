import React from 'react';
import PreOrderCard from '../PreOrderCard';

export default function PreOrderGrid({ preorders, onDelete, onImageClick }) {
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
}
