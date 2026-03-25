import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, X } from 'lucide-react';

const SortablePhotoItem = ({ id, url, isPreview, onSetPreview, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${
        isPreview ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-[#333]'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <img src={url} className="w-full h-full object-cover pointer-events-none" alt="preview" />
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onSetPreview}
        className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 bg-black/70 p-1.5 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Star size={14} className={isPreview ? 'text-yellow-400 fill-yellow-400' : 'text-white'} />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 bg-red-600/80 p-1.5 rounded-lg text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default SortablePhotoItem;
