import React from 'react';
import { LayoutGrid, Search, X, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollectionHeader({
  processedCount,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#333] pb-8 text-left">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
          <LayoutGrid className="text-blue-500" size={26} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
            Shelf
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 italic">
            Collection Registry / {processedCount} Units
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative group flex-grow md:w-72">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              searchTerm ? 'text-blue-500' : 'text-gray-600'
            }`}
            size={16}
          />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full bg-[#1a1a1a] border border-[#333] py-3.5 pl-11 pr-10 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs text-white cursor-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase italic cursor-pointer ${
            showFilters
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-blue-500/50'
          }`}
        >
          <Filter size={18} />
          <span className="hidden sm:inline">Filters</span>
        </button>

        <Link
          to="/add"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black uppercase italic tracking-tighter flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Unit</span>
        </Link>
      </div>
    </div>
  );
}
