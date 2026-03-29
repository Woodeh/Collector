import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User } from 'lucide-react';

const CharacterSearch = ({ value, onChange }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const lastSelectedRef = useRef('');

  // Закрытие списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCharacters = async () => {
      if (query.length < 3 || query === lastSelectedRef.current) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
            query,
          )}&limit=5&order_by=favorites&sort=desc`,
        );
        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCharacters, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (char) => {
    lastSelectedRef.current = char.name;
    setQuery(char.name);
    onChange(char.name);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur(); // Снимаем фокус, чтобы предотвратить повторное открытие на мобилках
  };

  return (
    <div className="relative w-full" ref={wrapperRef} style={{ zIndex: isOpen ? 100 : 10 }}>
      <div className="relative">
        <User
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            loading ? 'text-blue-500' : 'text-gray-600'
          }`}
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Character Name (e.g. Zero Two) *"
          className="w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl outline-none focus:border-blue-500 font-bold text-white text-base placeholder:text-gray-700 transition-all"
          value={query}
          onChange={(e) => {
            lastSelectedRef.current = '';
            setQuery(e.target.value);
            onChange(e.target.value);
            if (e.target.value.length >= 3) setIsOpen(true);
          }}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          required
        />
        {loading && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
            size={16}
          />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((char) => (
            <button
              key={char.mal_id}
              type="button"
              onClick={() => handleSelect(char)}
              className="w-full flex items-center gap-4 p-3 hover:bg-blue-600/10 transition-colors text-left group border-b border-white/5 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#121212] flex-shrink-0">
                <img
                  src={char.images.jpg.image_url}
                  alt={char.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-none mb-1">
                  {char.name}
                </p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
                  Character ID: {char.mal_id}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterSearch;
