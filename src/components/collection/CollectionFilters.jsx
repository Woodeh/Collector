import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function CollectionFilters({
  showFilters,
  sortBy,
  setSortBy,
  filterAnime,
  setFilterAnime,
  animeOptions,
}) {
  if (!showFilters) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 p-8 bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] animate-in fade-in zoom-in duration-300 text-left">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
          Sort Protocol
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'newest', label: 'Newest Units' },
            { id: 'oldest', label: 'Archive' },
            { id: 'cheap', label: 'Low Cost' },
            { id: 'expensive', label: 'Premium' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                sortBy === opt.id
                  ? 'bg-blue-600/10 border-blue-500 text-blue-500'
                  : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">
          Source Origin
        </label>
        <div className="relative">
          <select
            value={filterAnime}
            onChange={(e) => setFilterAnime(e.target.value)}
            className="w-full bg-[#121212] border border-[#333] p-3.5 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs text-white appearance-none cursor-pointer"
          >
            {animeOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={14}
          />
        </div>
      </div>
    </div>
  );
}
