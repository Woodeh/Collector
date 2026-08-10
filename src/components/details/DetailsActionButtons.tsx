import React, { FC, MouseEvent } from 'react';
import { SearchCode, ChevronRight, ExternalLink } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';

interface DetailsActionButtonsProps {
  handleMarketScan: (e: MouseEvent<HTMLButtonElement>) => void;
  auctionUrl?: string | null;
}

const DetailsActionButtons: FC<DetailsActionButtonsProps> = ({ handleMarketScan, auctionUrl }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleMarketScan}
        aria-label={t('details.marketScan')}
        className="group flex items-center justify-between bg-blue-600/10 border border-blue-500/30 text-blue-500 p-4 sm:p-5 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] cursor-pointer"
      >
        <div className="flex items-center gap-4 text-left">
          <SearchCode size={20} />
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
              {t('details.marketScan')}
            </span>
            <span className="text-[8px] uppercase tracking-[0.1em] opacity-60 mt-1">
              Taobao / eBay / Proxy
            </span>
          </div>
        </div>
        <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
      </button>

      {auctionUrl && (
        <a
          href={auctionUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('details.openListing')}
          className="group flex items-center justify-between bg-white text-black p-4 sm:p-5 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
        >
          <div className="flex items-center gap-4 text-left">
            <ExternalLink size={20} />
            <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
              {t('details.openListing')}
            </span>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </a>
      )}
    </div>
  );
};

export default DetailsActionButtons;
