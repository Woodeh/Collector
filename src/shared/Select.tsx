import React, { useState, useRef, useEffect, FC } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

// Интерфейс для одной опции
interface SelectOption {
  value: string;
  label: string;
}

// Интерфейс для пропсов компонента
interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon; // Специальный тип для иконок Lucide
}

const CustomSelect: FC<CustomSelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  icon: Icon 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне селекта
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // event.target приводится к Node для метода contains
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block px-1 text-xs font-semibold text-gray-500">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ui-control border ${
          isOpen ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-[#333]'
        } h-[58px] px-4 flex items-center justify-between cursor-pointer`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon size={18} className={isOpen ? 'text-blue-500' : 'text-gray-500'} />}
          <span
            className={`truncate text-base font-semibold ${
              !selectedOption ? 'text-gray-600' : 'text-white'
            }`}
          >
            {selectedOption ? selectedOption.label : 'Select Option'}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute z-[120] w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-4 hover:bg-blue-600/10 hover:text-blue-400 transition-colors flex items-center justify-between group/opt ${
                  value === option.value ? 'bg-blue-600/5 text-blue-500' : 'text-gray-400'
                } cursor-pointer`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                {value === option.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
