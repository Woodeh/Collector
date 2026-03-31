import React, { FC, ChangeEvent } from 'react';
import { ChevronDown, RotateCcw, Filter, SortAsc } from 'lucide-react';

interface CollectionFiltersProps {
  showFilters: boolean;
  sortBy: string;
  setSortBy: (val: string) => void;
  filterAnime: string;
  setFilterAnime: (val: string) => void;
  animeOptions?: string[];
  filterBrand: string;
  setFilterBrand: (val: string) => void;
  brandOptions?: string[];
  onReset: () => void;
}

const CollectionFilters: FC<CollectionFiltersProps> = ({
  showFilters,
  sortBy,
  setSortBy,
  filterAnime,
  setFilterAnime,
  animeOptions = [],
  filterBrand,
  setFilterBrand,
  brandOptions = [],
  onReset,
}) => {
  if (!showFilters) return null;

  const sortOptions = [
    { id: 'newest', label: 'Latest' },
    { id: 'oldest', label: 'Archive' },
    { id: 'cheap', label: 'Price: Low' },
    { id: 'expensive', label: 'Price: High' },
    { id: 'az', label: 'A-Z Name' },
    { id: 'za', label: 'Z-A Name' },
  ];

  return (
    <div className="mb-10 p-8 bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] animate-in fade-in zoom-in duration-300 shadow-2xl relative overflow-hidden text-left">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Filter size={120} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {/* 1. SORT PROTOCOL */}
        <div className="space-y-5 text-left">
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-blue-500" />
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">
              Sort Protocol
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  sortBy === opt.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_5px_15px_rgba(59,130,246,0.2)]'
                    : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. SOURCE ORIGIN */}
        <div className="space-y-5 text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic block">
            Source Origin
          </label>
          <div className="relative group">
            <select
              value={filterAnime}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterAnime(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-[11px] text-white appearance-none cursor-pointer group-hover:border-gray-600"
            >
              {animeOptions.map((title) => (
                <option key={title} value={title}>
                  {title === 'All' || title === 'All Origins'
                    ? '✦ ALL SERIES'
                    : title.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-blue-500 transition-colors"
              size={16}
            />
          </div>
        </div>

        {/* 3. MANUFACTURER */}
        <div className="space-y-5 text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic block">
            Manufacturer
          </label>
          <div className="relative group">
            <select
              value={filterBrand}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterBrand(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-[11px] text-white appearance-none cursor-pointer group-hover:border-gray-600"
            >
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'All' ? '✦ ALL BRANDS' : brand.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-blue-500 transition-colors"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* RESET ACTION */}
      <div className="mt-8 pt-6 border-t border-[#333] flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-transparent border border-[#333] text-gray-500 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer italic"
        >
          <RotateCcw size={12} />
          Reset Calibration
        </button>
      </div>
    </div>
  );
};

export default CollectionFilters;
