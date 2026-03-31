import React, { FC } from 'react';

const ProfileBackground: FC = () => {
  return (
    <>
      <style>{`
        @keyframes flashlightFocus {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          33% { transform: translate(-48%, -52%) scale(1.1); opacity: 0.2; }
          66% { transform: translate(-52%, -48%) scale(0.95); opacity: 0.15; }
        }
        .center-flashlight {
          position: fixed; 
          top: 50%; 
          left: 50%; 
          width: 80vw; 
          height: 80vw;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 60%);
          filter: blur(100px); 
          z-index: 0; 
          pointer-events: none; 
          animation: flashlightFocus 12s ease-in-out infinite;
        }
        .bg-grid {
          background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black, transparent 90%);
        }
        .scanline {
          width: 100%; 
          height: 2px; 
          background: rgba(59, 130, 246, 0.1);
          position: fixed; 
          left: 0; 
          z-index: 5; 
          pointer-events: none;
          animation: scanlineMove 8s linear infinite;
        }
        @keyframes scanlineMove { 
          0% { top: -5%; } 
          100% { top: 105%; } 
        }
        
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="center-flashlight"></div>
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
      <div className="scanline"></div>
    </>
  );
};

export default ProfileBackground;
