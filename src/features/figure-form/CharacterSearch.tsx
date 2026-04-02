import React, { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import { Loader2, User } from 'lucide-react';

// Интерфейс структуры данных от Jikan API
interface JikanCharacter {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

// Интерфейс объекта, который мы передаем наверх в onChange при выборе
interface SelectedCharacter {
  name: string;
  mal_id: number;
  image: string;
}

interface CharacterSearchProps {
  value: string;
  // onChange может принимать либо строку (ручной ввод), либо объект персонажа
  onChange: (value: string | SelectedCharacter) => void;
}

const CharacterSearch: FC<CharacterSearchProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState<string>(value || '');
  const [results, setResults] = useState<JikanCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>('');

  // Закрытие списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCharacters = async () => {
      // query === lastSelectedRef.current предотвращает повторный поиск сразу после выбора
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

  const handleSelect = (char: JikanCharacter) => {
    lastSelectedRef.current = char.name;
    setQuery(char.name);
    
    onChange({
      name: char.name,
      mal_id: char.mal_id,
      image: char.images?.jpg?.image_url,
    });
    
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
          onChange={handleInputChange}
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
              className="w-full flex items-center gap-4 p-3 hover:bg-blue-600/10 transition-colors text-left group border-b border-white/5 last:border-0 cursor-pointer"
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