import React from 'react';
import { Fingerprint, Globe2, LockKeyhole } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Figure } from '../types/figure';

interface FigureDnaCardProps {
  figure: Figure;
}

const FigureDnaCard: React.FC<FigureDnaCardProps> = ({ figure }) => {
  const passportUrl = window.location.href;
  const dnaId = `FC-${figure.id.slice(0, 8).toUpperCase()}`;
  const isPublic = figure.visibility === 'public';

  return (
    <section className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#161616] p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="rounded-2xl bg-white p-3 shrink-0">
          <QRCodeSVG value={passportUrl} size={112} level="M" title={`Figure DNA ${dnaId}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Fingerprint size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Figure DNA</span>
          </div>
          <p className="font-mono text-2xl font-black text-white tracking-tight">{dnaId}</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Digital passport for this physical collectible. Scan the code to reopen its record.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-300">
              {figure.conditionGrade || 'Condition unknown'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-300">
              {isPublic ? <Globe2 size={11} /> : <LockKeyhole size={11} />}
              {isPublic ? 'Public passport' : 'Private passport'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FigureDnaCard;
