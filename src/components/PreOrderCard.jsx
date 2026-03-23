import React from 'react';
import Tilt from 'react-parallax-tilt';
import { Trash2, Calendar, ImageIcon } from 'lucide-react';

const PreOrderCard = ({ item, onDelete, onImageClick }) => {
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
      glareMaxOpacity={0.1}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="2rem"
    >
      <div className="bg-[#1a1a1a] border border-[#333] rounded-[2rem] relative group shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden transition-shadow duration-500 hover:shadow-orange-500/10 select-none transform-gpu">
        {/* КНОПКА УДАЛЕНИЯ - ГЛАВНЫЙ ФИКС */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал клик по карточке
            onDelete(item.id);
          }}
          // z-[100] и pointer-events-auto гарантируют, что клик дойдет до цели
          className="absolute top-5 right-5 z-[100] pointer-events-auto text-gray-500 hover:text-red-500 transition-colors bg-[#121212] p-2 rounded-xl border border-[#333] opacity-0 group-hover:opacity-100 shadow-2xl"
          style={{ transform: 'translateZ(50px)' }} // Выносим кнопку "вперед" в 3D пространстве
        >
          <Trash2 size={18} />
        </button>

        {/* Screenshot / Preview */}
        {item.screenshot ? (
          <div
            className="relative aspect-[10/12] overflow-hidden border-b border-[#333] cursor-zoom-in"
            onClick={() => onImageClick(item.screenshot)}
          >
            <img
              src={item.screenshot}
              className="w-full h-full object-cover object-top pointer-events-none"
              alt={item.name}
            />
          </div>
        ) : (
          <div className="aspect-[10/12] bg-[#121212] flex items-center justify-center border-b border-[#333]">
            <ImageIcon className="text-gray-700" size={48} />
          </div>
        )}

        {/* Info Content */}
        <div className="p-6 pt-5 flex-1 flex flex-col justify-between">
          <div className="mb-6 text-left">
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1 truncate">
              {item.anime}
            </p>
            <h3 className="text-xl font-black text-white leading-tight mb-1 truncate group-hover:text-orange-400 transition-colors">
              {item.name}
            </h3>
            <p className="text-gray-500 text-xs italic">{item.brand || 'Unknown Brand'}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-gray-400 text-[9px] uppercase font-bold mb-1 tracking-wider">
                  Paid
                </p>
                <p className="text-green-500 font-black text-lg">${item.deposit}</p>
              </div>
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-gray-400 text-[9px] uppercase font-bold mb-1 tracking-wider">
                  Total
                </p>
                <p className="text-white font-black text-lg">${item.totalPrice}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Calendar size={18} className="text-blue-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">
                  Release Date
                </p>
                <p className="text-sm font-bold text-gray-200 truncate">{item.releaseDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

export default PreOrderCard;
