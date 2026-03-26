import React from 'react';

export default function PreOrderLightbox({ selectedImage, setSelectedImage }) {
  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
      onClick={() => setSelectedImage(null)}
    >
      <img
        src={selectedImage}
        alt="Full Size"
        className="max-w-full max-h-full rounded-2xl object-contain animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
