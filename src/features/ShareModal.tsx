import React, { useState, FC } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, QrCode, Shield, Send, MessageCircle } from 'lucide-react';

// Интерфейс для данных фигурки
interface Figure {
  name: string;
  anime?: string;
  price?: string | number;
  previewImage?: string;
  images?: string[];
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  figure: Figure;
}

const ShareModal: FC<ShareModalProps> = ({ isOpen, onClose, figure }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareUrl: string = window.location.href;
  const shareText: string = `Check out this asset: ${figure.name} from ${figure.anime} in my collection!`;

  const handleCopy = (): void => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTelegram = (): void => {
    const url: string = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl,
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = (): void => {
    const url: string = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#121212] border border-[#333] rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <Share2 size={18} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">
                Generate Asset Link
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* THE CARD (Визитка) */}
          <div className="p-5 sm:p-8">
            <div className="relative min-h-[220px] sm:aspect-[1.6/1] w-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-blue-500/20 rounded-3xl overflow-hidden group p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 shadow-2xl">
              {/* Scanning Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

              {/* Figure Preview */}
              <div className="w-24 sm:w-1/3 aspect-[3/4] rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                <img
                  src={figure.previewImage || figure.images?.[0]}
                  alt={figure.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Info Area */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Shield size={10} className="text-blue-500" />
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">
                      Verified Asset
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-2">
                    {figure.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">
                    {figure.anime}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">
                      Market Value
                    </p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">
                      <span className="text-blue-500 mr-1">$</span>
                      {figure.price}
                    </p>
                  </div>
                  <div className="opacity-40">
                    <QrCode size={40} strokeWidth={1} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Decorative Tech Elements */}
              <div className="absolute top-4 right-4 flex gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-blue-500/30 rounded-full" />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 space-y-4">
              <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl p-4 flex items-center justify-between overflow-hidden">
                <span className="text-[10px] font-mono text-gray-500 truncate mr-4">
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={shareToTelegram}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc] hover:text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#0088cc]/5"
                >
                  <Send size={14} /> Telegram
                </button>

                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25d366]/10 border border-[#25d366]/30 text-[#25d366] hover:bg-[#25d366] hover:text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#25d366]/5"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              </div>

              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] text-center italic">
                System Archive Access Link Generated // Security Protocol Level 4
              </p>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
