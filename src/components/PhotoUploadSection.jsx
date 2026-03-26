import React from 'react';
import { Upload, Star, Trash2, Scissors } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePhoto = ({ item, previewId, setPreviewId, removeItem, onCropItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-[10/12] rounded-2xl overflow-hidden border-2 transition-all ${
        item.id === previewId
          ? 'border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
          : 'border-[#333]'
      }`}
    >
      <img src={item.url} alt="preview" className="w-full h-full object-cover" />
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10 pointer-events-none">
        <div className="flex justify-end gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCropItem(item.id);
            }}
            className="bg-black/80 p-2 rounded-lg text-white hover:bg-blue-600 transition-colors shadow-lg"
          >
            <Scissors size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              removeItem(item.id);
            }}
            className="bg-black/80 p-2 rounded-lg text-white hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {item.id !== previewId && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setPreviewId(item.id);
            }}
            className="w-full py-2 rounded-lg bg-blue-600/80 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest pointer-events-auto"
          >
            <Star size={12} fill="white" /> Set Main
          </button>
        )}
      </div>

      {item.id === previewId && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white p-1.5 rounded-lg z-20">
          <Star size={12} fill="white" />
        </div>
      )}
    </div>
  );
};

const PhotoUploadSection = ({
  isDraggingOver,
  setIsDraggingOver,
  handleFiles,
  mediaItems,
  previewId,
  setPreviewId,
  removeItem,
  onCropItem,
  handleDragEnd,
  sensors,
}) => {
  return (
    <div className="space-y-6 pt-4 border-t border-[#333]/50 text-left">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-[#333] hover:border-blue-500/50'
        }`}
      >
        <Upload
          className={isDraggingOver ? 'text-blue-500 scale-110' : 'text-gray-600'}
          size={24}
        />
        <span className="text-gray-500 font-black text-[9px] uppercase tracking-widest mt-2">
          Upload Photo
        </span>
        <input
          type="file"
          className="hidden"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*"
        />
      </label>

      {mediaItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={mediaItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {mediaItems.map((item) => (
                <SortablePhoto
                  key={item.id}
                  item={item}
                  previewId={previewId}
                  setPreviewId={setPreviewId}
                  removeItem={removeItem}
                  onCropItem={onCropItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default PhotoUploadSection;
