import React, { FC } from 'react';
import FigureCard from '../collection/FigureCard';

// Интерфейс для данных фигурки (должен совпадать с тем, что принимает FigureCard)
interface RelatedFigure {
  id: string;
  name: string;
  anime: string;
  price: string | number;
  previewImage?: string;
  image?: string;
  // Добавьте другие поля, если они используются в FigureCard
}

interface DetailsRelatedProps {
  relatedFigures: RelatedFigure[] | null | undefined;
  anime: string;
}

const DetailsRelated: FC<DetailsRelatedProps> = ({ relatedFigures, anime }) => {
  if (!relatedFigures || relatedFigures.length === 0) return null;

  return (
    <div className="mt-24 border-t border-[#333] pt-12 pb-20 text-left">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none text-left">
            Database Scan
          </p>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter text-left">
            More from {anime}
          </h2>
        </div>
        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent ml-10"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedFigures.map((relFigure) => (
          <FigureCard
            key={relFigure.id}
            figure={relFigure}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default DetailsRelated;
