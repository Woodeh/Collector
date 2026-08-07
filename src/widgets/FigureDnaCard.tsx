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
    <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#161616] p-4 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-xl bg-white p-2">
          <QRCodeSVG value={passportUrl} size={72} level="M" title={`Figure DNA ${dnaId}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-blue-500">
            <Fingerprint size={15} />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Figure DNA</span>
          </div>
          <p className="font-mono text-lg font-black tracking-tight text-white">{dnaId}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-gray-300">
              {figure.conditionGrade || 'Condition unknown'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-gray-300">
              {isPublic ? <Globe2 size={9} /> : <LockKeyhole size={9} />}
              {isPublic ? 'Public passport' : 'Private passport'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FigureDnaCard;
