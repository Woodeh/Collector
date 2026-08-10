import React, { FC, ChangeEvent } from 'react';
import { LayoutGrid, Search, X, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../app/i18n/I18nProvider';

interface CollectionHeaderProps {
  processedCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const CollectionHeader: FC<CollectionHeaderProps> = ({
  processedCount,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
}) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 sm:gap-6 border-b border-[#333] pb-6 sm:pb-8 lg:pb-10 text-left">
      {/* LEFT SECTION: Registry Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-blue-500 mb-2">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">
            {t('collection.registry')}
          </span>
        </div>

        <h1 className="ui-page-title uppercase italic text-white">
          {t('collection.titleBefore')} <span className="text-blue-500">{t('collection.titleAccent')}</span>
        </h1>

        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
          {t('collection.managing', { count: processedCount })}
        </p>
      </div>

      {/* RIGHT SECTION: SEARCH & ACTIONS */}
      <div className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-3 lg:w-auto">
        {/* Search Bar */}
        <div className="relative col-span-3 sm:col-span-1 sm:w-auto lg:w-80">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              searchTerm ? 'text-blue-500' : 'text-gray-500'
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder={t('collection.search')}
            className="ui-control py-3.5 sm:py-4 pl-12 pr-12 text-sm sm:text-base placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
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
          className="ui-button bg-blue-600 hover:bg-blue-500 text-white p-3.5 sm:p-4 font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 border border-blue-400/20 cursor-pointer"
        >
          <Plus size={20} />
          <span className="hidden sm:inline text-sm">{t('collection.add')}</span>
        </Link>
      </div>
    </div>
  );
};

export default CollectionHeader;
