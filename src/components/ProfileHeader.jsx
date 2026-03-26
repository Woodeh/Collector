import React from 'react';
import { User, LogOut } from 'lucide-react';
import { auth } from '../firebase/config';

const ProfileHeader = ({ user, navigate }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] gap-6 shadow-2xl relative z-10 text-left">
      <div className="flex items-center gap-6 text-left">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg">
          <User size={40} className="text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-black uppercase italic text-white leading-none text-left">
            {user.displayName || user.email.split('@')[0]}
          </h1>
          <p className="text-blue-500 font-bold text-sm mt-1">{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => {
          auth.signOut();
          navigate('/login');
        }}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
};

export default ProfileHeader;
