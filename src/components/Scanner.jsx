import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Scan, Camera } from 'lucide-react';

const Scanner = ({ isOpen, onClose }) => {
  const webcamRef = useRef(null);

  const scanInGoogleLens = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const lensUrl = `https://www.google.com/searchbyimage/upload`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <form id="lens-form" action="${lensUrl}" method="POST" enctype="multipart/form-data">
          <input type="file" name="encoded_image" />
        </form>
        <script>
          const blob = new Blob([new Uint8Array([${new Uint8Array(
            await blob.arrayBuffer(),
          )}])], {type: 'image/jpeg'});
          const file = new File([blob], "image.jpg", {type: "image/jpeg"});
          const container = new DataTransfer();
          container.items.add(file);
          document.querySelector('input').files = container.files;
          document.getElementById('lens-form').submit();
        </script>
      `);
    }
    onClose();
  }, [webcamRef, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-[#333] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 flex justify-between items-center border-b border-[#333]">
          <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2 text-white">
            <Scan className="text-blue-500" size={20} /> AI Figure Scanner
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-gray-400 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-square bg-black overflow-hidden">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: 'environment' }}
          />
          {/* Дизайнерская рамка */}
          <div className="absolute inset-10 border-2 border-blue-500/20 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
          </div>
        </div>

        <div className="p-8 bg-[#1a1a1a]">
          <button
            onClick={scanInGoogleLens}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Camera size={20} /> Analyze Figure
          </button>
          <p className="text-center text-[9px] text-gray-500 uppercase font-black mt-4 tracking-[0.2em] italic">
            Focus on the face or unique details
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
