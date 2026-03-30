import React from 'react';

const DetailsThumbnails = ({ images, activeImg, handleManualSelect }) => {
  if (!images || images.length <= 1) return null;

  return (
    <div className="hidden sm:flex flex-wrap gap-4 justify-start">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => handleManualSelect(idx)}
          className={`w-20 aspect-[4/5] rounded-xl border-2 overflow-hidden transition-all duration-300 ${
            activeImg === idx
              ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
              : 'border-[#333] opacity-40 hover:opacity-100 hover:scale-105'
          }`}
        >
          <img src={img} className="w-full h-full object-cover" alt="thumb" />
        </button>
      ))}
    </div>
  );
};

export default DetailsThumbnails;
