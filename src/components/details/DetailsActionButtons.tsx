import React from 'react';
import { SearchCode, ChevronRight, ExternalLink } from 'lucide-react';

const DetailsActionButtons = ({ handleMarketScan, auctionUrl }) => {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleMarketScan}
        className="group flex items-center justify-between bg-blue-600/10 border border-blue-500/30 text-blue-500 p-6 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer"
      >
        <div className="flex items-center gap-4 text-left">
          <SearchCode size={20} />
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
              Global Market Scan
            </span>
            <span className="text-[8px] uppercase tracking-[0.1em] opacity-60 mt-1">
              Identify on Taobao / eBay / Proxy
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
          className="group flex items-center justify-between bg-white text-black p-6 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
        >
          <div className="flex items-center gap-4 text-left">
            <ExternalLink size={20} />
            <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
              Launch System Link
            </span>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </a>
      )}
    </div>
  );
};

export default DetailsActionButtons;
