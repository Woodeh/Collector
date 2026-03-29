import React from 'react';
import { LayoutGrid, Search, X, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollectionHeader({
  processedCount,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#333] pb-10 text-left">
      {/* LEFT SECTION: Полностью копируем структуру Community */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-blue-500 mb-2">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">
            Personal Registry
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
          My <span className="text-blue-500">Collection.</span>
        </h1>

        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
          Managing {processedCount} unique units in your sector
        </p>
      </div>

      {/* RIGHT SECTION: SEARCH & ACTIONS */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 md:w-80">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              searchTerm ? 'text-blue-500' : 'text-gray-500'
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search database..."
            className="w-full bg-[#1a1a1a] border border-[#333] py-4 pl-12 pr-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-base text-white placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
            showFilters
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
              : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-600'
          }`}
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Add Unit Button */}
        <Link
          to="/add"
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black uppercase italic tracking-tighter flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20 border border-blue-400/20 cursor-pointer"
        >
          <Plus size={20} />
          <span className="hidden sm:inline text-sm">Add Unit</span>
        </Link>
      </div>
    </div>
  );
}
