import React, { FC } from 'react';
import { Upload } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  SensorDescriptor,
  SensorOptions,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortablePhotoItem from './SortablePhotoItem';

interface MediaItem {
  id: string;
  url: string;
}

interface PhotoUploadSectionProps {
  isDraggingOver: boolean;
  setIsDraggingOver: (value: boolean) => void;
  handleFiles: (files: FileList | null) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  mediaItems: MediaItem[];
  previewId: string | null;
  setPreviewId: (id: string) => void;
  removeItem: (id: string) => void;
}

const PhotoUploadSection: FC<PhotoUploadSectionProps> = ({
  isDraggingOver,
  setIsDraggingOver,
  handleFiles,
  sensors,
  handleDragEnd,
  mediaItems,
  previewId,
  setPreviewId,
  removeItem,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-[#333]/50">
      <label
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center w-full h-28 sm:h-36 border-2 border-dashed rounded-2xl sm:rounded-[2.5rem] cursor-pointer transition-all ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-[#333] hover:border-blue-500/50'
        }`}
      >
        <Upload
          className={isDraggingOver ? 'text-blue-500 scale-110' : 'text-gray-600'}
          size={24}
        />
        <span className="text-gray-500 font-black text-[9px] uppercase tracking-widest mt-2 px-4 text-center">
          Photos (Max 5)
        </span>
        <input
          type="file"
          className="hidden"
          multiple
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          accept="image/*"
        />
      </label>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <SortableContext
            items={mediaItems.map((i) => i.id)}
            strategy={horizontalListSortingStrategy}
          >
            {mediaItems.map((item) => (
              <SortablePhotoItem
                key={item.id}
                id={item.id}
                url={item.url}
                isPreview={previewId === item.id}
                onSetPreview={() => setPreviewId(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};

export default PhotoUploadSection;
