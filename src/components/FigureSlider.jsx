import React from 'react';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';

const FigureSlider = ({
  images,
  activeImg,
  setActiveImg,
  isPaused,
  setIsPaused,
  nextSlide,
  prevSlide,
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div
        className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-[#333] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === activeImg ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            alt="figure"
          />
        ))}

        {/* Использование isPaused: показываем индикатор паузы при наведении */}
        {isPaused && (
          <div className="absolute top-6 right-6 z-30 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/50 animate-pulse">
            <Pause size={16} />
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevSlide}
              className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white transition-all active:scale-90"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={nextSlide}
              className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white transition-all active:scale-90"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar justify-center">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveImg(idx);
                setIsPaused(true);
              }}
              className={`h-20 w-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                activeImg === idx
                  ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20'
                  : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="thumb" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FigureSlider;
