import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { Check, X, Loader2, ZoomIn } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Важно использовать useCallback для стабильности react-easy-crop
  const onCropCompleteInternal = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels || isProcessing) return;
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Crop failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl aspect-[10/12] bg-[#121212] rounded-[2rem] overflow-hidden border border-[#333] shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={10 / 12}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>

      <div className="mt-8 w-full max-w-md space-y-8 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-[#333] shadow-2xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
            <span className="flex items-center gap-2">
              <ZoomIn size={14} /> Zoom Control
            </span>
            <span className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-400">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-5 rounded-2xl bg-[#121212] border border-[#333] text-gray-500 font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 hover:text-white hover:border-red-500/50 transition-all disabled:opacity-30"
          >
            <X size={16} /> Cancel
          </button>

          <button
            onClick={handleDone}
            disabled={isProcessing || !croppedAreaPixels}
            className="flex-[2] py-5 rounded-2xl bg-blue-600 text-white font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 active:scale-95 transition-all disabled:bg-gray-800 disabled:text-gray-600"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Check size={16} /> Apply Transformation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
