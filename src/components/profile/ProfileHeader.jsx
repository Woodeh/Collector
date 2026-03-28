import React from 'react';
import { Camera, Loader2, FileDown } from 'lucide-react';

const ProfileHeader = ({
  user,
  isUploading,
  handleAvatarChange,
  rank,
  count,
  onRankClick,
  onGenerateReport,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-[#333] pb-12">
      <div className="flex flex-col md:flex-row items-center gap-8 w-full lg:w-auto">
        {/* AVATAR BLOCK */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] border-2 border-[#333] bg-[#1a1a1a] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-blue-500/50 transition-all relative">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="User Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                <span className="text-gray-700 font-black text-4xl md:text-5xl uppercase italic leading-none">
                  {user?.displayName?.[0] || user?.email?.[0] || '?'}
                </span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-30">
                <Loader2 size={32} className="animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <label
            className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-blue-500 transition-all transform hover:scale-110 border border-white/10 z-20 flex items-center justify-center active:scale-95"
            title="Update Visual ID"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Camera size={16} className="text-white" />
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* USER INFO BLOCK */}
        <div className="text-center md:text-left space-y-2">
          <div className="space-y-0.5">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] italic opacity-60">
              Authorized Collector
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              {user?.displayName || user?.email?.split('@')[0]}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-blue-500/30"></div>
              <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
                {user?.email}
              </p>
            </div>
            <button
              onClick={onRankClick}
              className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#333] hover:border-blue-500/50 transition-all cursor-help group/rank"
            >
              <span
                className={`text-[9px] font-black uppercase tracking-widest italic transition-colors ${rank.color}`}
              >
                Rank: {rank.name}
              </span>
              <div className="w-24 h-1 bg-[#121212] rounded-full overflow-hidden group-hover/rank:bg-blue-900/20 transition-colors">
                <div
                  className={`h-full ${rank.bg} transition-all duration-1000`}
                  style={{ width: `${Math.min((count / rank.next) * 100, 100)}%` }}
                ></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative group/tooltip shrink-0">
        <button
          onClick={onGenerateReport}
          className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-gray-500 hover:text-white px-3 py-2 rounded-xl transition-all font-black uppercase text-[9px] tracking-widest italic group cursor-pointer"
        >
          <FileDown size={14} className="text-blue-500 group-hover:text-white transition-colors" />
          <span>Generate Report</span>
        </button>

        {/* System Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#121212] border border-blue-500/30 rounded-xl opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-top-14 pointer-events-none transition-all duration-300 whitespace-nowrap z-[100] shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <div className="flex flex-col items-center">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] italic">
              Data Export Protocol
            </p>
            <p className="text-[7px] text-gray-500 uppercase font-mono mt-0.5">
              Format: PDF / Archive_Unit
            </p>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#121212] border-r border-b border-blue-500/30 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
