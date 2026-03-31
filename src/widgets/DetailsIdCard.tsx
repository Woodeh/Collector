import React, { FC } from 'react';
import { motion as Motion } from 'framer-motion';
import { Cpu, Fingerprint, ShieldCheck } from 'lucide-react';

// Интерфейсы для типизации данных
interface FigureData {
  name: string;
  fullDisplayName?: string;
  anime?: string;
  price: string | number;
  conditionGrade: string;
  hasBox: string | boolean;
  authorName?: string;
}

interface CharacterData {
  name?: string;
  image?: string;
}

interface DetailsIdCardProps {
  figure: FigureData;
  characterData?: CharacterData | null;
  images: string[];
  imageError: boolean;
  setImageError: (error: boolean) => void;
}

const DetailsIdCard: FC<DetailsIdCardProps> = ({
  figure,
  characterData,
  images,
  imageError,
  setImageError,
}) => {
  const avatarUrl = characterData?.image || images[0];

  return (
    <div className="relative bg-[#1a1a1a] border border-[#333] rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-blue-500/30 text-left">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
          <div className="space-y-0.5 text-left">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none">
              Security Protocol: Active
            </p>
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter leading-none">
              Collector ID Card
            </h2>
          </div>
          <Cpu size={24} className="text-blue-500/30" />
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-32 h-44 rounded-xl bg-[#121212] border border-[#333] overflow-hidden relative shadow-inner flex flex-col group/id">
              {/* Анимированный блик */}
              <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                <Motion.div
                  initial={{ x: '-150%', skewX: -45 }}
                  animate={{ x: '150%', skewX: -45 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                />
              </div>

              <div className="flex-1 overflow-hidden relative z-10 bg-[#0a0a0a] flex items-center justify-center">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    className="w-full h-full object-cover contrast-125 transition-all duration-700"
                    alt="id"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-30 group-hover/id:opacity-50 transition-opacity">
                    <Motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Cpu size={32} className="text-blue-500 mb-2" />
                    </Motion.div>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-center px-2">
                      Data Missing
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-blue-600 py-2 px-2 border-t border-blue-400/50 text-center relative z-20">
                <p className="text-[9px] font-black text-white uppercase italic truncate">
                  {characterData?.name || figure.name}
                </p>
              </div>
            </div>
            <div className="flex justify-center opacity-20 mt-3">
              <Fingerprint size={20} />
            </div>
          </div>

          <div className="flex-1 space-y-6 text-left">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                Designation
              </p>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-blue-500 pl-4">
                {figure.fullDisplayName || figure.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-1.5 text-left">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                  Origin
                </p>
                <p className="text-[13px] font-black text-blue-500 uppercase italic truncate">
                  {figure.anime}
                </p>
              </div>
              <div className="space-y-1.5 text-left">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                  Market Value
                </p>
                <p className="text-2xl font-black text-white italic tracking-tighter leading-none">
                  <span className="text-blue-500 mr-0.5">$</span>
                  {Math.round(Number(figure.price) || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1.5 text-left">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                  Condition
                </p>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" />
                  <p className="text-[12px] font-black text-white uppercase italic">
                    {figure.conditionGrade}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                  Packaging
                </p>
                <p
                  className={`text-[12px] font-black uppercase italic ${
                    figure.hasBox === 'Yes' || figure.hasBox === true
                      ? 'text-white'
                      : 'text-red-500'
                  }`}
                >
                  {figure.hasBox === 'Yes' || figure.hasBox === true
                    ? 'Box: Intact'
                    : 'Loose / No Box'}
                </p>
              </div>
              <div className="space-y-1.5 text-left">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                  Owner
                </p>
                <p className="text-[12px] font-black text-blue-500 uppercase italic">
                  {figure.authorName || 'System Archive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-10 w-full bg-[#121212] flex items-center px-8 justify-between border-t border-[#333]">
        <div className="flex gap-1.5 h-4 opacity-30">
          {[...Array(14)].map((_, i) => (
            <div key={i} className={`bg-white ${i % 3 === 0 ? 'w-2' : 'w-[1px]'} h-full`}></div>
          ))}
        </div>
        <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.8em]">
          ID-CRYPT-SECURE-VAULT
        </p>
      </div>
    </div>
  );
};

export default DetailsIdCard;
