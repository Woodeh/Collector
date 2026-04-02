import React, { useState, useEffect, FC, useRef, MouseEvent } from 'react';
import { Trash2, Calendar, ImageIcon, Clock, Tag, MoreVertical } from 'lucide-react';

// Интерфейс для данных предзаказа
interface PreOrderItem {
  id: string;
  name: string;
  anime?: string;
  brand?: string;
  paymentDate: string; // ISO дата или строка даты
  releaseDate: string;
  deposit: number | string;
  totalPrice: number | string;
  screenshot?: string;
}

// Интерфейс для состояния обратного отсчета
interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
}

interface PreOrderCardProps {
  item: PreOrderItem;
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
}

const PreOrderCard: FC<PreOrderCardProps> = ({ item, onDelete, onImageClick }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleMenuToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  
  // Выносим расчет в чистую функцию
  const calculateTimeLeft = (paymentDate: string): TimeLeft | null => {
    if (!paymentDate) return null;

    const start = new Date(paymentDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + 25);

    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  };

  // Ленивая инициализация стейта
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => 
    calculateTimeLeft(item.paymentDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft(item.paymentDate);
      setTimeLeft(newTime);
    }, 60000);

    return () => clearInterval(timer);
  }, [item.paymentDate]);

  const getStatusDisplay = (time: TimeLeft | null) => {
    if (!time) return null;
    const baseClasses =
      'font-black uppercase tracking-[0.15em] leading-none text-[9px] flex items-center gap-1.5';

    if (time.total <= 0) {
      return (
        <div className={`text-red-500 animate-pulse ${baseClasses}`}>
          <Clock size={12} /> Contact seller immediately
        </div>
      );
    }

    const colorClass = time.days <= 5 ? 'text-orange-500' : 'text-green-500';

    return (
      <div className={`${colorClass} ${baseClasses}`}>
        <Clock size={12} />
        <span>{time.days}d</span>
        <span className="opacity-40">•</span>
        <span>{time.hours}h</span>
        <span className="opacity-40">•</span>
        <span>{time.minutes}m</span>
        <span className="ml-1 opacity-60 italic tracking-normal lowercase font-bold">left</span>
      </div>
    );
  };

  return (
    <div className="relative group bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col shadow-2xl h-full text-left font-sans">
        {/* Action Menu */}
        <div
          className="absolute top-4 right-4 z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 md:-translate-y-2 md:group-hover:translate-y-0"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={handleMenuToggle}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
              showMenu
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(item.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Screenshot Section */}
        <div className="aspect-[10/12] overflow-hidden bg-[#121212] relative border-b border-[#333]/50">
          {item.screenshot ? (
            <div
              className="w-full h-full cursor-zoom-in"
              onClick={() => onImageClick(item.screenshot!)}
            >
              <img
                src={item.screenshot}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
                alt={item.name}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="text-gray-800" size={48} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>

        {/* INFO SECTION */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.25em] italic truncate max-w-[80%]">
                {item.anime}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black border border-white/10 bg-white/5 text-gray-400">
                <Calendar size={10} className="text-blue-500" />
                {item.releaseDate}
              </div>
            </div>

            <div className="py-1">
              {getStatusDisplay(timeLeft)}
            </div>

            <div className="relative pl-4 border-l-[3px] border-blue-600 py-1">
              <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                {item.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic leading-none">
                {item.brand || 'Original Character'}
              </p>
            </div>
          </div>

          {/* PRICE SECTION */}
          <div className="mt-8 pt-5 border-t border-white/5 space-y-3">
            <div className="flex justify-between items-center opacity-60">
              <span className="text-[10px] uppercase font-black tracking-widest text-white italic">Deposit</span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-green-500 italic tracking-tighter">
                  {Math.round(Number(item.deposit) || 0).toLocaleString()}
                </span>
                <span className="text-green-600 font-black text-sm">$</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 opacity-40">
                <Tag size={14} className="text-blue-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white italic">Total</span>
              </div>
              <div className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-1">
                {Math.round(Number(item.totalPrice) || 0).toLocaleString()}
                <span className="text-blue-500 not-italic text-xl ml-1">$</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PreOrderCard;