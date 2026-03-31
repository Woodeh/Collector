import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeroSectionProps {
  // Using the User type from Firebase auth, or a partial if you prefer
  user: User | { displayName: string | null, email: string | null };
}

const HeroSection: FC<HeroSectionProps> = ({ user }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 md:gap-16">
      <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 lg:pt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
          Beyond The <br />
          Standard <span className="text-blue-500 animate-blink">Display</span>
        </h1>

        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] max-w-xl mx-auto lg:mx-0">
          Welcome back,{' '}
          <span className="text-white italic">
            {user.displayName || user.email?.split('@')[0] || 'Collector'}
          </span>
          . System check complete.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
          <Link
            to="/add"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
          >
            <PlusCircle size={20} /> Add New
          </Link>

          <Link
            to="/collection"
            className="bg-[#1a1a1a] border border-[#333] hover:border-white/20 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest transition-all text-center"
          >
            Shelf View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
