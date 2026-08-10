import React, { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import { Search, Loader2, X, Bookmark } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';
import { searchAnime as requestAnime, type AnimeSearchResult } from '../../shared/api/jikanApi';

// Интерфейс структуры аниме из Jikan API
type JikanAnime = AnimeSearchResult;

interface AnimeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const AnimeSearch: FC<AnimeSearchProps> = ({ value, onChange }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState<string>(value || '');
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<boolean>(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>('');

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const searchAnime = async () => {
      if (query.length < 3 || query === lastSelectedRef.current) {
        setResults([]);
        return;
      }

      setLoading(true);
      setSearchError(false);
      try {
        setResults(await requestAnime(query, controller.signal));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResults([]);
        setSearchError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAnime, 600);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (anime: JikanAnime) => {
    lastSelectedRef.current = anime.title;
    setQuery(anime.title);
    onChange(anime.title);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    lastSelectedRef.current = '';
    setQuery(val);
    onChange(val);
    if (val.length >= 3) setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    onChange('');
    setResults([]);
  };

  return (
    <div className="relative w-full" ref={wrapperRef} style={{ zIndex: isOpen ? 100 : 10 }}>
      <div className="relative group">
        <Bookmark
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={t('form.series')}
          className="w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-semibold text-base placeholder:text-gray-600 placeholder:font-normal"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {loading ? (
            <Loader2 className="animate-spin text-blue-500" size={20} />
          ) : query.length > 0 ? (
            <X
              className="text-gray-500 cursor-pointer hover:text-white"
              size={18}
              onClick={clearSearch}
            />
          ) : (
            <Search className="text-gray-500" size={20} />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {results.map((anime) => (
              <div
                key={anime.mal_id}
                onClick={() => handleSelect(anime)}
                className="w-full flex items-center gap-4 p-3 hover:bg-blue-600/10 cursor-pointer transition-colors border-b border-white/5 last:border-0 group"
              >
                <img
                  src={anime.images?.jpg?.small_image_url}
                  className="w-12 h-16 object-cover rounded-lg shadow-md flex-shrink-0"
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {anime.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {anime.type} • {anime.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isOpen && searchError && (
        <p className="mt-2 px-2 text-xs font-bold text-amber-400" role="status">
          {t('form.externalSearchUnavailable')}
        </p>
      )}
    </div>
  );
};

export default AnimeSearch;
