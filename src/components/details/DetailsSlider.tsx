import React, { FC, MouseEvent } from 'react';
import { motion as Motion, AnimatePresence, Variants, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
    opacity: 0,
  }),
};

interface DetailsSliderProps {
  images: string[];
  activeImg: number;
  direction: number;
  nextSlide: (e?: MouseEvent | any) => void;
  prevSlide: (e?: MouseEvent | any) => void;
  setIsHovered: (hovered: boolean) => void;
}

const DetailsSlider: FC<DetailsSliderProps> = ({
  images,
  activeImg,
  direction,
  nextSlide,
  prevSlide,
  setIsHovered,
}) => {
  return (
    <div className="flex flex-col items-center lg:items-end w-full">
      <div
        className="relative w-full max-w-md aspect-[4/5] z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <Motion.div
            key={`glow-${activeImg}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 blur-[60px] rounded-full opacity-50 pointer-events-none scale-110"
            style={{
              background: `url(${images[activeImg]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>

        <div className="relative w-full h-full bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl z-10 group/slider">
          <AnimatePresence custom={direction} initial={false}>
            <Motion.img
              key={activeImg}
              src={images[activeImg]}
              custom={direction}
              variants={slideVariants}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info: PanInfo) => {
                if (info.offset.x > 50) prevSlide();
                else if (info.offset.x < -50) nextSlide();
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
              alt="Display"
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/5 hover:bg-blue-600 transition-all opacity-0 group-hover/slider:opacity-100 z-20 cursor-pointer"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/5 hover:bg-blue-600 transition-all opacity-0 group-hover/slider:opacity-100 z-20 cursor-pointer"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsSlider;
