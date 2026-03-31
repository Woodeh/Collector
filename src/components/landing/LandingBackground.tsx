import React, { FC } from 'react';
import { motion as Motion, MotionValue } from 'framer-motion';

interface LandingBackgroundProps {
  // MotionValues derived from scroll or other transforms
  backgroundY: MotionValue<number> | number;
  floatingTextY: MotionValue<number> | number;
}

const LandingBackground: FC<LandingBackgroundProps> = ({ backgroundY, floatingTextY }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid Layer */}
      <Motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.15]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </Motion.div>

      {/* Decorative "Out-of-Focus" Background Text */}
      <Motion.div
        style={{ y: floatingTextY, opacity: 0.03 }}
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      >
        <div className="text-[15vw] font-black uppercase italic leading-none -rotate-12 translate-x-1/4">
          Secure Archive System 01
        </div>
      </Motion.div>

      {/* Deep tinted background overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10" />

      {/* Grain/Noise Overlay to fix banding */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};

export default LandingBackground;
