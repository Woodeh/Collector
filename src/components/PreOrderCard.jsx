import React, { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import { Trash2, Calendar, ImageIcon, Clock } from 'lucide-react';

const PreOrderCard = ({ item, onDelete, onImageClick }) => {
  // Выносим расчет в чистую функцию, чтобы она не зависела от рендеров
  const calculateTimeLeft = (paymentDate) => {
    if (!paymentDate) return null;

    const start = new Date(paymentDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + 25);

    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  };

  // Инициализируем стейт лениво (через функцию), чтобы расчет был только 1 раз при создании
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(item.paymentDate));

  useEffect(() => {
    // Внутри useEffect используем ТОЛЬКО асинхронный setInterval
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft(item.paymentDate);
      setTimeLeft(newTime);
    }, 60000); // Обновление раз в минуту

    return () => clearInterval(timer);
  }, [item.paymentDate]); // Эффект перезапустится только если сменится дата оплаты

  const getStatusDisplay = (time) => {
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
    <Tilt
      className="tilt-card"
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      perspective={2000}
      scale={1.02}
      transitionSpeed={2500}
      gyroscope={true}
      reverse={true}
      glareEnable={true}
      glareMaxOpacity={0.05}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="2rem"
    >
      <div className="bg-[#1a1a1a] border border-[#333] rounded-[2rem] relative group shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden transition-all duration-500 hover:border-orange-500/20 select-none transform-gpu">
        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="absolute top-5 right-5 z-50 pointer-events-auto text-gray-500 hover:text-red-500 transition-colors bg-[#121212] p-2 rounded-xl border border-[#333] opacity-0 group-hover:opacity-100 shadow-2xl transition-all"
        >
          <Trash2 size={16} />
        </button>

        {/* Screenshot Section */}
        {item.screenshot ? (
          <div
            className="relative aspect-[10/12] overflow-hidden border-b border-[#333] cursor-zoom-in"
            onClick={() => onImageClick(item.screenshot)}
          >
            <img
              src={item.screenshot}
              className="w-full h-full object-cover object-top pointer-events-none brightness-[0.8] group-hover:brightness-100 transition-all duration-500"
              alt={item.name}
            />
          </div>
        ) : (
          <div className="aspect-[10/12] bg-[#121212] flex items-center justify-center border-b border-[#333]">
            <ImageIcon className="text-gray-700" size={48} />
          </div>
        )}

        {/* Info Content */}
        <div className="p-7 flex-1 flex flex-col justify-between">
          <div className="text-left space-y-1">
            <p className="text-[9px] text-orange-500 font-black uppercase tracking-[0.3em] opacity-80 leading-none">
              {item.anime}
            </p>

            <div className="py-3 mt-1 h-8 flex items-center">{getStatusDisplay(timeLeft)}</div>

            <div className="border-l-2 border-orange-500/40 pl-4 mt-2 py-1">
              <h3 className="text-2xl font-black text-white leading-[1.1] mb-2 truncate group-hover:text-orange-400 transition-colors uppercase italic tracking-tighter">
                {item.name}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] italic leading-none">
                {item.brand || 'Original Character'}
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121212] p-4 rounded-[1.5rem] border border-white/5 text-center transition-all group-hover:border-orange-500/10 shadow-inner">
                <p className="text-gray-500 text-[9px] uppercase font-bold mb-1 tracking-wider opacity-60">
                  Paid
                </p>
                <p className="text-green-500 font-black text-xl leading-none">${item.deposit}</p>
              </div>
              <div className="bg-[#121212] p-4 rounded-[1.5rem] border border-white/5 text-center transition-all group-hover:border-orange-500/10 shadow-inner">
                <p className="text-gray-500 text-[9px] uppercase font-bold mb-1 tracking-wider opacity-60">
                  Total
                </p>
                <p className="text-white font-black text-xl leading-none">${item.totalPrice}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-[1.5rem] flex items-center justify-between px-6 border border-white/5 transition-all group-hover:bg-white/[0.07]">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-500" />
                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest leading-none">
                  Release
                </p>
              </div>
              <p className="text-sm font-black text-gray-200 italic uppercase leading-none">
                {item.releaseDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

export default PreOrderCard;
