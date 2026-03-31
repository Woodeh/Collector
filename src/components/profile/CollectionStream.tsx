import React, { useRef, useState, FC, MouseEvent } from 'react';
import { History, ChevronLeft, ChevronRight, Info, TrendingUp, Target } from 'lucide-react';

interface Figure {
  id: string;
  name: string;
  anime: string;
  price: string | number;
  brand?: string;
  previewImage?: string;
  image?: string;
}

interface CollectionStreamProps {
  recentFigures: Figure[];
  navigate: (path: string) => void;
}

const CollectionStream: FC<CollectionStreamProps> = ({ recentFigures, navigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);
  const dragDistance = useRef<number>(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragDistance.current = 0;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // множитель скорости
    dragDistance.current = Math.abs(x - startX.current);
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-3xl relative z-10 text-left overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-4 text-left">
        <div className="flex items-center gap-3 md:gap-4 text-left">
          <div className="p-2.5 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl text-blue-500 text-left">
            <History className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none text-left">
              Collection Stream
            </h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1 italic text-left">
              Slide through your latest acquisitions
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 self-end md:self-auto text-left">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-3 rounded-xl border border-white/5 bg-[#121212] text-white hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-3 rounded-xl border border-white/5 bg-[#121212] text-white hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar hide-scrollbar scroll-smooth select-none text-left snap-x snap-mandatory ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {recentFigures.length > 0 ? (
          recentFigures.map((fig) => (
            <div
              key={fig.id}
              onClick={() => {
                if (dragDistance.current < 10) navigate(`/figure/${fig.id}`);
              }}
              className="flex-shrink-0 w-64 bg-[#121212] border border-white/5 rounded-3xl p-5 group hover:border-blue-500/40 transition-all duration-500 cursor-pointer relative text-left snap-start"
            >
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 rounded-lg p-1.5 shadow-lg text-left">
                <Info size={14} className="text-white" />
              </div>
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 bg-[#1a1a1a] relative text-left">
                <img
                  src={fig.previewImage || fig.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={fig.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 text-left"></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-left">
                  <span className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase italic text-left">
                    Recent
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic truncate text-left">
                  {fig.anime}
                </p>
                <h4 className="text-sm font-black text-white uppercase italic truncate tracking-tight text-left">
                  {fig.name}
                </h4>
                <div className="flex items-center justify-between pt-2 text-left">
                  <p className="text-xs font-black text-gray-400 italic text-left">
                    ${Number(fig.price).toLocaleString()}
                  </p>
                  <p className="text-[8px] text-gray-600 font-black uppercase text-left">
                    {fig.brand || 'Original'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center opacity-10 text-left">
            <TrendingUp size={48} className="mb-4 text-left" />
            <p className="font-black italic uppercase tracking-widest text-left">Empty Vault</p>
          </div>
        )}
        <div
          onClick={() => navigate('/add-figure')}
          className="flex-shrink-0 w-64 bg-blue-600/5 border border-dashed border-blue-500/20 rounded-3xl p-5 flex flex-col items-center justify-center text-center group hover:bg-blue-600/10 hover:border-blue-500/40 transition-all duration-500 cursor-pointer text-left snap-start"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform text-left">
            <Target size={24} />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest italic text-left">
            Register New
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionStream;